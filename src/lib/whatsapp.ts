export const WHATSAPP_NUMBER = "2348108418727";
export const WHATSAPP_DISPLAY = "+234 810 841 8727";

export const formatNaira = (a: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(a);

// Every outbound message identifies the website as the source so the team
// instantly knows the lead came from gadget360.ng (not a saved contact).
const FROM_WEBSITE = "Hi Gadget360.ng team! 👋 I'm messaging from your website (gadgets360.ng).";

export const waOrderUrl = (productName: string, price: number, quantity = 1) => {
  const qty = Math.max(1, Math.floor(quantity));
  const lineTotal = price * qty;
  const body =
    `${FROM_WEBSITE}\n\n` +
    `I'd like to order:\n` +
    `• ${productName}\n` +
    `• Quantity: ${qty}\n` +
    `• Unit price: ${formatNaira(price)}\n` +
    `• Total: ${formatNaira(lineTotal)}\n\n` +
    `Please confirm availability and delivery. Thank you!`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`;
};

export const waQuoteUrl = (productName: string) => {
  const body =
    `${FROM_WEBSITE}\n\n` +
    `Please send me a quote for: ${productName}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`;
};

export const waGeneralUrl = (message?: string) => {
  const body = message
    ? `${FROM_WEBSITE}\n\n${message}`
    : `${FROM_WEBSITE}\n\nI'd like to make an enquiry.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`;
};

// Build a multi-item cart order message that identifies the website source.
export const waCartOrderUrl = (
  items: { name: string; quantity: number; unitPrice: number }[],
  total: number,
) => {
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const lines = items
    .map((i) => `• ${i.name} ×${i.quantity} — ${formatNaira(i.unitPrice * i.quantity)}`)
    .join("\n");
  const body =
    `${FROM_WEBSITE}\n\n` +
    `I'd like to order ${items.length} product${items.length === 1 ? "" : "s"} (${totalQty} item${totalQty === 1 ? "" : "s"} total):\n\n` +
    `${lines}\n\n` +
    `Order total: ${formatNaira(total)}\n\n` +
    `Please confirm availability and delivery. Thank you!`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`;
};
