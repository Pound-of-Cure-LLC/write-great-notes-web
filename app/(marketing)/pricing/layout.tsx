import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Medical Scribe Pricing - Plans Starting at $99/month",
  description: "Transparent pricing for Write Great Notes AI medical scribe. Essential plan at $99/month, Pro plan with EMR integration at $149/month. 7-day free trial, no credit card required. Faxing included in every plan.",
  keywords: [
    "AI scribe pricing",
    "medical scribe software cost",
    "AI documentation pricing",
    "healthcare AI pricing",
    "clinical documentation cost",
    "medical scribe subscription",
    "affordable AI scribe",
    "AI scribe free trial",
    "medical faxing",
  ],
  openGraph: {
    title: "AI Medical Scribe Pricing | Write Great Notes",
    description: "Essential plan at $99/month, Pro plan with EMR integration at $149/month. 7-day free trial, no credit card required. Integrated faxing included.",
    url: "https://writegreatnotes.ai/pricing",
  },
  alternates: {
    canonical: "https://writegreatnotes.ai/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

