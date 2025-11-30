import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Get Started with AI Medical Scribe",
  description: "Contact Write Great Notes for questions about our AI medical scribe. Request EMR integration, get pricing information, or start your free trial. We respond within 24 hours.",
  keywords: [
    "contact AI scribe",
    "medical scribe demo",
    "AI documentation contact",
    "healthcare AI support",
    "EMR integration request",
    "clinical documentation help",
  ],
  openGraph: {
    title: "Contact Write Great Notes | AI Medical Scribe",
    description: "Get in touch with our team. Request EMR integration, ask questions, or start your free trial.",
    url: "https://writegreatnotes.ai/contact",
  },
  alternates: {
    canonical: "https://writegreatnotes.ai/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


