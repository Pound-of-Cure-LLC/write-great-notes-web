import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start Free Trial - AI Medical Scribe | Grail Digital Health",
  description: "Start your free 7-day trial of Grail Digital Health AI medical scribe. Write great notes. Sign up in 2 minutes and start saving hours on clinical documentation today.",
  keywords: [
    "AI scribe free trial",
    "medical scribe free trial",
    "try AI medical scribe",
    "clinical documentation free trial",
    "healthcare AI trial",
    "sign up AI scribe",
  ],
  openGraph: {
    title: "Start Your Free Trial | Grail Digital Health AI Medical Scribe",
    description: "7-day free trial. Start saving hours on clinical documentation today.",
    url: "https://grailhealth.ai/get-started",
  },
  alternates: {
    canonical: "https://grailhealth.ai/get-started",
  },
};

export default function GetStartedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}









