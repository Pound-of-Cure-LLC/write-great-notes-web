import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  ArrowRight,
  Bell,
  CheckCircle2,
  Users,
  TrendingUp,
} from "lucide-react";
import { notFound } from "next/navigation";

// EMR configuration - add new EMRs here
const emrConfig: Record<string, { name: string; description: string }> = {
  "epic": {
    name: "Epic",
    description: "The most widely used EMR in large health systems and hospitals.",
  },
  "cerner": {
    name: "Cerner",
    description: "A leading EMR solution for healthcare organizations of all sizes.",
  },
  "athena": {
    name: "Athena",
    description: "Cloud-based EMR designed for ambulatory practices.",
  },
  "eclinicalworks": {
    name: "eClinicalWorks",
    description: "Comprehensive EMR and practice management solution.",
  },
  "nextgen": {
    name: "NextGen",
    description: "EMR and practice management for ambulatory care.",
  },
  "allscripts": {
    name: "Allscripts",
    description: "Healthcare IT solutions for practices and health systems.",
  },
  "drchrono": {
    name: "DrChrono",
    description: "All-in-one EHR, practice management, and medical billing.",
  },
  "advancedmd": {
    name: "AdvancedMD",
    description: "Unified practice management, EHR, and patient engagement software.",
  },
  "greenway": {
    name: "Greenway Health",
    description: "Integrated EHR and practice management solutions.",
  },
  "kareo": {
    name: "Kareo",
    description: "Cloud-based clinical and business management platform.",
  },
  "practice-fusion": {
    name: "Practice Fusion",
    description: "Cloud-based EHR for independent practices.",
  },
  "nextech": {
    name: "Nextech",
    description: "Specialty-focused EHR and practice management for ophthalmology, dermatology, and plastic surgery.",
  },
};

export function generateStaticParams() {
  return Object.keys(emrConfig).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const emr = emrConfig[slug];
  
  if (!emr) {
    return {
      title: "EMR Integration",
    };
  }

  return {
    title: `${emr.name} AI Scribe Integration - Coming Soon | Grail Digital Health`,
    description: `Grail Digital Health AI medical scribe integration for ${emr.name} EMR is coming soon. Write great notes - express interest to help prioritize development. AI ambient scribe for ${emr.name} users.`,
    keywords: [
      `${emr.name} AI scribe`,
      `AI scribe for ${emr.name}`,
      `${emr.name} integration`,
      `${emr.name} ambient scribe`,
      `${emr.name} clinical documentation`,
      "AI medical scribe",
      "EMR AI integration",
    ],
    openGraph: {
      title: `${emr.name} AI Scribe Integration | Grail Digital Health`,
      description: `AI medical scribe integration for ${emr.name} coming soon. Express interest to help prioritize.`,
      url: `https://grailhealth.ai/integrations/${slug}`,
    },
    alternates: {
      canonical: `https://grailhealth.ai/integrations/${slug}`,
    },
  };
}

export default async function EMRRoadmapPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const emr = emrConfig[slug];

  if (!emr) {
    notFound();
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Clock className="h-3 w-3 mr-1" />
              On Our Roadmap
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              {emr.name} Integration
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              {emr.description}
            </p>
            <p className="text-lg text-foreground max-w-2xl mx-auto mb-10">
              We&apos;re working on bringing Write Great Notes to {emr.name} users. 
              <span className="text-primary font-semibold"> Express your interest below</span> to help us prioritize this integration!
            </p>
          </div>
        </div>
      </section>

      {/* Why Your Input Matters */}
      <section className="py-16 sm:py-24 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Demand Drives Our Roadmap</h3>
                <p className="text-muted-foreground">
                  The more interest we see for an EMR, the higher it moves on our priority list.
                </p>
              </div>
              <div className="p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Get Notified First</h3>
                <p className="text-muted-foreground">
                  Be the first to know when the {emr.name} integration launches.
                </p>
              </div>
              <div className="p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Shape the Integration</h3>
                <p className="text-muted-foreground">
                  Early supporters help us understand what features matter most.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <Card className="border-2 border-primary/20 shadow-xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">Request {emr.name} Integration</CardTitle>
                <CardDescription className="text-base">
                  Let us know you&apos;re interested! Your input directly influences our development priorities.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-muted/50 rounded-lg p-6 mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Current interest level</p>
                  <div className="flex items-center justify-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-lg font-semibold">Join others waiting for {emr.name}</span>
                  </div>
                </div>
                <Button size="lg" asChild className="w-full text-lg py-6">
                  <Link href={`/contact?emr=${encodeURIComponent(emr.name)}&type=emr#contact-form`}>
                    Express Interest
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <p className="mt-4 text-sm text-muted-foreground">
                  We&apos;ll notify you as soon as the {emr.name} integration is available.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                What to Expect
              </h2>
              <p className="text-lg text-muted-foreground">
                When we launch the {emr.name} integration, you&apos;ll get:
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Automatic appointment synchronization",
                "One-click note push to patient charts",
                "Patient demographics auto-fill",
                "Previous notes access",
                "Real-time vitals integration",
                "Secure OAuth authentication",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 bg-card rounded-lg p-4 border">
                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Already Available CTA */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Can&apos;t Wait?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Grail is designed to make copying and pasting effortless. 
              You can still save hours every day by using our standalone mode until the integration launches.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link href="https://app.grailhealth.ai/signup">
                  Try Standalone Mode
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
