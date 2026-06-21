import { ExtractedCart, ExtractedProduct, ShoppingPageType } from "../shared/types";
import { getSiteRule } from "../shared/site-rules";

export function extractCartFromPage(pageType: ShoppingPageType): ExtractedCart {
  const storeDomain = window.location.hostname;
  const url = window.location.href;
  const products: ExtractedProduct[] = [];
  
  // 1. Site-Specific Selector Rules
  const rule = getSiteRule(storeDomain);
  if (rule) {
    const items = document.querySelectorAll(rule.cartItemSelector);
    items.forEach((item) => {
      const nameEl = item.querySelector(rule.productNameSelector);
      if (nameEl && nameEl.textContent) {
        const name = nameEl.textContent.trim();
        
        let price: number | undefined;
        if (rule.priceSelector) {
          const priceEl = item.querySelector(rule.priceSelector);
          if (priceEl && priceEl.textContent) {
            price = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ""));
          }
        }

        let quantity = 1;
        if (rule.quantitySelector) {
          const qtyEl = item.querySelector(rule.quantitySelector);
          if (qtyEl) {
            if (qtyEl instanceof HTMLSelectElement) {
              quantity = parseInt(qtyEl.value, 10) || 1;
            } else if (qtyEl instanceof HTMLInputElement) {
              quantity = parseInt(qtyEl.value, 10) || 1;
            } else {
              const qtyMatch = qtyEl.textContent?.match(/\d+/);
              if (qtyMatch) {
                quantity = parseInt(qtyMatch[0], 10) || 1;
              }
            }
          }
        }

        let imageUrl: string | undefined;
        if (rule.imageSelector) {
          const imgEl = item.querySelector(rule.imageSelector) as HTMLImageElement;
          if (imgEl) {
            imageUrl = imgEl.src || undefined;
          }
        }

        let brand: string | undefined;
        if (rule.brandSelector) {
          const brandEl = item.querySelector(rule.brandSelector);
          if (brandEl && brandEl.textContent) {
            brand = brandEl.textContent.trim();
          }
        } else {
          // Check for inline brand clues: e.g. "Brand: Levis"
          const rowText = item.textContent || "";
          const brandMatch = rowText.match(/(?:brand|by):\s*([a-zA-Z0-9\s]+)/i);
          if (brandMatch && brandMatch[1]) {
            const possibleBrand = brandMatch[1].trim().split("\n")[0].trim();
            if (possibleBrand.length > 0 && possibleBrand.length < 30) {
              brand = possibleBrand;
            }
          }
        }

        products.push({
          name,
          brand,
          price: price && !isNaN(price) ? price : undefined,
          quantity,
          imageUrl,
          storeDomain,
          source: "dom",
          confidence: "high",
        });
      }
    });
  }

  // 2. Generic DOM Fallback
  if (products.length === 0) {
    const genericItemSelectors = [
      ".cart-item", ".cart_item", ".cart-row", ".cart_row",
      ".basket-item", ".basket-row", ".bag-item", ".bag-row",
      "[class*='cart-item']", "[class*='cartItem']",
      "[class*='basket-item']", "[class*='basketItem']",
      "[data-testid*='cart-item']", "[data-product-id]",
    ];

    let rowElements: Element[] = [];
    for (const selector of genericItemSelectors) {
      const found = Array.from(document.querySelectorAll(selector));
      if (found.length > 0) {
        rowElements = found;
        break;
      }
    }

    rowElements.forEach((item) => {
      // Find product link/title
      const titleEl = item.querySelector("h3, h4, h5, a[class*='title'], a[class*='name'], [class*='title'], [class*='name']");
      let name = titleEl?.textContent?.trim() || "";

      if (!name) {
        const firstAnchor = item.querySelector("a");
        if (firstAnchor && firstAnchor.textContent) {
          name = firstAnchor.textContent.trim();
        }
      }

      // Cleanup trailing whitespace and empty elements
      if (name && name.length > 2 && !name.toLowerCase().includes("remove") && !name.toLowerCase().includes("delete")) {
        // Extract Price
        let price: number | undefined;
        const priceEl = item.querySelector("[class*='price'], [class*='amount']");
        const priceText = priceEl?.textContent || item.textContent || "";
        const currencyRegex = /[₹$£€]\s*([0-9,.]+)/;
        const priceMatch = priceText.match(currencyRegex);
        if (priceMatch && priceMatch[1]) {
          price = parseFloat(priceMatch[1].replace(/,/g, ""));
        }

        // Extract Quantity
        let quantity = 1;
        const qtyInput = item.querySelector("input[type='number'], input[name*='qty'], input[name*='quantity']") as HTMLInputElement;
        const qtySelect = item.querySelector("select") as HTMLSelectElement;
        
        if (qtyInput) {
          quantity = parseInt(qtyInput.value, 10) || 1;
        } else if (qtySelect) {
          quantity = parseInt(qtySelect.value, 10) || 1;
        } else {
          const qtyEl = item.querySelector("[class*='qty'], [class*='quantity']");
          if (qtyEl) {
            const qtyMatch = qtyEl.textContent?.match(/\d+/);
            if (qtyMatch) {
              quantity = parseInt(qtyMatch[0], 10) || 1;
            }
          }
        }

        // Image
        const imgEl = item.querySelector("img") as HTMLImageElement;
        const imageUrl = imgEl?.src || undefined;

        // Brand fallback
        let brand: string | undefined;
        const rowText = item.textContent || "";
        const brandMatch = rowText.match(/(?:brand|by):\s*([a-zA-Z0-9\s]+)/i);
        if (brandMatch && brandMatch[1]) {
          const possibleBrand = brandMatch[1].trim().split("\n")[0].trim();
          if (possibleBrand.length > 0 && possibleBrand.length < 30) {
            brand = possibleBrand;
          }
        }

        products.push({
          name,
          brand,
          price: price && !isNaN(price) ? price : undefined,
          quantity,
          imageUrl,
          storeDomain,
          source: "dom",
          confidence: "medium",
        });
      }
    });
  }

  // Subtotal scraping
  let subtotal: number | undefined;
  const subtotalEl = document.querySelector("[class*='subtotal'], [class*='cart-total'], [class*='total-price'], [class*='order-total']");
  if (subtotalEl && subtotalEl.textContent) {
    const match = subtotalEl.textContent.match(/[₹$£€]\s*([0-9,.]+)/);
    if (match && match[1]) {
      subtotal = parseFloat(match[1].replace(/,/g, ""));
    }
  }

  // Fallback subtotal calculation if subtotal wasn't found but all prices were
  if (!subtotal && products.length > 0) {
    const validPrices = products.filter(p => p.price !== undefined);
    if (validPrices.length === products.length) {
      subtotal = products.reduce((acc, p) => acc + (p.price! * p.quantity), 0);
    }
  }

  // Currency detector
  let currency: string | undefined = "INR";
  const bodyText = document.body ? document.body.innerText : "";
  const matchSym = bodyText.match(/[₹$£€]/);
  if (matchSym) {
    const sym = matchSym[0];
    if (sym === "$") currency = "USD";
    else if (sym === "£") currency = "GBP";
    else if (sym === "€") currency = "EUR";
    else if (sym === "₹") currency = "INR";
  }

  return {
    pageType,
    storeDomain,
    url,
    currency,
    subtotal: subtotal && !isNaN(subtotal) ? subtotal : undefined,
    products,
    extractedAt: new Date().toISOString(),
  };
}
