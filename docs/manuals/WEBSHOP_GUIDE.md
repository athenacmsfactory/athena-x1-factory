# Athena V10.1 Webshop: Developer & User Manual

Welcome to the **Athena Dual-Track Webshop System**. This manual provides detailed instructions on how to use, install, and connect your webshop with **Stripe**, **Mollie**, and **Firebase**.

---

## 1. Overview & Architecture

The Athena V10.1 Webshop is a "Unified" system that allows you to deploy a high-end eCommerce experience with a choice of two payment providers, while keeping a standardized customer database.

### Key Components:
- **Blueprints**: `webshop-stripe` or `webshop-mollie`.
- **Database**: **Firebase Firestore** for orders (`orders/` collection).
- **Authentication**: **Firebase Auth** for the customer database.
- **Payments**: **Stripe Checkout** or **Mollie Redirects**.
- **Logic**: A provider-agnostic `shop-logic.js` in the skeleton.

---

## 2. Prerequisites

Before you begin, ensure you have the following accounts and credentials ready:

### A. Firebase (Customer DB & Orders)
1. Create a project at [console.firebase.google.com](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password).
3. Enable **Cloud Firestore** and create an `orders` collection.
4. Copy your Web App Configuration (API Key, Project ID, etc.).

### B. Payment Provider
- **For Stripe**: Get your `Publishable Key` and `Secret Key` from the [Stripe Dashboard](https://dashboard.stripe.com/).
- **For Mollie**: Get your `Test API Key` or `Live API Key` from the [Mollie Dashboard](https://www.mollie.com/dashboard).

---

## 3. Installation Guide

Deploying a new webshop is handled via the Athena CLI.

### Step 1: Choose Your Sitetype
Decide which payment gateway you want to use:
- **`webshop-stripe`**: Recommended for global reach.
- **`webshop-mollie`**: Recommended for Benelux (iDEAL, Bancontact).

### Step 2: Generate the Site
Run the following command in your terminal:

```bash
node 6-utilities/generate-site.js <jouw-shop-naam> <sitetype>
```

*Example:* `node 6-utilities/generate-site.js my-tech-store webshop-stripe`

---

## 4. Configuration (.env)

After generation, navigate to your site directory and locate the `.env` file. Fill in your credentials:

### Firebase General
```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### Payment Provider (Specific to your track)
```env
# If using webshop-stripe:
VITE_PAYMENT_GATEWAY=stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# If using webshop-mollie:
VITE_PAYMENT_GATEWAY=mollie
VITE_MOLLIE_API_KEY=test_...
```

---

## 5. Connecting the Backend

The webshop uses the **[payment-processor.js](file:///home/kareltestspecial/0-IT/4-pj/x-v9/athena/factory/5-engine/logic/payment-processor.js)** utility to handle secure transaction signing.

To connect your frontend to a live payment session:
1. Ensure your backend server (Node.js) imports `PaymentProcessor`.
2. Configure it with your **Secret Key** (never store secrets in the frontend!).
3. Call `processor.createSession()` when the user clicks "Checkout".

---

## 6. Frontend Customization

You can customize the "WOW" factor of your shop using the built-in React components:

- **[CustomerProfile.jsx](file:///home/kareltestspecial/0-IT/4-pj/x-v9/athena/factory/2-templates/skeletons/webshop/components/CustomerProfile.jsx)**: Edit this to add custom profile fields or branding.
- **[OrderPreview.jsx](file:///home/kareltestspecial/0-IT/4-pj/x-v9/athena/factory/2-templates/skeletons/webshop/components/OrderPreview.jsx)**: Change the styling of the pre-checkout summary modal.
- **[shop-logic.js](file:///home/kareltestspecial/0-IT/4-pj/x-v9/athena/factory/2-templates/skeletons/webshop/logic/shop-logic.js)**: Modify this if you need to add custom order logging or analytics events.

---

## 7. Troubleshooting

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| **Redirect fails** | Incorrect Provider in `.env` | Ensure `VITE_PAYMENT_GATEWAY` matches the blueprint. |
| **Orders not in DB** | Firestore Permissions | Check your Firestore Security Rules (Allow write access). |
| **Stripe loading error** | Key format | Ensure your key starts with `pk_test_` or `pk_live_`. |

---

> [!NOTE]
> This manual is part of the Athena V10.1 "Unified" standard. Direct any feedback on architectural changes to the core development team.
