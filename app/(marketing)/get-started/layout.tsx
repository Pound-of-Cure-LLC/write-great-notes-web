import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start Free Trial - AI Medical Scribe",
  description: "Start your free 7-day trial of Write Great Notes AI medical scribe. No credit card required. Sign up in 2 minutes and start saving hours on clinical documentation today.",
  keywords: [
    "AI scribe free trial",
    "medical scribe free trial",
    "try AI medical scribe",
    "clinical documentation free trial",
    "healthcare AI trial",
    "sign up AI scribe",
  ],
  openGraph: {
    title: "Start Your Free Trial | Write Great Notes AI Medical Scribe",
    description: "7-day free trial. No credit card required. Start saving hours on clinical documentation today.",
    url: "https://writegreatnotes.ai/get-started",
  },
  alternates: {
    canonical: "https://writegreatnotes.ai/get-started",
  },
};

export default function GetStartedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

