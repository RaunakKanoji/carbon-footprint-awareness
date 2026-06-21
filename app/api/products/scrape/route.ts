/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));
}

function extractMeta(html: string, propertyOrName: string): string | null {
  const regex = new RegExp(
    `<meta[^>]*(?:property|name)=["']${propertyOrName}["'][^>]*content=["']([^"']+)["']`,
    'i'
  );
  let match = html.match(regex);
  if (!match) {
    const reverseRegex = new RegExp(
      `<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']${propertyOrName}["']`,
      'i'
    );
    match = html.match(reverseRegex);
  }
  return match ? decodeHtmlEntities(match[1]) : null;
}

interface InferredInfo {
  inferredCategory: string | null;
  inferredProductType: string | null;
  inferredMaterial: string | null;
  confidence: 'high' | 'medium' | 'low';
}

function inferFromText(title: string, description: string): InferredInfo {
  const text = `${title} ${description}`.toLowerCase();
  let category: string | null = null;
  let productType: string | null = null;
  let material: string | null = null;
  let confidence: 'high' | 'medium' | 'low' = 'low';

  // 1. Inferred Material
  if (text.includes('cotton') || text.includes('denim') || text.includes('canvas')) {
    material = 'Cotton';
  } else if (text.includes('leather')) {
    material = 'Leather';
  } else if (text.includes('polyester') || text.includes('nylon') || text.includes('acrylic')) {
    material = 'Polyester';
  } else if (text.includes('plastic') || text.includes('silicone') || text.includes('polycarbonate')) {
    material = 'Plastic';
  } else if (text.includes('metal') || text.includes('steel') || text.includes('aluminum') || text.includes('iron') || text.includes('brass')) {
    material = 'Metal';
  } else if (text.includes('glass')) {
    material = 'Glass';
  } else if (text.includes('wood') || text.includes('timber') || text.includes('bamboo') || text.includes('oak') || text.includes('pine')) {
    material = 'Wood';
  } else if (text.includes('paper') || text.includes('cardboard')) {
    material = 'Paper';
  }

  // 2. Inferred Category & Product Type
  if (text.includes('t-shirt') || text.includes('tee') || text.includes('polo')) {
    category = 'Clothing';
    productType = 'T-Shirt';
  } else if (text.includes('jeans') || text.includes('denim pants')) {
    category = 'Clothing';
    productType = 'Jeans';
  } else if (text.includes('jacket') || text.includes('coat') || text.includes('blazer') || text.includes('parka')) {
    category = 'Clothing';
    productType = 'Jacket';
  } else if (text.includes('shoes') || text.includes('sneakers') || text.includes('boots') || text.includes('footwear')) {
    category = 'Clothing';
    productType = 'Shoes';
  } else if (text.includes('dress') || text.includes('skirt')) {
    category = 'Clothing';
    productType = 'Dress';
  } else if (text.includes('sweater') || text.includes('hoodie') || text.includes('cardigan') || text.includes('pullover')) {
    category = 'Clothing';
    productType = 'Sweater';
  }
  
  else if (text.includes('phone') || text.includes('smartphone') || text.includes('mobile')) {
    category = 'Electronics';
    productType = 'Smartphone';
  } else if (text.includes('laptop') || text.includes('macbook') || text.includes('notebook pc') || text.includes('thinkpad')) {
    category = 'Electronics';
    productType = 'Laptop';
  } else if (text.includes('headphones') || text.includes('earphones') || text.includes('airpods') || text.includes('headset')) {
    category = 'Electronics';
    productType = 'Headphones';
  } else if (text.includes('tablet') || text.includes('ipad')) {
    category = 'Electronics';
    productType = 'Tablet';
  } else if (text.includes('watch') || text.includes('smartwatch') || text.includes('fitbit')) {
    category = 'Electronics';
    productType = 'Smartwatch';
  } else if (text.includes('camera') || text.includes('dslr') || text.includes('gopro')) {
    category = 'Electronics';
    productType = 'Camera';
  }

  else if (text.includes('cleaner') || text.includes('detergent') || text.includes('wash') || text.includes('disinfectant')) {
    category = 'Household';
    productType = 'Cleaning Product';
  } else if (text.includes('bottle') || text.includes('cup') || text.includes('plate') || text.includes('spoon') || text.includes('pan') || text.includes('cookware') || text.includes('mug')) {
    category = 'Household';
    productType = 'Kitchenware';
  }

  if (!category) {
    if (text.includes('skincare') || text.includes('moisturizer') || text.includes('cream') || text.includes('makeup') || text.includes('beauty')) {
      category = 'Beauty';
    } else if (text.includes('shampoo') || text.includes('soap') || text.includes('toothpaste') || text.includes('toothbrush') || text.includes('hygiene') || text.includes('deodorant')) {
      category = 'Personal Care';
    } else if (text.includes('chair') || text.includes('table') || text.includes('sofa') || text.includes('furniture') || text.includes('desk') || text.includes('cabinet') || text.includes('bed')) {
      category = 'Furniture';
    } else if (text.includes('fridge') || text.includes('refrigerator') || text.includes('washing machine') || text.includes('microwave') || text.includes('appliance')) {
      category = 'Appliances';
    } else if (text.includes('toy') || text.includes('game') || text.includes('puzzle') || text.includes('doll')) {
      category = 'Toys';
    } else if (text.includes('sport') || text.includes('fitness') || text.includes('gym') || text.includes('shoes') || text.includes('yoga') || text.includes('dumbbell')) {
      category = 'Sports';
    } else if (text.includes('book') || text.includes('novel') || text.includes('magazine') || text.includes('comic')) {
      category = 'Books';
    }
  }

  if (category && productType && material) {
    confidence = 'high';
  } else if (category && productType) {
    confidence = 'medium';
  } else if (category) {
    confidence = 'medium';
  }

  return {
    inferredCategory: category,
    inferredProductType: productType,
    inferredMaterial: material,
    confidence
  };
}

async function isSafeUrl(urlStr: string): Promise<boolean> {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const hostname = parsed.hostname;
    
    if (
      hostname.toLowerCase() === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.endsWith('.local')
    ) {
      return false;
    }

    const ips = await resolve4(hostname);
    for (const ip of ips) {
      const parts = ip.split('.').map(Number);
      if (
        parts[0] === 10 || // 10.0.0.0/8
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || // 172.16.0.0/12
        (parts[0] === 192 && parts[1] === 168) || // 192.168.0.0/16
        parts[0] === 127 || // 127.0.0.0/8
        parts[0] === 0 || // 0.0.0.0/8
        parts[0] >= 224 // Multicast / reserved
      ) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'Product URL is required' }, { status: 400 });
    }

    const isSafe = await isSafeUrl(url);
    if (!isSafe) {
      return NextResponse.json({ success: false, error: 'Enter a valid product link' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'We could not read this product page. You can still estimate it by selecting a category manually.'
      }, { status: 400 });
    }

    const html = await response.text();

    const title = extractMeta(html, 'og:title') || extractMeta(html, 'twitter:title') || (() => {
      const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      return match ? decodeHtmlEntities(match[1].trim()) : null;
    })();

    const brand = extractMeta(html, 'og:brand') || extractMeta(html, 'brand') || null;

    let price: number | null = null;
    let currency: string | null = null;

    const rawPrice = extractMeta(html, 'og:price:amount') || extractMeta(html, 'product:price:amount') || null;
    if (rawPrice) {
      const p = parseFloat(rawPrice);
      if (!isNaN(p)) price = p;
    }
    currency = extractMeta(html, 'og:price:currency') || extractMeta(html, 'product:price:currency') || null;

    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let jsonLdMatch;
    while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(jsonLdMatch[1].trim());
        let prod: any = null;
        if (parsed && (parsed['@type'] === 'Product' || parsed['@type']?.includes?.('Product'))) {
          prod = parsed;
        } else if (parsed && Array.isArray(parsed)) {
          prod = parsed.find(item => item['@type'] === 'Product' || item['@type']?.includes?.('Product'));
        } else if (parsed && parsed['@graph'] && Array.isArray(parsed['@graph'])) {
          prod = parsed['@graph'].find((item: any) => item['@type'] === 'Product' || item['@type']?.includes?.('Product'));
        }

        if (prod) {
          const inferredBrand = typeof prod.brand === 'string' ? prod.brand : prod.brand?.name || null;
          if (inferredBrand && !brand) {
            // Keep inferred brand
          }
          if (prod.offers) {
            const offer = Array.isArray(prod.offers) ? prod.offers[0] : prod.offers;
            if (offer && offer.price && !price) {
              price = parseFloat(offer.price);
            }
            if (offer && offer.priceCurrency && !currency) {
              currency = offer.priceCurrency;
            }
          }
        }
      } catch {
        // ignore JSON-LD parsing errors
      }
    }

    const description = extractMeta(html, 'og:description') || extractMeta(html, 'description') || '';
    const imageUrl = extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image') || null;

    const sourceDomain = new URL(url).hostname.replace('www.', '');

    const inference = inferFromText(title || '', description);

    return NextResponse.json({
      success: true,
      data: {
        title: title || null,
        brand: brand || null,
        price: price || null,
        currency: currency || null,
        imageUrl: imageUrl || null,
        description: description.substring(0, 200) || null,
        sourceDomain,
        inferredCategory: inference.inferredCategory,
        inferredProductType: inference.inferredProductType,
        inferredMaterial: inference.inferredMaterial,
        confidence: inference.confidence,
      }
    });

  } catch {
    return NextResponse.json({
      success: false,
      error: 'We could not read this product page. You can still estimate it by selecting a category manually.'
    }, { status: 400 });
  }
}
