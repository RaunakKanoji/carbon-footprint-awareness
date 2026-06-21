import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { getSettings, saveSettings } from "../shared/storage";
import { ExtensionSettings } from "../shared/types";
import { Leaf, Save, Check } from "lucide-react";
import "./options.css";

function OptionsApp() {
  const [settings, setSettings] = useState<ExtensionSettings | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    getSettings().then((items) => {
      setSettings(items);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await saveSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (!settings) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="options-container">
      <header className="options-header">
        <div className="logo-group">
          <Leaf className="logo-icon" />
          <h1>Carbon Compass Shopping Assistant</h1>
        </div>
      </header>

      <main className="options-main">
        <form onSubmit={handleSave} className="options-form">
          <div className="form-card">
            <h2>Connection</h2>
            <div className="form-group">
              <label htmlFor="apiBaseUrl">Carbon Compass API URL</label>
              <input
                type="url"
                id="apiBaseUrl"
                value={settings.apiBaseUrl}
                onChange={(e) => setSettings({ ...settings, apiBaseUrl: e.target.value })}
                required
                placeholder="http://localhost:3001"
              />
              <p className="help-text">Define the backend address of the local Carbon Compass application.</p>
            </div>
          </div>

          <div className="form-card">
            <h2>Extension Behavior</h2>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.enableOnProductPages}
                  onChange={(e) => setSettings({ ...settings, enableOnProductPages: e.target.checked })}
                />
                <div className="checkbox-info">
                  <span className="title">Enable on Product Pages</span>
                  <span className="desc">Activate shopping assistant on individual product detail screens.</span>
                </div>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.enableOnCartPages}
                  onChange={(e) => setSettings({ ...settings, enableOnCartPages: e.target.checked })}
                />
                <div className="checkbox-info">
                  <span className="title">Enable on Cart/Basket Pages</span>
                  <span className="desc">Analyze carbon factors on active cart checkout bag routes.</span>
                </div>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.enableOnCheckoutPages}
                  onChange={(e) => setSettings({ ...settings, enableOnCheckoutPages: e.target.checked })}
                />
                <div className="checkbox-info">
                  <span className="title">Enable on Checkout Review Pages</span>
                  <span className="desc">Intercept checkout screens to support mindful buying alerts.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="form-card">
            <h2>Display Preferences</h2>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.showCheckoutReminder}
                  onChange={(e) => setSettings({ ...settings, showCheckoutReminder: e.target.checked })}
                />
                <div className="checkbox-info">
                  <span className="title">Show Checkout Reminder Modal</span>
                  <span className="desc">Trigger a prominent, non-blocking check-out confirmation banner.</span>
                </div>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.showFloatingWidget}
                  onChange={(e) => setSettings({ ...settings, showFloatingWidget: e.target.checked })}
                />
                <div className="checkbox-info">
                  <span className="title">Show Floating Badge Widget</span>
                  <span className="desc">Display a small leaf trigger in the corner of active shop pages.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="actions-bar">
            <button type="submit" className="save-btn">
              <Save size={16} />
              <span>Save Configuration</span>
            </button>
            {saveSuccess && (
              <span className="success-msg">
                <Check size={14} />
                <span>Settings saved!</span>
              </span>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<OptionsApp />);
}
