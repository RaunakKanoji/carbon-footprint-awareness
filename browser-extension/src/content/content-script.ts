import React from "react";
import { createRoot } from "react-dom/client";
import { detectShoppingPage } from "./page-detector";
import { extractProductFromPage } from "./product-extractor";
import { extractCartFromPage } from "./cart-extractor";
import { CarbonOverlay } from "./overlay";
import { ExtractedCart } from "../shared/types";
import "./overlay.css";

let currentRoot: any = null;
let shadowHost: HTMLDivElement | null = null;
let lastCartJson = "";

async function runExtension() {
  try {
    // 0. Sync credentials from same-origin Next.js app to extension storage
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      try {
        const response = await fetch("/api/extension/user-status");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            await chrome.storage.sync.set({ dbUserId: data.user.id, userName: data.user.name });
          } else {
            await chrome.storage.sync.remove(["dbUserId", "userName"]);
          }
        } else {
          await chrome.storage.sync.remove(["dbUserId", "userName"]);
        }
      } catch (err) {
        console.error("Credentials sync error:", err);
      }
      
      // If we are not on a sandbox/test path, do not render overlay triggers or badges on the dashboard
      if (!window.location.pathname.startsWith("/dev/")) {
        return;
      }
    }

    // 1. Detect page type
    const pageType = detectShoppingPage();
    if (pageType === "unknown") return;

    // 2. Fetch settings from background service worker
    const settingsResponse = await new Promise<any>((resolve) => {
      if (typeof chrome === "undefined" || !chrome.runtime) {
        resolve(null);
        return;
      }
      chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (response) => {
        resolve(response);
      });
    });

    if (!settingsResponse || !settingsResponse.success || !settingsResponse.settings) {
      return;
    }

    const settings = settingsResponse.settings;

    // 3. Verify toggles
    if (pageType === "product" && !settings.enableOnProductPages) return;
    if (pageType === "cart" && !settings.enableOnCartPages) return;
    if (pageType === "checkout" && !settings.enableOnCheckoutPages) return;

    // 4. Extract products or cart details
    let cart: ExtractedCart;
    if (pageType === "product") {
      const prod = extractProductFromPage();
      if (!prod) return;
      cart = {
        pageType,
        storeDomain: window.location.hostname,
        url: window.location.href,
        products: [prod],
        extractedAt: new Date().toISOString(),
      };
    } else {
      cart = extractCartFromPage(pageType);
    }

    if (!cart.products || cart.products.length === 0) {
      return;
    }

    // Performance protection: check if cart items changed before sending API request
    const cartJson = JSON.stringify(cart.products);
    if (cartJson === lastCartJson) {
      return;
    }
    lastCartJson = cartJson;

    // 5. Query Background Service Worker for estimate
    chrome.runtime.sendMessage({ type: "ESTIMATE_CART", cart }, (response) => {
      let serverOffline = false;
      let estimate = null;

      if (response) {
        if (response.success) {
          estimate = response.estimate;
        } else if (response.error === "SERVER_UNREACHABLE") {
          serverOffline = true;
        }
      } else {
        serverOffline = true;
      }

      renderOverlay(cart, estimate, serverOffline);
    });
  } catch (err) {
    console.error("Carbon Compass Content Script Error:", err);
  }
}

function renderOverlay(cart: ExtractedCart, estimate: any, serverOffline: boolean) {
  if (typeof document === "undefined") return;

  // Create shadow host container if not already exists
  if (!shadowHost) {
    shadowHost = document.createElement("div");
    shadowHost.id = "carbon-compass-shadow-host";
    
    // Support non-blocking container layout
    shadowHost.style.position = "static";
    shadowHost.style.zIndex = "2147483647";
    document.body.appendChild(shadowHost);

    const shadowRoot = shadowHost.attachShadow({ mode: "open" });

    // Link extension-compiled CSS stylesheet (web-accessible content.css)
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = chrome.runtime.getURL("content.css");
    shadowRoot.appendChild(styleLink);

    const innerDiv = document.createElement("div");
    innerDiv.id = "carbon-overlay-react-root";
    shadowRoot.appendChild(innerDiv);

    currentRoot = createRoot(innerDiv);
  }

  // Render the overlay panel/badge
  currentRoot.render(
    React.createElement(CarbonOverlay, {
      cart,
      estimate,
      serverOffline,
    })
  );
}

// 6. Monitor dynamic DOM additions (AJAX shopping cart sliders, quantity updates)
let debounceTimer: any = null;
const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    runExtension();
  }, 1200); // 1.2s debounce to guard performance
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Listen for popup messages to trigger expanding the panel or report page state
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message && message.type === "TRIGGER_EXPAND") {
    const event = new CustomEvent("carbon-compass-open");
    window.dispatchEvent(event);
    sendResponse({ success: true });
  } else if (message && message.type === "GET_PAGE_STATUS") {
    const pageType = detectShoppingPage();
    let productCount = 0;
    try {
      if (pageType === "cart" || pageType === "checkout") {
        const cart = extractCartFromPage(pageType);
        productCount = cart.products ? cart.products.length : 0;
      } else if (pageType === "product") {
        const prod = extractProductFromPage();
        productCount = prod ? 1 : 0;
      }
    } catch (e) {
      console.error("Popup status check extraction error:", e);
    }
    sendResponse({ success: true, pageType, productCount });
  }
  return false;
});

// Initialize on page load
if (document.readyState === "complete" || document.readyState === "interactive") {
  runExtension();
} else {
  window.addEventListener("DOMContentLoaded", runExtension);
}
