import React from 'react';

export default function EcommerceTestPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* JSON-LD Product Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Product',
            'name': 'Organic Cotton T-Shirt',
            'image': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
            'description': 'High-quality t-shirt made of 100% organic cotton, sourced locally and ethically.',
            'brand': {
              '@type': 'Brand',
              'name': 'EcoThread',
            },
            'offers': {
              '@type': 'Offer',
              'priceCurrency': 'INR',
              'price': '799',
              'availability': 'https://schema.org/InStock',
            },
          }),
        }}
      />

      <div className="grid gap-8 md:grid-cols-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
        {/* Left Column: Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100 border border-slate-100 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500"
            alt="Organic Cotton T-Shirt"
            className="h-full w-full object-cover object-center"
          />
        </div>

        {/* Right Column: Product Details */}
        <div className="flex flex-col justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">EcoThread Boutique</span>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Organic Cotton T-Shirt</h1>
            <p className="mt-3 text-2xl font-black text-slate-900">₹799</p>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <h3 className="text-sm font-bold text-slate-900">Details</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                A premium, lightweight shirt crafted from 100% GOTS certified organic cotton. Grown and harvested sustainably, minimizing carbon emission impacts.
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-bold text-slate-900">Material</h3>
              <span className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100/50">
                100% Organic Cotton
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              id="add-to-cart-btn"
              type="button"
              className="flex w-full h-11 items-center justify-center rounded-xl bg-slate-900 text-white text-sm font-black hover:bg-slate-800 transition-colors shadow-sm"
            >
              Add to cart
            </button>
            <button
              id="buy-now-btn"
              type="button"
              className="flex w-full h-11 items-center justify-center rounded-xl bg-emerald-600 text-white text-sm font-black hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
