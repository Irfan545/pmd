"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import CheckoutSuspense from "./checkoutSkeleton";

function CheckoutPage() {
  const options = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
    currency: "GBP",
    intent: "capture",
    components: "buttons,card-fields",
    "enable-funding": "card",
    "disable-funding": "paylater,venmo",
    // Disable auto-fill in development to avoid secure connection warnings
    "data-page-type": "checkout",
  };

  return (
    <PayPalScriptProvider options={options}>
      <CheckoutSuspense />
    </PayPalScriptProvider>
  );
}

export default CheckoutPage;
