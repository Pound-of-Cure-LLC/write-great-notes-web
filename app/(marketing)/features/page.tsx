import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  FileText,
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
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/scroll-animation";

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
    screenshot: null, // Recording interface screenshot needed
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
    screenshot: null, // Note generation screenshot needed (with PHI redacted)
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
    screenshot: "/images/screenshots/template-sections-followup.png",
  },
  {
    icon: Stethoscope,
    title: "EMR Integration",
    description:
      "Works standalone or integrates with your existing EMR. Push notes directly to patient charts.",
    benefits: [
      "Charm EMR integration",
      "AdvancedMD integration",
      "Athena Health ready",
      "Standalone mode available",
    ],
    screenshot: "/images/screenshots/emr-integration-charm.png",
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
    screenshot: null, // Faxing interface screenshot needed
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
    title: "Industry-Standard Privacy",
    description:
      "Complete data isolation between organizations using industry-standard security practices.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* Hero Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <FadeIn>
              <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
                Features
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-tight mb-8">
                Everything You Need for Clinical Documentation
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Write Great Notes combines real-time transcription, AI-powered
                note generation, and seamless EMR integration into one powerful
                platform.
              </p>
            </FadeIn>
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
                <FadeIn direction={index % 2 === 1 ? "left" : "right"} className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="flex items-start gap-6 mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-3xl sm:text-4xl font-bold">{feature.title}</h2>
                    </div>
                  </div>
                  <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="space-y-4">
                    {feature.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start group">
                        <CheckCircle2 className="h-6 w-6 text-success mr-3 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="text-lg">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </FadeIn>
                
                <FadeIn direction={index % 2 === 1 ? "right" : "left"} className={index % 2 === 1 ? "lg:order-1" : ""}>
                  {feature.screenshot ? (
                    <div className="aspect-video rounded-2xl overflow-hidden border border-border shadow-2xl hover:shadow-3xl transition-shadow duration-500 bg-card">
                      <Image
                        src={feature.screenshot}
                        alt={`${feature.title} screenshot`}
                        width={800}
                        height={450}
                        className="w-full h-full object-cover object-top transform hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/5 to-uranian-blue/10 border border-primary/10 flex items-center justify-center shadow-xl">
                      <div className="text-center p-8">
                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                          <feature.icon className="h-12 w-12 text-primary/40" />
                        </div>
                        <p className="text-muted-foreground font-medium">
                          {feature.title} Interface
                        </p>
                      </div>
                    </div>
                  )}
                </FadeIn>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Faxing Feature Highlight */}
      <section className="py-24 sm:py-32 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <FadeIn>
              <div className="text-center mb-16">
                <Badge variant="secondary" className="mb-6 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200 px-4 py-2 text-sm font-medium">
                  Included in Every Plan
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
                  Integrated Faxing System
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Faxing is a critical part of medical workflows. WriteGreatNotes.ai makes it 
                  automatic, affordable, and fully integrated with the clinical note creation process.
                </p>
              </div>
            </FadeIn>
            
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <StaggerItem>
                <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-black/20 h-full hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="p-8">
                    <h3 className="font-bold text-xl mb-3 text-foreground">Faxing Included</h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      Each plan includes a monthly allowance of faxes to send notes 
                      directly to referring physicians and care partners.
                    </p>
                    <ul className="space-y-2 text-sm font-medium">
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        Essential: 400 faxes/month
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        Pro: 600 faxes/month
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-black/20 h-full hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="p-8">
                    <h3 className="font-bold text-xl mb-3 text-foreground">Low-Cost Additional Faxes</h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      Need more? Additional faxes are affordable and available on-demand.
                    </p>
                    <ul className="space-y-2 text-sm font-medium">
                      <li className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                        Additional faxes: $0.10 each
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-black/20 h-full hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="p-8">
                    <h3 className="font-bold text-xl mb-3 text-foreground">Automatic Delivery</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Notes can be faxed automatically as soon as they&apos;re generated. 
                      No extra steps, no manual sending—just seamless delivery to care partners.
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="border-amber-200 dark:border-amber-800 bg-white/50 dark:bg-black/20 h-full hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="p-8">
                    <h3 className="font-bold text-xl mb-3 text-foreground">HIPAA-Compliant</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      All fax transmissions use encrypted, HIPAA-compliant channels with 
                      complete audit trails for compliance and record-keeping.
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            </StaggerContainer>

            <FadeIn delay={0.4}>
              <div className="mt-12 text-center">
                <Link href="/pricing" className="text-primary font-bold text-lg hover:underline inline-flex items-center gap-2">
                  View pricing details
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <FadeIn>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
                And Much More
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Additional features designed to streamline your workflow.
              </p>
            </FadeIn>
          </div>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature) => (
              <StaggerItem key={feature.title}>
                <Card className="border-0 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 h-full">
                  <CardContent className="pt-8 p-8">
                    <div className="flex items-start gap-5">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <FadeIn>
              <Badge variant="secondary" className="mb-6 px-4 py-2 bg-success/10 text-success border-success/20">
                Security
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
                Enterprise-Grade Security
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Built from the ground up with HIPAA compliance and data security
                in mind.
              </p>
            </FadeIn>
          </div>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {securityFeatures.map((feature) => (
              <StaggerItem key={feature.title}>
                <Card className="border-0 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 h-full border-t-4 border-t-success/50">
                  <CardContent className="pt-8 p-8">
                    <div className="flex items-start gap-5">
                      <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-7 w-7 text-success" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Questions CTA */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <FadeIn>
              <Card className="border-primary/20 bg-primary/5 shadow-lg">
                <CardContent className="pt-12 pb-12 px-8">
                  <h3 className="text-3xl font-bold mb-6">Questions About Features?</h3>
                  <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Want to learn more about how Write Great Notes can help your practice? Our team is ready to help.
                  </p>
                  <Button size="lg" variant="outline" asChild className="text-lg px-10 py-7 border-2 hover:bg-background">
                    <Link href="/contact">
                      Contact Us
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Questions CTA */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-8 pb-8">
                <h3 className="text-2xl font-bold mb-4">Questions About Features?</h3>
                <p className="text-muted-foreground mb-6">
                  Want to learn more about how Write Great Notes can help your practice? Our team is ready to help.
                </p>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact">
                    Contact Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <FadeIn>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-8">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-muted-foreground mb-12">
                Start your free trial today and experience the future of clinical
                documentation.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button size="lg" asChild className="text-lg px-12 py-8 shadow-xl transition-all hover:scale-105">
                  <Link href="/get-started">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="text-lg px-12 py-8 border-2 bg-background/50 backdrop-blur-sm"
                >
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
