import React from 'react';

export default function CheckoutTestPage() {
  const cartItems = [
    {
      id: 'item-1',
      name: 'Denim Jeans',
      brand: 'Levis',
      price: 2499,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=200',
    },
    {
      id: 'item-2',
      name: 'Sneakers',
      brand: 'EcoStep',
      price: 3999,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200',
    },
    {
      id: 'item-3',
      name: 'Cotton T-Shirt',
      brand: 'BasicWear',
      price: 799,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200',
    },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6">
        <span className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">Checkout Dev Sandbox</span>
        <h1 className="text-3xl font-black text-slate-900 mt-2">Shopping Cart</h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Cart List */}
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="cart-item flex gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs"
              data-product-id={item.id}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.name}
                className="h-20 w-20 rounded-xl object-cover border border-slate-100 shrink-0"
              />
              <div className="flex flex-1 flex-col justify-between min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="item-title text-base font-black text-slate-900 truncate">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Brand: {item.brand}</p>
                  </div>
                  <p className="price text-base font-black text-slate-900">₹{item.price}</p>
                </div>
                <div className="flex justify-between items-center text-xs mt-2">
                  <p className="text-slate-500">
                    Quantity: <span className="quantity font-bold text-slate-900">{item.quantity}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs h-fit space-y-6">
          <h2 className="text-lg font-black text-slate-900">Order Summary</h2>

          <div className="space-y-3.5 text-sm border-b border-slate-100 pb-5">
            <div className="flex justify-between text-slate-600">
              <span>Items Total</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="text-emerald-600 font-bold">FREE</span>
            </div>
          </div>

          <div className="flex justify-between items-center font-black text-base text-slate-900 pt-1">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <button
            id="proceed-checkout-btn"
            type="button"
            className="flex w-full h-11 items-center justify-center rounded-xl bg-emerald-600 text-white text-sm font-black hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
