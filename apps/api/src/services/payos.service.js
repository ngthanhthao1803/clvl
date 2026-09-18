import { PayOS } from "@payos/node";
import { env } from "../config/env.js";

let payosInstance = null;

export function isPayOSEnabled() {
  return Boolean(
    env.payosClientId && env.payosApiKey && env.payosChecksumKey,
  );
}

export function getPayOSInstance() {
  if (payosInstance) return payosInstance;

  if (isPayOSEnabled()) {
    payosInstance = new PayOS({
      clientId: env.payosClientId,
      apiKey: env.payosApiKey,
      checksumKey: env.payosChecksumKey,
    });
  }

  return payosInstance;
}

/**
 * Create a PayOS checkout payment link & VietQR
 * @param {Object} params
 * @param {number} params.orderCode - Numeric safe integer
 * @param {number} params.amount - Amount in VND
 * @param {string} params.description - Max 25 chars
 * @param {string} [params.returnUrl] - URL after success
 * @param {string} [params.cancelUrl] - URL after cancel
 */
export async function createPayOSPaymentLink({
  orderCode,
  amount,
  description,
  returnUrl,
  cancelUrl,
}) {
  const payos = getPayOSInstance();
  if (!payos) {
    throw new Error("PayOS chưa được cấu hình Client ID / API Key");
  }

  // PayOS strictly limits description to 25 characters without accents
  const sanitizedDesc = description
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .slice(0, 25);

  const fallbackOrigin = env.clientOrigin || "http://localhost:3000";

  const paymentData = {
    orderCode: Number(orderCode),
    amount: Number(amount),
    description: sanitizedDesc,
    returnUrl: returnUrl || fallbackOrigin,
    cancelUrl: cancelUrl || fallbackOrigin,
  };

  return await payos.paymentRequests.create(paymentData);
}

/**
 * Fetch latest payment status directly from PayOS API
 * @param {number|string} orderCode
 */
export async function getPayOSPaymentStatus(orderCode) {
  const payos = getPayOSInstance();
  if (!payos) return null;

  try {
    return await payos.paymentRequests.get(Number(orderCode));
  } catch (error) {
    return null;
  }
}

/**
 * Verify PayOS Webhook signature
 * @param {Object} webhookBody
 */
export async function verifyPayOSWebhook(webhookBody) {
  const payos = getPayOSInstance();
  if (!payos) return null;

  try {
    return await payos.webhooks.verify(webhookBody);
  } catch (error) {
    console.error("PayOS webhook verification failed:", error.message);
    return null;
  }
}
