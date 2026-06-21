export type ShoppingPageType =
  | "product"
  | "cart"
  | "checkout"
  | "order_review"
  | "unknown";

export interface ExtractedProduct {
  id?: string;
  name: string;
  brand?: string;
  category?: string;
  quantity: number;
  price?: number;
  currency?: string;
  imageUrl?: string;
  productUrl?: string;
  storeDomain: string;
  source: "dom" | "json_ld" | "meta" | "manual";
  confidence: "high" | "medium" | "low";
}

export interface ExtractedCart {
  pageType: ShoppingPageType;
  storeDomain: string;
  url: string;
  currency?: string;
  subtotal?: number;
  products: ExtractedProduct[];
  extractedAt: string;
}

export interface CarbonAlternative {
  title: string;
  description: string;
  estimatedSavingsKg?: number;
  actionType:
    | "buy_less"
    | "delay_purchase"
    | "second_hand"
    | "repair"
    | "lower_impact_material"
    | "local_pickup"
    | "slower_delivery"
    | "combine_delivery"
    | "reduce_packaging"
    | "choose_refill"
    | "choose_plant_based"
    | "recycle_old_item";
}

export interface CartCarbonEstimate {
  totalCo2eKg: number;
  confidence: "high" | "medium" | "low";
  sourceLabels: string[];
  products: {
    name: string;
    category?: string;
    quantity: number;
    estimatedCo2eKg: number;
    confidence: "high" | "medium" | "low";
    sourceLabel: string;
    alternatives: CarbonAlternative[];
  }[];
  cartAlternatives: CarbonAlternative[];
  equivalent: {
    petrolCarKm: number;
    phoneCharges: number;
    treesNeeded?: number;
  };
  summary: string;
}

export interface ExtensionSettings {
  apiBaseUrl: string;
  enableOnProductPages: boolean;
  enableOnCartPages: boolean;
  enableOnCheckoutPages: boolean;
  showCheckoutReminder: boolean;
  showFloatingWidget: boolean;
}

export interface UserStatus {
  loggedIn: boolean;
  email?: string;
  name?: string;
  clerkId?: string | null;
}
