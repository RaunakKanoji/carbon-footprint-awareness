import { NextRequest, NextResponse } from 'next/server';

function addCorsHeaders(res: NextResponse, req: NextRequest) {
  const origin = req.headers.get('origin');
  if (origin && (origin.startsWith('chrome-extension://') || origin.includes('localhost:') || origin.includes('127.0.0.1:'))) {
    res.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    res.headers.set('Access-Control-Allow-Origin', '*');
  }
  res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  return res;
}

export async function OPTIONS(req: NextRequest) {
  const res = new NextResponse(null, { status: 204 });
  return addCorsHeaders(res, req);
}

export async function GET(req: NextRequest) {
  const genericAlternatives = {
    clothing: [
      {
        title: 'Buy second-hand / thrifted',
        description: 'A pre-owned item avoids up to 80% of manufacturing carbon.',
        actionType: 'second_hand',
      },
      {
        title: 'Delay purchase by 7 days',
        description: 'Wait to avoid impulse buys. If you still need it, purchase then.',
        actionType: 'delay_purchase',
      },
      {
        title: 'Choose natural/recycled material',
        description: 'Recycled cotton or wool has a much lower carbon footprint than virgin synthetics.',
        actionType: 'lower_impact_material',
      },
    ],
    electronics: [
      {
        title: 'Buy certified refurbished',
        description: 'Refurbished electronics save up to 70% of manufacturing emissions.',
        actionType: 'second_hand',
      },
      {
        title: 'Repair current device',
        description: 'Keeping your existing device longer has the lowest impact.',
        actionType: 'repair',
      },
      {
        title: 'Choose energy-efficient model',
        description: 'Look for Energy Star or highly rated energy efficiency tags.',
        actionType: 'lower_impact_material',
      },
    ],
    grocery: [
      {
        title: 'Choose a plant-based alternative',
        description: 'Swapping meat/dairy for plant proteins reduces agricultural emissions by up to 90%.',
        actionType: 'choose_plant_based',
      },
      {
        title: 'Choose local/seasonal brands',
        description: 'Reduce shipping and cold-storage emissions.',
        actionType: 'lower_impact_material',
      },
      {
        title: 'Choose minimal packaging',
        description: 'Opt for bulk or refills to reduce packaging waste.',
        actionType: 'reduce_packaging',
      },
    ],
  };

  const res = NextResponse.json(genericAlternatives);
  return addCorsHeaders(res, req);
}
