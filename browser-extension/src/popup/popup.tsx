import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { getSettings } from "../shared/storage";
import { ExtensionSettings, UserStatus } from "../shared/types";
import { Leaf, Settings, ExternalLink, Activity, CloudOff, ShieldCheck } from "lucide-react";
import "./popup.css";

function PopupApp() {
  const [settings, setSettings] = useState<ExtensionSettings | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [pageType, setPageType] = useState<string>("unknown");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    // 1. Get settings
    getSettings().then((items) => {
      setSettings(items);
      checkServer();
    });

    // 2. Query active tab details
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
        if (tab && tab.id) {
          const runFallbackUrlCheck = (urlStr: string) => {
            const url = urlStr.toLowerCase();
            if (url.includes("/dev/checkout-test") || url.includes("checkout") || url.includes("payment")) {
              setPageType("Checkout Page");
            } else if (url.includes("/dev/ecommerce-test") || url.includes("/products/") || url.includes("/p/")) {
              setPageType("Product Page");
            } else if (url.includes("cart") || url.includes("basket") || url.includes("bag")) {
              setPageType("Cart Page");
            } else {
              setPageType("No shopping page detected");
            }
          };

          chrome.tabs.sendMessage(tab.id, { type: "GET_PAGE_STATUS" }, (response) => {
            if (chrome.runtime.lastError) {
              runFallbackUrlCheck(tab.url || "");
              return;
            }
            if (response && response.success) {
              const detected = response.pageType;
              if (detected === "product") setPageType("Product Page");
              else if (detected === "cart") setPageType("Cart Page");
              else if (detected === "checkout") setPageType("Checkout Page");
              else if (detected === "order_review") setPageType("Order Review Page");
              else setPageType("No shopping page detected");
            } else {
              runFallbackUrlCheck(tab.url || "");
            }
          });
        }
      });
    }
  }, []);

  const checkServer = async () => {
    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage({ type: "GET_USER_STATUS" }, (response) => {
        if (response && response.success) {
          setServerOnline(true);
          setUserStatus(response.status);
        } else {
          setServerOnline(false);
        }
      });
    } else {
      setServerOnline(false);
    }
  };

  const handleOpenPanel = async () => {
    if (typeof chrome === "undefined" || !chrome.tabs) return;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: "TRIGGER_EXPAND" }, (_response) => {
        if (chrome.runtime.lastError) {
          setErrorMsg("Assistant not active here. Try reloading the page.");
          setTimeout(() => setErrorMsg(""), 3000);
        }
      });
    }
  };

  const handleOpenOptions = () => {
    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage({ type: "OPEN_OPTIONS" });
    }
  };

  const handleOpenDashboard = () => {
    const url = settings?.apiBaseUrl || "http://localhost:3001";
    window.open(url, "_blank");
  };

  if (!settings) {
    return <div className="popup-loading">Loading...</div>;
  }

  return (
    <div className="popup-container">
      <header className="popup-header">
        <div className="logo-group">
          <Leaf className="logo-icon" />
          <span className="logo-title">Carbon Compass</span>
        </div>
        <button className="settings-btn" onClick={handleOpenOptions} title="Settings">
          <Settings size={15} />
        </button>
      </header>

      <main className="popup-main">
        {/* Server Connection */}
        <div className="popup-card">
          <div className="card-label">Server Connection</div>
          {serverOnline === null ? (
            <div className="status-indicator">Checking...</div>
          ) : serverOnline ? (
            <div className="status-indicator online">
              <ShieldCheck size={14} className="icon-green" />
              <span>Connected to {settings.apiBaseUrl.replace(/^https?:\/\//, "")}</span>
            </div>
          ) : (
            <div className="status-indicator offline">
              <CloudOff size={14} className="icon-red" />
              <span>App Offline</span>
            </div>
          )}

          {serverOnline === false && (
            <p className="offline-notice">
              Start your local Next.js app at <code>{settings.apiBaseUrl}</code>.
            </p>
          )}
        </div>

        {/* Current page type */}
        {serverOnline && (
          <div className="popup-card">
            <div className="card-label">Current Page</div>
            <div className="page-status">
              <strong>{pageType}</strong>
            </div>
            {pageType !== "No shopping page detected" && (
              <button className="action-btn-primary" onClick={handleOpenPanel} style={{ marginTop: "10px" }}>
                <Activity size={14} />
                <span>Open Carbon Panel</span>
              </button>
            )}
            {errorMsg && <div className="popup-error">{errorMsg}</div>}
          </div>
        )}

        {/* User Account */}
        {serverOnline && userStatus && (
          <div className="popup-card">
            <div className="card-label">Carbon Compass Account</div>
            {userStatus.loggedIn ? (
              <div className="user-info">
                <span className="user-name">Signed in: {userStatus.name || userStatus.email}</span>
              </div>
            ) : (
              <div className="user-info anonymous">
                <span>Not signed in</span>
                <button className="action-btn-secondary" onClick={handleOpenDashboard} style={{ marginTop: "6px" }}>
                  <ExternalLink size={12} />
                  <span>Open web app to sign in</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="popup-footer">
        <button className="footer-link-btn" onClick={handleOpenDashboard}>
          <ExternalLink size={12} />
          <span>Open Dashboard</span>
        </button>
      </footer>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<PopupApp />);
}
