import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Get Started with AI Medical Scribe | Grail Digital Health",
  description: "Contact Grail Digital Health for questions about our AI medical scribe. Write great notes - request EMR integration, get pricing information, or start your free trial. We respond within 24 hours.",
  keywords: [
    "contact AI scribe",
    "medical scribe demo",
    "AI documentation contact",
    "healthcare AI support",
    "EMR integration request",
    "clinical documentation help",
  ],
  openGraph: {
    title: "Contact Grail Digital Health | AI Medical Scribe",
    description: "Get in touch with our team. Request EMR integration, ask questions, or start your free trial.",
    url: "https://grailhealth.ai/contact",
  },
  alternates: {
    canonical: "https://grailhealth.ai/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}













