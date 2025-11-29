import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  FileText,
  Zap,
  Shield,
  Clock,
  Stethoscope,
  ArrowRight,
  CheckCircle2,
  Brain,
  RefreshCw,
  Users,
  Settings,
  Lock,
  Cloud,
  Sparkles,
  FileEdit,
  Send,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI Medical Scribe Features - Real-Time Transcription & EMR Integration",
  description: "Explore Write Great Notes features: AI-powered ambient listening, real-time transcription, custom note templates, Charm Health EMR integration, HIPAA compliant security. See why doctors choose our AI scribe.",
  keywords: [
    "AI scribe features",
    "medical scribe software features",
    "real-time medical transcription",
    "EMR integration AI",
    "HIPAA compliant AI scribe",
    "custom clinical note templates",
    "ambient listening healthcare",
    "AI documentation features",
  ],
  openGraph: {
    title: "AI Medical Scribe Features | Write Great Notes",
    description: "Real-time transcription, AI note generation, EMR integration, HIPAA compliant. See all features of Write Great Notes AI medical scribe.",
    url: "https://writegreatnotes.ai/features",
  },
  alternates: {
    canonical: "https://writegreatnotes.ai/features",
  },
};

const coreFeatures = [
  {
    icon: Mic,
    title: "Real-Time Audio Transcription",
    description:
      "Capture patient encounters directly in your browser with Azure Speech Services. No apps to install, works on any device.",
    benefits: [
      "Browser-based recording - no software installation",
      "Real-time transcription as you speak",
      "Auto-save during recording sessions",
      "Support for multiple languages",
    ],
  },
  {
    icon: Brain,
    title: "AI-Powered Note Generation",
    description:
      "Generate comprehensive clinical notes using the latest and most advanced AI models. See your patient, move to the next—notes are ready when you need them.",
    benefits: [
      "Generate notes in under 30 seconds",
      "Move to next patient immediately",
      "Real-time status updates",
      "Accurate medical terminology",
    ],
  },
  {
    icon: FileEdit,
    title: "Custom Note Templates",
    description:
      "Create visit-type specific templates with customizable sections. Import from sample notes with AI assistance.",
    benefits: [
      "Unlimited custom visit types",
      "Configurable note sections",
      "AI-powered section import",
      "Per-visit-type instructions",
    ],
  },
  {
    icon: Stethoscope,
    title: "EMR Integration",
    description:
      "Works standalone or integrates with your existing EMR. Push notes directly to patient charts.",
    benefits: [
      "Charm EMR integration",
      "Epic FHIR support",
      "Athena Health ready",
      "Standalone mode available",
    ],
  },
  {
    icon: Send,
    title: "Integrated Faxing System",
    description:
      "Deliver notes automatically to referring physicians, specialists, and care partners via built-in HIPAA-compliant faxing.",
    benefits: [
      "Faxing included in every plan",
      "Automatic delivery on note completion",
      "Additional faxes just $0.10 each",
      "HIPAA-compliant with full audit trails",
    ],
  },
];

const additionalFeatures = [
  {
    icon: Clock,
    title: "No Documentation Backlog",
    description:
      "Move seamlessly from patient to patient. Your notes are ready when you are—no staying late to catch up.",
  },
  {
    icon: RefreshCw,
    title: "Real-Time Status Updates",
    description:
      "See note generation progress in real-time. Know exactly when your notes are ready.",
  },
  {
    icon: Users,
    title: "Multi-Provider Support",
    description:
      "Manage multiple providers in your organization with role-based access control.",
  },
  {
    icon: Settings,
    title: "Organization Settings",
    description:
      "Configure settings at the organization level. Custom branding and preferences.",
  },
  {
    icon: Cloud,
    title: "Cloud-Based",
    description:
      "Access from anywhere. All data securely stored and backed up in the cloud.",
  },
  {
    icon: Sparkles,
    title: "AI Template Import",
    description:
      "Paste a sample note and our AI will automatically create section templates.",
  },
];

const securityFeatures = [
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description:
      "Full HIPAA compliance with Business Associate Agreements available.",
  },
  {
    icon: Lock,
    title: "AES-256 Encryption",
    description:
      "All PHI encrypted at rest using military-grade AES-256-GCM encryption.",
  },
  {
    icon: Users,
    title: "Row-Level Security",
    description:
      "Complete data isolation between organizations using PostgreSQL RLS.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              Features
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Everything You Need for Clinical Documentation
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Write Great Notes combines real-time transcription, AI-powered
              note generation, and seamless EMR integration into one powerful
              platform.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {coreFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">{feature.title}</h2>
                    </div>
                  </div>
                  <p className="text-lg text-muted-foreground mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  {/* Placeholder for feature screenshot */}
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/10 to-uranian-blue/10 border border-primary/20 flex items-center justify-center">
                    <div className="text-center p-8">
                      <feature.icon className="h-16 w-16 text-primary/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Screenshot: {feature.title}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Faxing Feature Highlight */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                Included in Every Plan
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Integrated Faxing System
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Faxing is a critical part of medical workflows. WriteGreatNotes.ai makes it 
                automatic, affordable, and fully integrated with the clinical note creation process.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-amber-200 dark:border-amber-800">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">Faxing Included</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Each plan includes a monthly allowance of faxes to send notes 
                    directly to referring physicians and care partners.
                  </p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      Essential: 200 faxes/month
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      Pro: 400 faxes/month
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-amber-200 dark:border-amber-800">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">Low-Cost Additional Faxes</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Need more? Additional faxes are affordable and available on-demand.
                  </p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      Additional faxes: $0.10 each
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-amber-200 dark:border-amber-800">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">Automatic Delivery</h3>
                  <p className="text-muted-foreground text-sm">
                    Notes can be faxed automatically as soon as they&apos;re generated. 
                    No extra steps, no manual sending—just seamless delivery to care partners.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-amber-200 dark:border-amber-800">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">HIPAA-Compliant</h3>
                  <p className="text-muted-foreground text-sm">
                    All fax transmissions use encrypted, HIPAA-compliant channels with 
                    complete audit trails for compliance and record-keeping.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 text-center">
              <Link href="/pricing" className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
                View pricing details
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-10">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              And Much More
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Additional features designed to streamline your workflow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-10">
            <Badge variant="secondary" className="mb-4">
              Security
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Enterprise-Grade Security
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built from the ground up with HIPAA compliance and data security
              in mind.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {securityFeatures.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start your free trial today and experience the future of clinical
              documentation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link href="/get-started">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-lg px-8 py-6"
              >
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
