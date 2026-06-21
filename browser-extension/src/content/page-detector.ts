import { ShoppingPageType } from "../shared/types";

export function detectShoppingPage(): ShoppingPageType {
  const url = window.location.href.toLowerCase();

  // 1. Direct path matches for development test pages
  if (url.includes("/dev/checkout-test")) {
    return "checkout";
  }
  if (url.includes("/dev/ecommerce-test")) {
    return "product";
  }

  // 2. Active DOM Check for Open Cart Drawers (Critical for SPAs like Blinkit/Zepto)
  const bodyText = document.body ? document.body.innerText.toLowerCase() : "";
  
  const hasVisibleCartDrawer = 
    bodyText.includes("my cart") || 
    bodyText.includes("your cart") || 
    bodyText.includes("shopping cart") ||
    bodyText.includes("shopping bag") ||
    bodyText.includes("shopping basket") ||
    bodyText.includes("cart subtotal") ||
    bodyText.includes("items in cart");

  const hasCartItems = !!document.querySelector(
    ".cart-item, .cart_item, .cart-row, [class*='cart-item'], [class*='cartItem'], [class*='basket-item'], [class*='bag-item'], [class*='CartItem'], [class*='ItemContainer']"
  );

  if (hasVisibleCartDrawer && hasCartItems) {
    if (
      url.includes("/checkout") ||
      url.includes("/payment") ||
      bodyText.includes("select address and pay") ||
      bodyText.includes("proceed to pay")
    ) {
      return "checkout";
    }
    return "cart";
  }

  // 3. Checkout page signals (URL based)
  if (
    url.includes("/checkout") ||
    url.includes("/payment") ||
    url.includes("/place-order") ||
    url.includes("/placeorder") ||
    url.includes("/review-order")
  ) {
    return "checkout";
  }

  // 4. Cart page signals (URL based)
  if (
    url.includes("/cart") ||
    url.includes("/basket") ||
    url.includes("/bag") ||
    url.includes("/my-bag") ||
    url.includes("/shopping-cart") ||
    url.includes("/checkout/cart")
  ) {
    return "cart";
  }

  // 5. Dom text search (debounced or checked once at idle)
  // Prominent checkout button indicator
  if (
    bodyText.includes("proceed to checkout") ||
    bodyText.includes("place order") ||
    bodyText.includes("proceed to pay")
  ) {
    // If we have checkout buttons but the URL matches cart, prioritize cart
    if (url.includes("cart") || url.includes("basket") || url.includes("bag")) {
      return "cart";
    }
    return "checkout";
  }

  // 6. Product page signals
  const hasAddButtons =
    bodyText.includes("add to cart") ||
    bodyText.includes("add to bag") ||
    bodyText.includes("buy now") ||
    bodyText.includes("add to basket") ||
    !!document.querySelector("script[type='application/ld+json']");

  const isProductUrl = 
    url.includes("/dp/") || // Amazon product
    url.includes("/p/") ||  // Ajio / Flipkart
    url.includes("/product/") ||
    url.includes("/products/");

  if (isProductUrl || hasAddButtons) {
    return "product";
  }

  return "unknown";
}
