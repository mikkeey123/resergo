// PayPal Sandbox Configuration
const rawClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || "";

// Check if Client ID is valid (not empty and not the placeholder)
export const isPayPalConfigured = () => {
    return rawClientId && 
           rawClientId.trim() !== "" && 
           rawClientId !== "YOUR_SANDBOX_CLIENT_ID_HERE" &&
           rawClientId !== "YOUR_SANDBOX_CLIENT_ID" &&
           rawClientId.length > 10; // PayPal Client IDs are typically long
};

export const PAYPAL_CONFIG = {
    // Sandbox Client ID - Replace with your actual sandbox client id
    clientId: isPayPalConfigured() ? rawClientId.trim() : "",
    // Use sandbox environment
    environment: "sandbox", // Change to "production" for live payments
    currency: "PHP", // Philippine Peso
    locale: "en_PH"
};

// PayPal SDK Options - Only create if Client ID is valid
export const paypalSdkOptions = isPayPalConfigured() ? {
    clientId: PAYPAL_CONFIG.clientId,
    currency: PAYPAL_CONFIG.currency,
    intent: "capture", // or "authorize" for authorization
    components: "buttons,marks,funding-eligibility",
    dataNamespace: "paypal_sdk",
    enableFunding: "paypal,card,venmo",
    disableFunding: "",
    buyerCountry: "PH",
    locale: PAYPAL_CONFIG.locale
} : null;
