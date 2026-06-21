import { ExtractedProduct } from "../shared/types";
import { getSiteRule } from "../shared/site-rules";

export function extractProductFromPage(): ExtractedProduct | null {
  const storeDomain = window.location.hostname;
  const productUrl = window.location.href;

  // 1. JSON-LD Product Schema (High Confidence)
  const jsonLdScripts = document.querySelectorAll("script[type='application/ld+json']");
  for (const script of Array.from(jsonLdScripts)) {
    try {
      const content = script.textContent || "";
      if (!content.trim()) continue;
      const data = JSON.parse(content);
      
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        // Handle nested @graph structures
        const graphItems = item["@graph"] && Array.isArray(item["@graph"]) ? item["@graph"] : [item];
        
        for (const candidate of graphItems) {
          const type = candidate["@type"] || candidate["type"];
          if (type === "Product") {
            const name = candidate.name;
            if (name) {
              const brand = typeof candidate.brand === "object" ? candidate.brand.name : candidate.brand;
              const imageUrl = Array.isArray(candidate.image) ? candidate.image[0] : candidate.image;
              let price: number | undefined;
              let currency: string | undefined;

              if (candidate.offers) {
                const offer = Array.isArray(candidate.offers) ? candidate.offers[0] : candidate.offers;
                if (offer) {
                  const rawPrice = offer.price || offer.lowPrice || offer.highPrice;
                  price = rawPrice ? parseFloat(String(rawPrice).replace(/[^0-9.]/g, "")) : undefined;
                  currency = offer.priceCurrency || undefined;
                }
              }

              return {
                name: String(name).trim(),
                brand: brand ? String(brand).trim() : undefined,
                imageUrl: imageUrl ? String(imageUrl).trim() : undefined,
                price: price && !isNaN(price) ? price : undefined,
                currency: currency ? String(currency).trim() : undefined,
                quantity: 1,
                productUrl,
                storeDomain,
                source: "json_ld",
                confidence: "high",
              };
            }
          }
        }
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }

  // 2. OpenGraph/Twitter Meta Tags (Medium Confidence)
  const ogTitle = document.querySelector("meta[property='og:title']");
  const ogImage = document.querySelector("meta[property='og:image']");
  const metaPrice = document.querySelector("meta[property='product:price:amount'], meta[name='twitter:data1']");
  const metaCurrency = document.querySelector("meta[property='product:price:currency']");
  const ogBrand = document.querySelector("meta[property='product:brand']");

  if (ogTitle && ogTitle.getAttribute("content")) {
    const name = ogTitle.getAttribute("content")!.trim();
    if (name.length > 3) {
      const imageUrl = ogImage ? ogImage.getAttribute("content") || undefined : undefined;
      const rawPrice = metaPrice ? metaPrice.getAttribute("content") || "" : "";
      const priceVal = parseFloat(rawPrice.replace(/[^0-9.]/g, ""));
      const currencyVal = metaCurrency ? metaCurrency.getAttribute("content") || undefined : undefined;
      const brandVal = ogBrand ? ogBrand.getAttribute("content") || undefined : undefined;

      return {
        name,
        brand: brandVal ? String(brandVal).trim() : undefined,
        imageUrl: imageUrl ? String(imageUrl).trim() : undefined,
        price: isNaN(priceVal) ? undefined : priceVal,
        currency: currencyVal ? String(currencyVal).trim() : undefined,
        quantity: 1,
        productUrl,
        storeDomain,
        source: "meta",
        confidence: "medium",
      };
    }
  }

  // 3. Site-Specific Rules
  const rule = getSiteRule(storeDomain);
  if (rule) {
    const titleEl = document.querySelector(rule.productNameSelector);
    if (titleEl && titleEl.textContent) {
      const name = titleEl.textContent.trim();
      let price: number | undefined;
      let brand: string | undefined;

      if (rule.priceSelector) {
        const priceEl = document.querySelector(rule.priceSelector);
        if (priceEl && priceEl.textContent) {
          price = parseFloat(priceEl.textContent.replace(/[^0-9.]/g, ""));
        }
      }

      if (rule.brandSelector) {
        const brandEl = document.querySelector(rule.brandSelector);
        if (brandEl && brandEl.textContent) {
          brand = brandEl.textContent.trim();
        }
      }

      return {
        name,
        brand,
        quantity: 1,
        price: price && !isNaN(price) ? price : undefined,
        productUrl,
        storeDomain,
        source: "dom",
        confidence: "medium",
      };
    }
  }

  // 4. Generic H1 Fallback (Low Confidence)
  const h1 = document.querySelector("h1");
  if (h1 && h1.textContent && h1.textContent.trim().length > 3) {
    const name = h1.textContent.trim();
    // Exclude common page titles
    const ignoreList = ["cart", "shopping cart", "checkout", "basket", "bag", "my bag", "payment", "login", "register"];
    if (!ignoreList.some(term => name.toLowerCase().includes(term))) {
      return {
        name,
        quantity: 1,
        productUrl,
        storeDomain,
        source: "dom",
        confidence: "low",
      };
    }
  }

  return null;
}
