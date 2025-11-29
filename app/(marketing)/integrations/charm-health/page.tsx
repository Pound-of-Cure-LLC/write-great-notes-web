import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  ArrowRight,
  Zap,
  RefreshCw,
  FileText,
  Users,
  Shield,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Charm Health AI Scribe Integration - Best AI Scribe for Charm EMR",
  description: "Write Great Notes is the best AI scribe for Charm Health EMR. Deep integration with automatic appointment sync, one-click note push, patient demographics, and real-time vitals. Start free trial.",
  keywords: [
    "Charm Health AI scribe",
    "Charm AI scribe",
    "AI scribe for Charm Health",
    "Charm Health integration",
    "Charm EMR AI documentation",
    "CharmHealth AI scribe alternative",
    "best AI scribe Charm Health",
    "Charm Health ambient scribe",
    "Charm EHR AI integration",
    "AI medical scribe Charm",
  ],
  openGraph: {
    title: "Charm Health AI Scribe Integration | Write Great Notes",
    description: "The best AI scribe for Charm Health EMR. Automatic appointment sync, one-click note push, deep EMR integration. Start your free trial.",
    url: "https://writegreatnotes.ai/integrations/charm-health",
  },
  alternates: {
    canonical: "https://writegreatnotes.ai/integrations/charm-health",
  },
};

const features = [
  {
    icon: RefreshCw,
    title: "Automatic Appointment Sync",
    description: "Your schedule syncs automatically. See today's appointments without manual entry.",
  },
  {
    icon: FileText,
    title: "One-Click Note Push",
    description: "Push completed notes directly to patient charts in Charm Health.",
  },
  {
    icon: Users,
    title: "Patient Demographics",
    description: "Patient info flows from Charm—no duplicate data entry needed.",
  },
  {
    icon: Zap,
    title: "Real-Time Vitals",
    description: "Current vitals pulled automatically and incorporated into your notes.",
  },
  {
    icon: Clock,
    title: "Previous Notes Access",
    description: "Review past encounters directly from Write Great Notes.",
  },
  {
    icon: Shield,
    title: "Secure OAuth Connection",
    description: "Industry-standard OAuth 2.0 authentication keeps your data safe.",
  },
];

export default function CharmHealthIntegrationPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4 bg-success text-success-foreground">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Available Now
            </Badge>
            <div className="flex items-center justify-center gap-4 mb-6">
              <Image
                src="/images/charmhealth-logo.png"
                alt="Charm Health"
                width={60}
                height={60}
                className="rounded-lg"
              />
              <span className="text-2xl text-muted-foreground">+</span>
              <Image
                src="/images/write-great-notes-logo.png"
                alt="Write Great Notes"
                width={60}
                height={60}
                className="rounded-lg"
              />
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Charm Health Integration
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Write Great Notes integrates deeply with Charm Health EMR. 
              Sync appointments, push notes, and access patient data—all seamlessly connected.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link href="/get-started">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-10">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              Deep Integration Features
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need for a seamless workflow between Write Great Notes and Charm Health.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0">
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

      {/* How It Works */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                Get Connected in Minutes
              </h2>
              <p className="text-lg text-muted-foreground">
                Setting up the Charm Health integration is quick and easy.
              </p>
            </div>
            <div className="space-y-8">
              {[
                {
                  step: 1,
                  title: "Sign Up for Write Great Notes",
                  description: "Create your account and start your free trial.",
                },
                {
                  step: 2,
                  title: "Connect Charm Health",
                  description: "Click 'Connect EMR' and sign in to your Charm Health account.",
                },
                {
                  step: 3,
                  title: "Start Documenting",
                  description: "Your appointments sync automatically. Start seeing patients and generating notes.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6 items-start">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-xl font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Ready to Connect?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start your free trial and connect your Charm Health account in minutes.
            </p>
            <Button size="lg" asChild className="text-lg px-10 py-7">
              <Link href="/get-started">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="mt-6 text-sm text-muted-foreground">
              No credit card required · 7-day free trial
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

