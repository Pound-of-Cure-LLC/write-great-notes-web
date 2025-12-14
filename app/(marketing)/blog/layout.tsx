import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Healthcare AI Insights | Grail Digital Health",
  description: "Insights on AI in healthcare, clinical documentation, EHR systems, and the future of medical technology from the Grail Digital Health team.",
  keywords: [
    "healthcare AI blog",
    "medical scribe insights",
    "EHR technology",
    "clinical documentation",
    "healthcare technology blog",
    "AI in medicine",
  ],
  openGraph: {
    title: "Blog | Grail Digital Health",
    description: "Insights on AI in healthcare, clinical documentation, and the future of medical technology.",
    url: "https://grailhealth.ai/blog",
  },
  alternates: {
    canonical: "https://grailhealth.ai/blog",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
