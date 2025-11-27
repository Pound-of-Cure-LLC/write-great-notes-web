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
} from "lucide-react";

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
      "Generate comprehensive clinical notes using GPT-4 AI. Our fire-and-forget architecture means you never wait.",
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
];

const additionalFeatures = [
  {
    icon: Clock,
    title: "Fire & Forget Architecture",
    description:
      "Start note generation and immediately move to your next patient. No waiting, no interruptions.",
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
      <section className="py-20 sm:py-32 bg-gradient-to-b from-background to-muted/30">
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
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {coreFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">{feature.title}</h2>
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

      {/* Additional Features Grid */}
      <section className="py-20 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
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
                <CardHeader>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
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
              <Card key={feature.title} className="border-0 shadow-md text-center">
                <CardContent className="pt-8">
                  <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-7 w-7 text-success" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-primary/5">
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
                <Link href="/signup">
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
