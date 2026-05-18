export type PaystackPopHandler = {
  openIframe: () => void;
};

export type PaystackPopOptions = {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref: string;
  channels?: string[];
  metadata?: Record<string, unknown>;
  callback: (response: { reference: string; status?: string }) => void;
  onClose?: () => void;
};

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: PaystackPopOptions) => PaystackPopHandler;
    };
  }
}

const PAYSTACK_SCRIPT = "https://js.paystack.co/v1/inline.js";

let scriptPromise: Promise<void> | null = null;

export function loadPaystackInline(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Paystack can only load in the browser."));
  }
  if (window.PaystackPop) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${PAYSTACK_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Paystack.")));
      if (window.PaystackPop) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = PAYSTACK_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack checkout."));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export function openPaystackCheckout(options: PaystackPopOptions): PaystackPopHandler {
  if (!window.PaystackPop) {
    throw new Error("Paystack is not loaded yet.");
  }
  return window.PaystackPop.setup(options);
}
