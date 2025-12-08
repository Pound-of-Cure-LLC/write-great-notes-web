import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  metadataBase: new URL("https://grailhealth.ai"),
  title: {
    default: "Grail Digital Health - Write Great Notes - AI Medical Scribe & Clinical Documentation Software",
    template: "%s | Grail Digital Health",
  },
  description: "Grail Digital Health: Write great notes with our AI-powered ambient medical scribe that captures patient conversations and generates comprehensive clinical notes. Best AI scribe for Charm Health, Epic, Athena. HIPAA compliant. Free trial.",
  keywords: [
    // Primary keywords
    "AI medical scribe",
    "AI scribe",
    "ambient AI scribe",
    "AI clinical documentation",
    "medical scribe software",
    "AI documentation for doctors",
    // Charm Health specific
    "Charm Health AI scribe",
    "Charm AI scribe",
    "Charm Health integration",
    "AI scribe for Charm Health",
    // EMR/EHR keywords
    "EHR AI scribe",
    "EMR AI documentation",
    "AI scribe Epic",
    "AI scribe Athena",
    // Clinical notes keywords
    "AI medical notes",
    "AI clinical notes",
    "automated medical documentation",
    "AI SOAP notes",
    "AI progress notes",
    // Healthcare AI keywords
    "healthcare AI",
    "physician AI assistant",
    "AI for healthcare providers",
    "AI for doctors",
    "medical AI software",
    // Problem/Solution keywords
    "reduce physician burnout",
    "clinical documentation burnout",
    "faster medical documentation",
    "save time on charting",
    // Feature keywords
    "ambient listening medical",
    "voice to clinical notes",
    "speech to text medical",
    "real-time medical transcription",
  ],
  authors: [{ name: "Grail Digital Health" }],
  creator: "Pound of Cure LLC",
  publisher: "Pound of Cure LLC",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://grailhealth.ai",
    siteName: "Grail Digital Health",
    title: "Grail Digital Health - Write Great Notes - AI Medical Scribe & Clinical Documentation",
    description: "Grail Digital Health: Write great notes with our AI-powered ambient medical scribe that captures patient conversations and generates comprehensive clinical notes. Best AI scribe for Charm Health. HIPAA compliant. Start free trial.",
    images: [
      {
        url: "/images/grail logo - transparent.png",
        width: 1200,
        height: 400,
        alt: "Grail Digital Health - AI Medical Scribe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grail Digital Health - AI Medical Scribe",
    description: "Grail Digital Health: Write great notes with our AI-powered ambient medical scribe for clinical documentation. Captures conversations, generates comprehensive notes. HIPAA compliant.",
    images: ["/images/grail logo - transparent.png"],
  },
  alternates: {
    canonical: "https://grailhealth.ai",
  },
  category: "Healthcare Software",
};

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Grail Digital Health",
  applicationCategory: "HealthcareApplication",
  operatingSystem: "Web Browser",
  description: "AI-powered ambient medical scribe that captures patient conversations and generates comprehensive clinical notes. Integrates with Charm Health, Epic, and Athena EMRs.",
  offers: {
    "@type": "Offer",
    price: "79",
    priceCurrency: "USD",
    priceValidUntil: "2025-12-31",
    availability: "https://schema.org/InStock",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "150",
    bestRating: "5",
    worstRating: "1",
  },
  provider: {
    "@type": "Organization",
    name: "Pound of Cure LLC",
    url: "https://grailhealth.ai",
  },
  featureList: [
    "AI Ambient Medical Scribe",
    "Real-time Audio Transcription",
    "Charm Health EMR Integration",
    "HIPAA Compliant",
    "Custom Note Templates",
    "One-Click Note Push to EMR",
  ],
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Grail Digital Health",
  url: "https://grailhealth.ai",
  logo: "https://grailhealth.ai/images/grail logo - transparent.png",
  description: "Write great notes with our AI-powered clinical documentation software for healthcare providers",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    url: "https://grailhealth.ai/contact",
  },
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
