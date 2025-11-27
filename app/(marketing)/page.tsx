import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mic,
  FileText,
  Zap,
  Shield,
  Clock,
  Stethoscope,
  ArrowRight,
  CheckCircle2,
  Play,
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Real-Time Transcription",
    description:
      "Capture patient encounters with browser-based audio recording. No apps to install.",
  },
  {
    icon: Zap,
    title: "AI-Powered Notes",
    description:
      "Generate comprehensive clinical notes in seconds using advanced AI technology.",
  },
  {
    icon: Clock,
    title: "Fire & Forget",
    description:
      "Start generating a note and immediately move to your next patient. No waiting.",
  },
  {
    icon: FileText,
    title: "Custom Templates",
    description:
      "Create visit-type specific templates with customizable sections and instructions.",
  },
  {
    icon: Stethoscope,
    title: "EMR Integration",
    description:
      "Works standalone or integrates with Charm, Epic, and other major EMR systems.",
  },
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description:
      "Enterprise-grade security with AES-256 encryption and full audit trails.",
  },
];

const benefits = [
  "Save 2+ hours per day on documentation",
  "See more patients without burning out",
  "Generate notes during or after visits",
  "Works with or without EMR integration",
  "No software installation required",
  "Start free, upgrade when ready",
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Document Patient Visits.{" "}
              <span className="text-primary">Not Your Time.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              AI-powered clinical note generation that works with or without
              EMR. Record, generate, and move on to your next patient in
              seconds.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
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
                <Link href="/how-it-works">
                  <Play className="mr-2 h-5 w-5" />
                  See How It Works
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required. 14-day free trial.
            </p>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-uranian-blue opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need for Clinical Documentation
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built by healthcare professionals, for healthcare professionals.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Focus on Patients, Not Paperwork
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Write Great Notes handles the documentation so you can focus on
                what matters most - your patients. Our fire-and-forget
                architecture means you never wait for notes to generate.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 text-success mr-3 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              {/* Placeholder for demo video/screenshot */}
              <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/20 to-uranian-blue/20 border-2 border-dashed border-primary/30 flex items-center justify-center">
                <div className="text-center p-8">
                  <Play className="h-16 w-16 text-primary/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Demo video placeholder
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add your product demo here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">2+ hrs</div>
              <p className="text-muted-foreground">Saved per provider daily</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">30 sec</div>
              <p className="text-muted-foreground">Average note generation</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <p className="text-muted-foreground">Uptime reliability</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Ready to Transform Your Documentation?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join healthcare providers who are saving hours every day with
              AI-powered clinical notes.
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
                <Link href="/contact">Request a Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
