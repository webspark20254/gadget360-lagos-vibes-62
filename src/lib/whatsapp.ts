export const WHATSAPP_NUMBER = "2348108418727";
export const WHATSAPP_DISPLAY = "+234 810 841 8727";

export const formatNaira = (a: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(a);

export const waOrderUrl = (productName: string, price: number) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi Gadget360.ng! I want to order the ${productName} (${formatNaira(price)}). Please confirm availability and delivery.`
  )}`;

export const waQuoteUrl = (productName: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi Gadget360.ng! Please send me a quote for the ${productName}.`
  )}`;

export const waGeneralUrl = (message = "Hi Gadget360.ng! I'd like to make an order.") =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
