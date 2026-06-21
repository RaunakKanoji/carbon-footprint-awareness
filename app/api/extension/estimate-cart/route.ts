import { NextRequest, NextResponse } from 'next/server';
import { inferCategoryByName, productCarbonFactorsKg } from '@/src/lib/extension/product-carbon-factors';

function addCorsHeaders(res: NextResponse, req: NextRequest) {
  const origin = req.headers.get('origin');
  if (origin && (origin.startsWith('chrome-extension://') || origin.includes('localhost:') || origin.includes('127.0.0.1:'))) {
    res.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    res.headers.set('Access-Control-Allow-Origin', '*');
  }
  res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  return res;
}

export async function OPTIONS(req: NextRequest) {
  const res = new NextResponse(null, { status: 204 });
  return addCorsHeaders(res, req);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { products } = body;

    if (!products || !Array.isArray(products)) {
      const res = NextResponse.json({ success: false, error: 'Invalid products data' }, { status: 400 });
      return addCorsHeaders(res, req);
    }

    let totalCo2eKg = 0;
    const estimatedProducts = [];
    let hasClothing = false;
    let hasElectronics = false;

    for (const item of products) {
      // 1. Remove potentially sensitive info
      const name = item.name ? String(item.name).trim() : 'Product';
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const price = item.price ? Number(item.price) : undefined;

      // 2. Infer category
      const category = inferCategoryByName(name, price);

      if (category.startsWith('clothing_')) hasClothing = true;
      if (category.startsWith('electronics_')) hasElectronics = true;

      // 3. Estimate carbon
      const factor = productCarbonFactorsKg[category] || 1;
      const productCo2e = Number((factor * quantity).toFixed(2));
      totalCo2eKg += productCo2e;

      // 4. Category alternatives
      const alternatives = getAlternativesForCategory(category, name, factor);

      estimatedProducts.push({
        name,
        category,
        quantity,
        estimatedCo2eKg: productCo2e,
        confidence: 'MEDIUM' as const,
        sourceLabel: 'Carbon Compass Product Engine',
        alternatives,
      });
    }

    totalCo2eKg = Number(totalCo2eKg.toFixed(2));

    // 5. Generate cart alternatives
    const cartAlternatives = getCartAlternatives(totalCo2eKg, hasClothing, hasElectronics);

    // 6. Equivalents
    const equivalents = {
      petrolCarKm: Number((totalCo2eKg / 0.28).toFixed(1)),
      phoneCharges: Math.round(totalCo2eKg / 0.021),
      treesNeeded: Number((totalCo2eKg / 1.8).toFixed(1)),
    };

    // 7. Text summary
    let summary = 'This cart impact comes mostly from product manufacturing.';
    if (hasClothing && hasElectronics) {
      summary = 'Your cart contains both manufacturing-heavy clothing and electronics.';
    } else if (hasClothing) {
      summary = 'Most of this cart impact comes from new clothing production.';
    } else if (hasElectronics) {
      summary = 'Most of this cart impact comes from electronics hardware manufacturing.';
    }

    const res = NextResponse.json({
      totalCo2eKg,
      confidence: 'MEDIUM',
      sourceLabels: ['Carbon Compass Product Engine', 'Category fallback'],
      products: estimatedProducts,
      cartAlternatives,
      equivalent: equivalents,
      summary,
    });
    return addCorsHeaders(res, req);
  } catch (error) {
    console.error('Error in POST /api/extension/estimate-cart:', error);
    const res = NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    return addCorsHeaders(res, req);
  }
}

function getAlternativesForCategory(category: string, productName: string, factorKg: number) {
  const alts = [];
  if (category.startsWith('clothing_')) {
    alts.push({
      title: 'Buy second-hand / thrifted',
      description: 'A pre-owned pair avoids up to 80% of manufacturing carbon.',
      estimatedSavingsKg: Number((factorKg * 0.8).toFixed(1)),
      actionType: 'second_hand',
    });
    alts.push({
      title: 'Delay purchase by 7 days',
      description: 'Wait to avoid impulse buys. If you still need it, purchase then.',
      estimatedSavingsKg: factorKg,
      actionType: 'delay_purchase',
    });
  } else if (category.startsWith('electronics_')) {
    alts.push({
      title: 'Buy certified refurbished',
      description: 'Refurbished electronics save up to 70% of manufacturing emissions.',
      estimatedSavingsKg: Number((factorKg * 0.7).toFixed(1)),
      actionType: 'second_hand',
    });
    alts.push({
      title: 'Repair current device',
      description: 'Keeping your existing device longer has the lowest impact.',
      estimatedSavingsKg: factorKg,
      actionType: 'repair',
    });
  } else if (category.startsWith('grocery_')) {
    if (category === 'grocery_meat') {
      alts.push({
        title: 'Choose a plant-based alternative',
        description: 'Swapping meat for plant proteins reduces agricultural emissions by up to 90%.',
        estimatedSavingsKg: Number((factorKg * 0.9).toFixed(1)),
        actionType: 'choose_plant_based',
      });
    } else {
      alts.push({
        title: 'Choose local/seasonal brands',
        description: 'Reduce shipping and storage emissions.',
        estimatedSavingsKg: Number((factorKg * 0.15).toFixed(1)),
        actionType: 'lower_impact_material',
      });
    }
  } else {
    alts.push({
      title: 'Delay purchase',
      description: 'Think it over for 7 days to make sure it is a necessary purchase.',
      estimatedSavingsKg: factorKg,
      actionType: 'delay_purchase',
    });
  }
  return alts;
}

function getCartAlternatives(totalCo2eKg: number, hasClothing: boolean, hasElectronics: boolean) {
  const alts = [];
  if (hasClothing) {
    alts.push({
      title: 'Remove one new clothing item',
      description: 'Buying one fewer new item has the biggest impact on your footprint.',
      estimatedSavingsKg: 15,
      actionType: 'buy_less',
    });
  }
  if (hasElectronics) {
    alts.push({
      title: 'Keep current device longer',
      description: 'Extending device lifetime by 1 year avoids manufacturing new hardware.',
      estimatedSavingsKg: 50,
      actionType: 'buy_less',
    });
  }
  alts.push({
    title: 'Choose slower or combined delivery',
    description: 'Opt for ground shipping or combine packages to reduce transit emissions.',
    estimatedSavingsKg: 2,
    actionType: 'slower_delivery',
  });
  return alts;
}
