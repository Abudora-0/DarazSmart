import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendPriceAlert({
  to,
  productTitle,
  currentPrice,
  targetPrice,
  darazUrl,
}: {
  to: string;
  productTitle: string;
  currentPrice: number;
  targetPrice: number;
  darazUrl: string;
}) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: `Price drop alert: ${productTitle}`,
    html: `
      <h2>Price Drop Alert</h2>
      <p><strong>${productTitle}</strong> has dropped to <strong>Rs. ${currentPrice.toLocaleString()}</strong>, below your target of Rs. ${targetPrice.toLocaleString()}.</p>
      <p><a href="${darazUrl}">View on Daraz</a></p>
    `,
  });
}
