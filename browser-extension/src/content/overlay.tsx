import { useState, useEffect } from "react";
import { ExtractedCart, CartCarbonEstimate, CarbonAlternative, UserStatus } from "../shared/types";
import { 
  Leaf, 
  X, 
  Check, 
  ShoppingBag, 
  AlertTriangle, 
  CloudOff, 
  ExternalLink,
  Loader2
} from "lucide-react";

interface CarbonOverlayProps {
  cart: ExtractedCart;
  estimate: CartCarbonEstimate | null;
  serverOffline: boolean;
}

export function CarbonOverlay({
  cart,
  estimate: initialEstimate,
  serverOffline: initialServerOffline
}: CarbonOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const estimate = initialEstimate;
  const serverOffline = initialServerOffline;
  const [selectedAlt, setSelectedAlt] = useState<CarbonAlternative | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [userStatus, setUserStatus] = useState<UserStatus>({ loggedIn: false });
  const [checkoutStep, setCheckoutStep] = useState<"reminder" | "normal" | "hidden">(
    cart.pageType === "checkout" ? "reminder" : "hidden"
  );

  // Check login status of the user on launch/expand
  const checkUserStatus = () => {
    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage({ type: "GET_USER_STATUS" }, (response) => {
        if (response && response.success && response.status) {
          setUserStatus(response.status);
        }
      });
    }
  };

  useEffect(() => {
    checkUserStatus();
    
    const handleOpenEvent = () => {
      setIsOpen(true);
      setCheckoutStep("hidden");
    };
    window.addEventListener("carbon-compass-open", handleOpenEvent);
    
    // Listen for ESC key to close the modal/panel
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        if (checkoutStep === "reminder") {
          setCheckoutStep("hidden");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("carbon-compass-open", handleOpenEvent);
    };
  }, [checkoutStep]);

  const handleOpenPanel = () => {
    setIsOpen(true);
    setCheckoutStep("hidden");
    checkUserStatus();
  };

  const handleSaveActivity = async () => {
    if (!estimate) return;
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      chrome.runtime.sendMessage(
        {
          type: "SAVE_SHOPPING_ACTIVITY",
          cart,
          estimate,
          selectedAlternative: selectedAlt,
        },
        (response) => {
          setIsSaving(false);
          if (response && response.success) {
            setSaveStatus("success");
            // Auto hide success toast after 3s
            setTimeout(() => {
              setSaveStatus("idle");
            }, 3000);
          } else {
            setSaveStatus("error");
          }
        }
      );
    } catch (err) {
      console.error("Save activity error:", err);
      setIsSaving(false);
      setSaveStatus("error");
    }
  };

  const handleOpenDashboard = () => {
    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage({ type: "GET_SETTINGS" }, (response) => {
        if (response && response.success && response.settings) {
          window.open(response.settings.apiBaseUrl, "_blank");
        } else {
          window.open("http://localhost:3001", "_blank");
        }
      });
    } else {
      window.open("http://localhost:3001", "_blank");
    }
  };

  // Find the highest-impact product in the cart
  const topProduct = estimate?.products?.reduce((prev, current) => {
    return prev.estimatedCo2eKg > current.estimatedCo2eKg ? prev : current;
  }, estimate.products[0]);

  // If server is offline
  if (serverOffline) {
    return (
      <>
        {/* Floating Badge Button */}
        {!isOpen && (
          <button 
            className="carbon-badge-trigger"
            onClick={handleOpenPanel}
            aria-label="Carbon Compass Shopping Assistant: Server disconnected"
          >
            <CloudOff className="carbon-badge-icon" style={{ color: "#ef4444" }} />
            <span>App Offline</span>
          </button>
        )}

        {/* Offline Sidebar Panel */}
        {isOpen && (
          <div className="carbon-panel-container">
            <div className="carbon-panel-inner">
              <div className="carbon-panel-header">
                <div className="carbon-panel-title-group">
                  <Leaf className="carbon-badge-icon" style={{ color: "#94a3b8" }} />
                  <span className="carbon-panel-title">Carbon Compass</span>
                </div>
                <button className="carbon-panel-close" onClick={() => setIsOpen(false)} aria-label="Close panel">
                  <X size={16} />
                </button>
              </div>

              <div className="carbon-panel-content">
                <div className="carbon-offline-state">
                  <CloudOff className="carbon-offline-icon" />
                  <div className="carbon-offline-title">Carbon Compass not connected</div>
                  <div className="carbon-offline-desc">
                    Start your local Next.js app at <code>http://localhost:3001</code> to run carbon footprint estimates.
                  </div>
                </div>
              </div>

              <div className="carbon-panel-footer">
                <button className="carbon-btn-secondary" onClick={handleOpenDashboard}>
                  Open Carbon Compass
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* 1. Checkout Prominent Reminder Modal */}
      {checkoutStep === "reminder" && estimate && (
        <div className="carbon-checkout-reminder-backdrop">
          <div className="carbon-checkout-reminder-card" role="dialog" aria-modal="true">
            <div className="carbon-panel-title-group">
              <Leaf className="carbon-badge-icon" />
              <span className="carbon-checkout-reminder-title">Before you checkout</span>
            </div>

            <div className="carbon-checkout-reminder-body">
              This cart is estimated at <strong style={{ color: "#065f46" }}>{estimate.totalCo2eKg} kg CO₂e</strong>.
              
              {topProduct && (
                <div style={{ marginTop: "12px", padding: "10px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  The biggest impact appears to be:<br />
                  <strong>{topProduct.name}</strong> &middot; <span style={{ color: "#b91c1c", fontWeight: 700 }}>{topProduct.estimatedCo2eKg} kg CO₂e</span>
                </div>
              )}

              <p style={{ marginTop: "12px", fontSize: "12.5px" }}>
                Try one lower-carbon option: Buy second-hand, delay delivery, or purchase fewer items to save up to 25% emissions.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <button 
                className="carbon-btn-primary" 
                style={{ flex: 1 }}
                onClick={handleOpenPanel}
              >
                Review Impact
              </button>
              <button 
                className="carbon-btn-secondary" 
                style={{ flex: 1 }}
                onClick={() => setCheckoutStep("hidden")}
              >
                Continue anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Floating Badge Trigger (Visible only when sidebar is closed and no checkout reminder is active) */}
      {!isOpen && checkoutStep === "hidden" && (
        <button 
          className="carbon-badge-trigger"
          onClick={handleOpenPanel}
          aria-label="Carbon Compass Shopping Assistant: Cart estimate ready"
        >
          <Leaf className="carbon-badge-icon" />
          <span>Cart Impact Ready</span>
        </button>
      )}

      {/* 3. Main Detailed Sidebar Panel */}
      {isOpen && estimate && (
        <div className="carbon-panel-container">
          <div className="carbon-panel-inner">
            <div className="carbon-panel-header">
              <div className="carbon-panel-title-group">
                <Leaf className="carbon-badge-icon" />
                <span className="carbon-panel-title">Carbon Compass</span>
              </div>
              <button className="carbon-panel-close" onClick={() => setIsOpen(false)} aria-label="Close panel">
                <X size={16} />
              </button>
            </div>

            <div className="carbon-panel-content">
              {/* Carbon Footprint Hero */}
              <div className="carbon-impact-hero">
                <div className="carbon-impact-label">Estimated Cart Footprint</div>
                <div className="carbon-impact-value">{estimate.totalCo2eKg} kg CO₂e</div>
                <div className={`carbon-confidence-pill ${estimate.confidence}`}>
                  {estimate.confidence === "high" && <Check size={10} />}
                  <span>{estimate.confidence.toUpperCase()} CONFIDENCE</span>
                </div>
              </div>

              {/* Top Contributors */}
              <div>
                <div className="carbon-section-title">Top Contributors</div>
                <div className="carbon-product-list">
                  {estimate.products.map((prod, idx) => (
                    <div className="carbon-product-item" key={idx}>
                      <div>
                        <span className="carbon-product-name">{prod.name}</span>
                        {prod.quantity > 1 && (
                          <span className="carbon-product-qty">x{prod.quantity}</span>
                        )}
                      </div>
                      <span className="carbon-product-co2">{prod.estimatedCo2eKg} kg</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equivalents Grid */}
              {estimate.equivalent && (
                <div>
                  <div className="carbon-section-title">Emissions Equivalent</div>
                  <div className="carbon-eq-grid">
                    <div className="carbon-eq-card">
                      <div className="carbon-eq-icon">🚗</div>
                      <div className="carbon-eq-info">
                        <span className="carbon-eq-val">{Math.round(estimate.equivalent.petrolCarKm)} km</span>
                        <span className="carbon-eq-lbl">driving a car</span>
                      </div>
                    </div>
                    <div className="carbon-eq-card">
                      <div className="carbon-eq-icon">📱</div>
                      <div className="carbon-eq-info">
                        <span className="carbon-eq-val">{Math.round(estimate.equivalent.phoneCharges)}</span>
                        <span className="carbon-eq-lbl">smartphone charges</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Alternatives List */}
              {((estimate.products[0]?.alternatives || []).length > 0 || estimate.cartAlternatives.length > 0) && (
                <div>
                  <div className="carbon-section-title">Lower-Carbon Alternatives</div>
                  <div className="carbon-alternatives-list">
                    {/* Display cart-level alternatives first, then product level */}
                    {[...estimate.cartAlternatives, ...(estimate.products[0]?.alternatives || [])].slice(0, 3).map((alt, idx) => (
                      <div 
                        className={`carbon-alternative-card ${selectedAlt?.actionType === alt.actionType ? "selected" : ""}`}
                        key={idx}
                        onClick={() => setSelectedAlt(selectedAlt?.actionType === alt.actionType ? null : alt)}
                      >
                        <div className="carbon-alt-header">
                          <span>{alt.title}</span>
                          {alt.estimatedSavingsKg && (
                            <span className="carbon-alt-savings">
                              Save ~{alt.estimatedSavingsKg} kg
                            </span>
                          )}
                        </div>
                        <div className="carbon-alt-desc">{alt.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary description */}
              {estimate.summary && (
                <div className="carbon-summary-box">
                  {estimate.summary}
                </div>
              )}
            </div>

            <div className="carbon-panel-footer">
              {saveStatus === "success" ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#ecfdf5", border: "1px solid #10b981", color: "#065f46", padding: "10px 14px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>
                  <Check size={16} style={{ color: "#10b981" }} />
                  <span>Saved to Carbon Compass!</span>
                </div>
              ) : saveStatus === "error" ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#fef2f2", border: "1px solid #f87171", color: "#991b1b", padding: "10px 14px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>
                  <AlertTriangle size={16} style={{ color: "#ef4444" }} />
                  <span>Failed to save purchase activity.</span>
                </div>
              ) : null}

              {userStatus.loggedIn ? (
                <button 
                  className="carbon-btn-primary"
                  onClick={handleSaveActivity}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={14} />
                      <span>Save to Carbon Compass</span>
                    </>
                  )}
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "11px", color: "#64748b", textAlign: "center" }}>
                    Sign into Carbon Compass to log this purchase
                  </span>
                  <button className="carbon-btn-primary" onClick={handleOpenDashboard}>
                    <ExternalLink size={14} />
                    <span>Open Carbon Compass</span>
                  </button>
                </div>
              )}

              <button className="carbon-btn-secondary" onClick={() => setIsOpen(false)}>
                Dismiss Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
