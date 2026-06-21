import { getSettings } from "../shared/storage";
import { estimateCartCarbon, saveShoppingActivity, getUserStatus } from "../shared/api-client";
import { ExtractedCart, CartCarbonEstimate, CarbonAlternative } from "../shared/types";

// Helper for caching estimates in session storage to avoid redundant calls
async function getCachedEstimate(url: string, products: any[]): Promise<CartCarbonEstimate | null> {
  if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.session) {
    return null;
  }
  try {
    const cleanUrl = url.split("?")[0]; // ignore query parameters for general cart caching
    const key = `cache_${cleanUrl}`;
    const result = await chrome.storage.session.get(key);
    const cached = result[key];
    const currentHash = JSON.stringify(products);
    
    if (cached && cached.cartHash === currentHash && (Date.now() - cached.createdAt < 5 * 60 * 1000)) {
      return cached.estimate as CartCarbonEstimate;
    }
  } catch (err) {
    console.error("Failed to read from session cache:", err);
  }
  return null;
}

async function setCachedEstimate(url: string, products: any[], estimate: CartCarbonEstimate): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.session) {
    return;
  }
  try {
    const cleanUrl = url.split("?")[0];
    const key = `cache_${cleanUrl}`;
    const hash = JSON.stringify(products);
    await chrome.storage.session.set({
      [key]: {
        url: cleanUrl,
        cartHash: hash,
        estimate,
        createdAt: Date.now(),
      },
    });
  } catch (err) {
    console.error("Failed to write to session cache:", err);
  }
}

// Service worker message router
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || !message.type) return false;

  (async () => {
    try {
      const settings = await getSettings();

      switch (message.type) {
        case "ESTIMATE_CART": {
          const cart = message.cart as ExtractedCart;
          if (!cart || !cart.products || cart.products.length === 0) {
            sendResponse({ success: false, error: "NO_PRODUCTS" });
            return;
          }

          // Check Cache
          const cached = await getCachedEstimate(cart.url, cart.products);
          if (cached) {
            sendResponse({ success: true, estimate: cached, cached: true });
            return;
          }

          // Fetch fresh estimate
          const estimate = await estimateCartCarbon(cart, settings.apiBaseUrl);
          await setCachedEstimate(cart.url, cart.products, estimate);
          sendResponse({ success: true, estimate });
          break;
        }

        case "SAVE_SHOPPING_ACTIVITY": {
          const cart = message.cart as ExtractedCart;
          const estimate = message.estimate as CartCarbonEstimate;
          const selectedAlternative = message.selectedAlternative as CarbonAlternative | null;

          const result = await saveShoppingActivity(cart, estimate, selectedAlternative, settings.apiBaseUrl);
          sendResponse({ success: true, data: result });
          break;
        }

        case "GET_USER_STATUS": {
          const status = await getUserStatus(settings.apiBaseUrl);
          sendResponse({ success: true, status });
          break;
        }

        case "GET_SETTINGS": {
          sendResponse({ success: true, settings });
          break;
        }

        case "OPEN_OPTIONS": {
          chrome.runtime.openOptionsPage();
          sendResponse({ success: true });
          break;
        }

        default:
          sendResponse({ success: false, error: "UNKNOWN_MESSAGE_TYPE" });
      }
    } catch (err: any) {
      console.error(`Error handling message of type ${message.type}:`, err);
      sendResponse({ 
        success: false, 
        error: err.message || "UNKNOWN_ERROR" 
      });
    }
  })();

  return true; // Keep the message channel open for async response
});
