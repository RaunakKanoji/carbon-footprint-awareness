export interface SiteRule {
  cartItemSelector: string;
  productNameSelector: string;
  priceSelector?: string;
  quantitySelector?: string;
  brandSelector?: string;
  imageSelector?: string;
}

export const siteRules: Record<string, SiteRule> = {
  "localhost:3001": {
    cartItemSelector: ".cart-item",
    productNameSelector: ".item-title",
    priceSelector: ".price",
    quantitySelector: ".quantity",
    imageSelector: "img",
  },
  "127.0.0.1:3001": {
    cartItemSelector: ".cart-item",
    productNameSelector: ".item-title",
    priceSelector: ".price",
    quantitySelector: ".quantity",
    imageSelector: "img",
  },
  "amazon.": {
    cartItemSelector: "[data-name='Active Items'] .sc-list-item, .sc-list-item",
    productNameSelector: ".sc-product-title, .a-size-medium.sc-product-title",
    priceSelector: ".sc-product-price, .sc-price",
    quantitySelector: "select[name='quantity'], .a-dropdown-prompt",
    imageSelector: "img.sc-product-image",
  },
  "flipkart.com": {
    cartItemSelector: "._2-g36E, ._1AtVbE, ._35KyD6",
    productNameSelector: "._2Kn22P, ._1WpvJ7",
    priceSelector: "._35KyD6, ._1vC4sE",
    quantitySelector: "._3dYPPy",
  },
  "myntra.com": {
    cartItemSelector: ".itemContainer-base-item",
    productNameSelector: ".itemContainer-base-itemLink",
    brandSelector: ".itemContainer-base-brand",
    priceSelector: ".itemComponents-base-price, .itemContainer-base-discountedPrice",
  },
  "ajio.com": {
    cartItemSelector: ".cart-item, .item-container",
    productNameSelector: ".product-name, .name",
    brandSelector: ".brand-name, .brand",
    priceSelector: ".price-value, .price",
  },
};

export function getSiteRule(hostname: string): SiteRule | null {
  const keys = Object.keys(siteRules);
  for (const key of keys) {
    if (hostname.includes(key)) {
      return siteRules[key];
    }
  }
  return null;
}
