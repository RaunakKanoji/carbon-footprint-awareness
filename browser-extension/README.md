# Carbon Compass Shopping Assistant - Chrome Extension Local Setup

This browser extension connects to the local Carbon Compass Next.js app to help users check the carbon footprint of products they are buying online, highlighting top emission items and recommending sustainable alternatives before checking out.

---

## Installation & Setup

### Step 1: Start the Carbon Compass Web Application
Make sure the main Carbon Compass application is running locally. From the root directory:

```bash
npm run dev
```

Confirm that the application is accessible on:
* **`http://localhost:3001`**

### Step 2: Build the Chrome Extension
Navigate into the extension subdirectory, install packages, and compile the bundle:

```bash
cd browser-extension
npm install
npm run build
```

This compiles typescript assets and creates the unpacked production build directory under:
* **`browser-extension/dist/`**

### Step 3: Load the Extension in Google Chrome
1. Open Google Chrome.
2. Navigate to the extensions manager page: **`chrome://extensions/`**
3. In the top-right corner, toggle **Developer mode** to **ON**.
4. Click the **Load unpacked** button in the top-left corner.
5. In the file explorer, select the compiled **`browser-extension/dist`** folder.
6. The *Carbon Compass Shopping Assistant* will appear in your active extensions list. Pin it to your browser toolbar for quick status access.

---

## Verifying locally

We have created developer mock pages inside Carbon Compass to test the extension's extraction and panel overlays:

### 1. Test Product details Page
Visit:
* **`http://localhost:3001/dev/ecommerce-test`**

You should see a floating leaf trigger in the bottom-right corner that reads **"Cart Impact Ready"**. Clicking it opens the details sidebar with the product's carbon information and GOTS certified organic cotton alternatives.

### 2. Test Checkout Page
Visit:
* **`http://localhost:3001/dev/checkout-test`**

You should see a prominent (but non-blocking) modal banner that reads **"Before you checkout"**, presenting the total footprint of the items in the cart (Jeans, Sneakers, T-Shirts) and identifying the highest impact contributor. Clicking **"Review Impact"** opens the sidebar.

### 3. Log purchases
On the sidebar panel, click **"Save to Carbon Compass"**. If you are logged in (or using the local dev account bypass), the extension will save the log. Open the Carbon Compass dashboard to verify the log is present in the main Activity Log.
