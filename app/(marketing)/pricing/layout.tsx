import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Medical Scribe Pricing - Plans Starting at $99/month | Grail Digital Health",
  description: "Transparent pricing for Grail Digital Health AI medical scribe. Write great notes with our Essential plan at $99/month, Pro plan with EMR integration at $149/month. 7-day free trial. Faxing included in every plan.",
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
    title: "AI Medical Scribe Pricing | Grail Digital Health",
    description: "Essential plan at $99/month, Pro plan with EMR integration at $149/month. 7-day free trial. Integrated faxing included.",
    url: "https://grailhealth.ai/pricing",
  },
  alternates: {
    canonical: "https://grailhealth.ai/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

