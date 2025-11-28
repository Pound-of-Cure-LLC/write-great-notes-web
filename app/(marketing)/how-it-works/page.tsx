import Link from "next/link";
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
} from "lucide-react";

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
  },
  {
    number: 2,
    icon: Zap,
    title: "Generate the Note",
    description:
      "Click 'Generate Note' and immediately move to your next patient. Our AI creates comprehensive clinical documentation while you continue working.",
    details: [
      "Fire-and-forget generation",
      "No waiting required",
      "Custom template support",
      "AI-optimized formatting",
    ],
    duration: "~30 seconds",
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
      "Our fire-and-forget architecture means you never wait for notes to generate.",
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
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              How It Works
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              From Recording to EMR in Minutes
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Write Great Notes streamlines your clinical documentation workflow
              into four simple steps. No more after-hours charting.
            </p>
            <div className="mt-10">
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                <Link href="#demo">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo Video
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-24">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                >
                  <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                    {/* Step number and icon */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground relative z-10">
                        {step.number}
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-1">
                          {step.duration}
                        </Badge>
                        <h2 className="text-2xl font-bold">{step.title}</h2>
                      </div>
                    </div>

                    <p className="text-lg text-muted-foreground mb-6">
                      {step.description}
                    </p>

                    <ul className="space-y-3">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-center">
                          <CheckCircle2 className="h-5 w-5 text-success mr-3 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                    {/* Placeholder for step screenshot/animation */}
                    <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/10 to-uranian-blue/10 border border-primary/20 flex items-center justify-center">
                      <div className="text-center p-8">
                        <step.icon className="h-16 w-16 text-primary/30 mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Step {step.number}: {step.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Screenshot/animation placeholder
                        </p>
                      </div>
                    </div>
                  </div>
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
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                See It In Action
              </h2>
              <p className="text-lg text-muted-foreground">
                Watch how Write Great Notes transforms clinical documentation.
              </p>
            </div>

            {/* Video placeholder */}
            <div className="aspect-video rounded-xl bg-gradient-to-br from-card to-muted border-2 border-dashed border-primary/30 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Play className="h-10 w-10 text-primary" />
                </div>
                <p className="text-xl font-medium mb-2">Demo Video</p>
                <p className="text-muted-foreground">
                  Add your product demonstration video here
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  Recommended: 2-3 minute walkthrough showing the complete workflow
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why This Workflow Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Designed with busy healthcare providers in mind.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {workflowBenefits.map((benefit) => (
              <Card key={benefit.title} className="border-0 shadow-md text-center">
                <CardContent className="pt-8">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
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
              Ready to Simplify Your Documentation?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start your free trial today and experience the difference.
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
                <Link href="/contact">Schedule a Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
