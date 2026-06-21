import { ExtensionSettings } from "./types";

const DEFAULT_SETTINGS: ExtensionSettings = {
  apiBaseUrl: "http://localhost:3001",
  enableOnProductPages: true,
  enableOnCartPages: true,
  enableOnCheckoutPages: true,
  showCheckoutReminder: true,
  showFloatingWidget: true,
};

export async function getSettings(): Promise<ExtensionSettings> {
  if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.sync) {
    return DEFAULT_SETTINGS;
  }
  try {
    const result = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    return result as ExtensionSettings;
  } catch (err) {
    console.error("Error reading settings from chrome.storage:", err);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Partial<ExtensionSettings>): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.sync) {
    return;
  }
  try {
    await chrome.storage.sync.set(settings);
  } catch (err) {
    console.error("Error saving settings to chrome.storage:", err);
  }
}
