import { ExtractedCart, CartCarbonEstimate, CarbonAlternative, UserStatus } from "./types";

async function getClerkToken(apiBaseUrl: string): Promise<string | null> {
  if (typeof chrome === "undefined" || !chrome.cookies) {
    return null;
  }
  try {
    const cleanUrl = apiBaseUrl.replace(/\/$/, "");
    const cookie = await chrome.cookies.get({
      url: cleanUrl,
      name: "__session",
    });
    return cookie ? cookie.value : null;
  } catch (err) {
    console.error("Error reading Clerk session cookie:", err);
    return null;
  }
}

export async function estimateCartCarbon(
  cart: ExtractedCart,
  apiBaseUrl: string
): Promise<CartCarbonEstimate> {
  const cleanBase = apiBaseUrl.replace(/\/$/, "");
  const url = `${cleanBase}/api/extension/estimate-cart`;
  const clerkToken = await getClerkToken(apiBaseUrl);
  
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (clerkToken) {
      headers["Authorization"] = `Bearer ${clerkToken}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(cart),
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error("estimateCartCarbon error:", err);
    if (err.message && err.message.includes("Failed to fetch")) {
      throw new Error("SERVER_UNREACHABLE");
    }
    throw err;
  }
}

export async function saveShoppingActivity(
  cart: ExtractedCart,
  estimate: CartCarbonEstimate,
  selectedAlternative: CarbonAlternative | null,
  apiBaseUrl: string
): Promise<{ success: boolean; log?: any }> {
  const cleanBase = apiBaseUrl.replace(/\/$/, "");
  const url = `${cleanBase}/api/extension/save-shopping-activity`;
  const clerkToken = await getClerkToken(apiBaseUrl);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (clerkToken) {
      headers["Authorization"] = `Bearer ${clerkToken}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        cart,
        estimate,
        selectedAlternative,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.error("saveShoppingActivity error:", err);
    if (err.message && err.message.includes("Failed to fetch")) {
      throw new Error("SERVER_UNREACHABLE");
    }
    throw err;
  }
}

export async function getUserStatus(apiBaseUrl: string): Promise<UserStatus> {
  const cleanBase = apiBaseUrl.replace(/\/$/, "");
  const url = `${cleanBase}/api/extension/user-status`;
  const clerkToken = await getClerkToken(apiBaseUrl);

  try {
    const headers: Record<string, string> = {};
    if (clerkToken) {
      headers["Authorization"] = `Bearer ${clerkToken}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      return { loggedIn: false };
    }
    const data = await response.json();
    return {
      loggedIn: !!data.user?.clerkId,
      email: data.user?.email || undefined,
      name: data.user?.name || undefined,
      clerkId: data.user?.clerkId || null,
    };
  } catch (err: any) {
    console.error("getUserStatus error:", err);
    return { loggedIn: false };
  }
}
