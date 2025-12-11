import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  FileText,
  Send,
  CheckCircle2,
  ArrowRight,
  Play,
  Clock,
  Zap,
  Eye,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/scroll-animation";
import { SampleNoteModal } from "@/components/marketing/sample-note-modal";

export const metadata: Metadata = {
  title: "How AI Medical Scribe Works - From Recording to EMR in Minutes | Grail Digital Health",
  description: "Learn how Grail Digital Health AI medical scribe works: Write great notes by recording patient visits, AI generates clinical notes in 30 seconds, review and push to your EMR. Save 2+ hours daily on documentation.",
  keywords: [
    "how AI scribe works",
    "AI medical documentation workflow",
    "ambient scribe process",
    "clinical note generation",
    "medical transcription AI",
    "EMR documentation workflow",
    "save time on charting",
    "physician documentation",
  ],
  openGraph: {
    title: "How AI Medical Scribe Works | Grail Digital Health",
    description: "Record, generate, review, push to EMR. See how Grail Digital Health AI scribe saves doctors 2+ hours daily on clinical documentation.",
    url: "https://grailhealth.ai/how-it-works",
  },
  alternates: {
    canonical: "https://grailhealth.ai/how-it-works",
  },
};

const steps = [
  {
    number: 1,
    icon: Mic,
    title: "Record the Visit",
    description:
      "Start recording directly in your browser. No apps to install. The audio is transcribed in real-time as you speak with your patient.",
    details: [
      "One-click recording start",
      "Real-time transcription preview",
      "Auto-save during recording",
      "Works on any device",
    ],
    duration: "During visit",
    screenshot: null, // Recording interface screenshot needed
  },
  {
    number: 2,
    icon: Zap,
    title: "Generate the Note",
    description:
      "Click 'Generate Note' and immediately move to your next patient. Our AI creates comprehensive clinical documentation while you continue working.",
    details: [
      "Move to your next patient immediately",
      "No waiting required",
      "Custom template support",
      "AI-optimized formatting",
    ],
    duration: "~30 seconds",
    screenshot: null, // Note generation screenshot needed
  },
  {
    number: 3,
    icon: FileText,
    title: "Review & Edit",
    description:
      "Get notified when your note is ready. Review the AI-generated content, make any edits, and finalize the documentation.",
    details: [
      "Real-time status updates",
      "Rich text editor",
      "Section-by-section review",
      "Quick edit capabilities",
    ],
    duration: "1-2 minutes",
    screenshot: "/images/screenshots/template-sections-followup.png",
  },
  {
    number: 4,
    icon: Send,
    title: "Push to EMR",
    description:
      "Send the completed note directly to your EMR with one click. Or export in your preferred format for manual upload.",
    details: [
      "Direct EMR integration",
      "One-click push",
      "Export options available",
      "Full audit trail",
    ],
    duration: "Instant",
    screenshot: "/images/screenshots/emr-integration-charm.png",
  },
];

const workflowBenefits = [
  {
    icon: Clock,
    title: "Save 2+ Hours Daily",
    description:
      "Providers using Write Great Notes report saving over 2 hours per day on documentation.",
  },
  {
    icon: Zap,
    title: "Zero Wait Time",
    description:
      "Move to your next patient immediately—your notes are ready when you need them.",
  },
  {
    icon: CheckCircle2,
    title: "Accurate Documentation",
    description:
      "AI-powered notes capture the full context of patient encounters accurately.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* Hero Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <FadeIn>
              <Badge variant="secondary" className="mb-6 px-4 py-2 bg-primary/10 text-primary border-primary/20">
                How It Works
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-tight mb-8">
                From Recording to EMR in Minutes
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-10">
                Write Great Notes streamlines your clinical documentation workflow
                into four simple steps. No more after-hours charting.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="mt-10">
                <Button size="lg" variant="outline" asChild className="text-lg px-10 py-7 border-2 hover:bg-background shadow-sm">
                  <Link href="#demo">
                    <Play className="mr-2 h-5 w-5 fill-current" />
                    Watch Demo Video
                  </Link>
                </Button>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-32">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
                >
                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-8 top-24 bottom-[-128px] w-1 bg-border hidden lg:block -z-10" 
                         style={{ left: index % 2 === 0 ? '2rem' : 'auto', right: index % 2 === 1 ? '2rem' : 'auto' }} />
                  )}
                  
                  <FadeIn direction={index % 2 === 1 ? "left" : "right"} className={index % 2 === 1 ? "lg:order-2" : ""}>
                    {/* Step number and icon */}
                    <div className="flex items-center gap-6 mb-8">
                      <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-xl ring-8 ring-background relative z-10">
                        {step.number}
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-2 text-sm font-medium px-3 py-1">
                          {step.duration}
                        </Badge>
                        <h2 className="text-3xl font-bold">{step.title}</h2>
                      </div>
                    </div>

                    <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                      {step.description}
                    </p>

                    <ul className="space-y-4">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-center text-lg group">
                          <CheckCircle2 className="h-6 w-6 text-success mr-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </FadeIn>

                  <FadeIn direction={index % 2 === 1 ? "right" : "left"} className={index % 2 === 1 ? "lg:order-1" : ""}>
                    {step.screenshot ? (
                      <div className="aspect-video rounded-2xl overflow-hidden border border-border shadow-2xl hover:shadow-3xl transition-all duration-500 bg-card group">
                        <Image
                          src={step.screenshot}
                          alt={`Step ${step.number}: ${step.title}`}
                          width={800}
                          height={450}
                          className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/5 to-uranian-blue/10 border border-primary/10 flex items-center justify-center shadow-xl">
                        <div className="text-center p-8">
                          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                            <step.icon className="h-12 w-12 text-primary/40" />
                          </div>
                          <p className="text-muted-foreground font-medium">
                            Step {step.number}: {step.title} Interface
                          </p>
                        </div>
                      </div>
                    )}
                  </FadeIn>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo" className="py-20 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
                  See It In Action
                </h2>
                <p className="text-xl text-muted-foreground">
                  Watch how Write Great Notes transforms clinical documentation.
                </p>
              </div>
            </FadeIn>

            {/* Video placeholder */}
            <FadeIn delay={0.2}>
              <div className="aspect-video rounded-3xl bg-gradient-to-br from-card to-muted border-4 border-dashed border-primary/20 flex items-center justify-center shadow-inner hover:border-primary/40 transition-colors group cursor-pointer">
                <div className="text-center p-8 transition-transform group-hover:scale-105">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                    <Play className="h-12 w-12 text-primary fill-primary/20 group-hover:fill-primary transition-colors" />
                  </div>
                  <p className="text-2xl font-bold mb-3">Demo Video</p>
                  <p className="text-muted-foreground text-lg mb-4">
                    Click to watch the product walkthrough
                  </p>
                  <Badge variant="secondary" className="text-sm">
                    Coming Soon
                  </Badge>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <FadeIn>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
                Why This Workflow Works
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Designed with busy healthcare providers in mind.
              </p>
            </FadeIn>
          </div>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {workflowBenefits.map((benefit) => (
              <StaggerItem key={benefit.title}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-center h-full">
                  <CardContent className="pt-10 p-8">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <benefit.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">{benefit.description}</p>
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
                  <h3 className="text-3xl font-bold mb-6">Have Questions?</h3>
                  <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Our team is here to help you understand how Grail can fit your practice.
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
                <h3 className="text-2xl font-bold mb-4">Have Questions?</h3>
                <p className="text-muted-foreground mb-6">
                  Our team is here to help you understand how Write Great Notes can fit your practice.
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
                Ready to Simplify Your Documentation?
              </h2>
              <p className="text-xl text-muted-foreground mb-12">
                Start your free trial today and experience the difference.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <Button size="lg" asChild className="text-lg px-12 py-8 shadow-xl transition-all hover:scale-105">
                  <Link href="/get-started">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Link>
                </Button>
                <SampleNoteModal
                  trigger={
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-lg px-8 py-8 border-2 bg-background/50 backdrop-blur-sm gap-2"
                    >
                      <Eye className="h-5 w-5" />
                      See a Real Note
                    </Button>
                  }
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
