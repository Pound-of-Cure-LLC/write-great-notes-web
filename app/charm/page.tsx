"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  ArrowRight,
  Zap,
  FileSignature,
  Upload,
  Brain,
  Shield,
  Clock,
  RefreshCw,
} from "lucide-react";

const integrationFeatures = [
  {
    icon: Zap,
    title: "Instant Connection",
    description:
      "Enter your Charm API credentials once and you're connected. No IT support needed, no complex setup—just paste and go.",
  },
  {
    icon: Upload,
    title: "Direct Push to Charm",
    description:
      "Notes are pushed directly to your Charm patient charts with a single click. No copy-paste, no switching windows.",
  },
  {
    icon: FileSignature,
    title: "Sign Notes in Our Interface",
    description:
      "Review, edit, and sign your notes right from Write Great Notes. Your signature syncs instantly to Charm.",
  },
  {
    icon: Brain,
    title: "AI Patient Summary",
    description:
      "Get an intelligent summary of your patient before every visit—pulled directly from Charm and enhanced with AI.",
  },
  {
    icon: RefreshCw,
    title: "Real-Time Sync",
    description:
      "Patient demographics, vitals, and previous notes are automatically synced from Charm. Always up to date.",
  },
  {
    icon: Clock,
    title: "Same-Day Notes",
    description:
      "Complete all your documentation before you leave for the day. No more pajama time charting.",
  },
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description:
      "Enterprise-grade security with full HIPAA compliance. Your patient data is always protected.",
  },
];

export default function CharmLandingPage() {
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    practiceSize: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formState,
          currentEMR: "Charm Health",
          inquiryType: "Charm Integration",
          source: "Charm Health Landing Page",
        }),
      });

      const data = await response.json();

      if (data.mailto) {
        window.open(
          `mailto:${data.mailto.to}?subject=${data.mailto.subject}&body=${data.mailto.body}`,
          "_blank"
        );
      }

      setIsSubmitted(true);
    } catch {
      // Still show success since mailto will open
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/images/write-great-notes-logo.png"
                alt="Write Great Notes"
                className="h-8 w-auto"
              />
              <span className="font-semibold text-lg hidden sm:inline">Write Great Notes</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="https://app.writegreatnotes.ai/login"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Link>
              <Button asChild size="sm">
                <Link href="/signup">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-[#2E6FA8]/5 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Partner Logos */}
            <div className="flex items-center justify-center gap-4 sm:gap-8 mb-8">
              <img
                src="/images/write-great-notes-logo.png"
                alt="Write Great Notes"
                className="h-10 sm:h-12 w-auto"
              />
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#2E6FA8]" />
                <span className="text-sm font-medium text-muted-foreground">
                  integrated with
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 32 32" className="h-8 sm:h-10 w-8 sm:w-10" fill="none">
                  <rect width="32" height="32" rx="6" fill="#2E6FA8"/>
                  <path d="M16 6C10.477 6 6 10.477 6 16s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" fill="white"/>
                  <path d="M16 10c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z" fill="white"/>
                </svg>
                <span className="text-xl sm:text-2xl font-bold text-[#2E6FA8]">
                  CharmHealth
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <CheckCircle2 className="h-4 w-4" />
              Live Integration Available Now
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Supercharge Your{" "}
              <span className="text-[#2E6FA8]">Charm Health</span> EHR with AI
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              Write Great Notes integrates deeply with Charm Health to bring
              AI-powered ambient scribing, automatic note generation, and
              one-click signing directly to your workflow.
            </p>

            {/* Seamless Setup Callout */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-xl mx-auto mb-8 shadow-lg border border-slate-200 dark:border-slate-700">
              <p className="text-lg font-semibold text-foreground mb-2">
                ⚡ Setup in Minutes, Not Days
              </p>
              <p className="text-muted-foreground">
                Get your API credentials from Charm Health, enter them once, and you&apos;re connected. 
                That&apos;s it—no IT department needed, no complex configuration. 
                <span className="font-medium text-foreground"> Login and start documenting.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <a href="#contact-form">
                  Get Started with Charm
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6"
                asChild
              >
                <Link href="/how-it-works">See How It Works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Features */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Deep Charm Health Integration
            </h2>
            <p className="text-lg text-muted-foreground">
              Not just another add-on. Write Great Notes connects directly to
              Charm Health to enhance every part of your documentation workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {integrationFeatures.map((feature) => (
              <Card
                key={feature.title}
                className="border-0 shadow-md hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-[#2E6FA8]/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-6 w-6 text-[#2E6FA8]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                How the Integration Works
              </h2>
              <p className="text-lg text-slate-300">
                Seamless workflow from patient visit to signed note
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  step: "1",
                  title: "Get Your Charm API Credentials",
                  description:
                    "Request your API credentials from Charm Health. They'll provide everything you need—usually within 24-48 hours.",
                },
                {
                  step: "2",
                  title: "Enter Credentials & Connect",
                  description:
                    "Paste your credentials into Write Great Notes. Click connect. That's it—the integration is automatic and instant.",
                },
                {
                  step: "3",
                  title: "Select a Patient & Start Recording",
                  description:
                    "Your Charm patient list appears automatically. Select a patient, and their data, vitals, and history are pulled in real-time.",
                },
                {
                  step: "4",
                  title: "Have Your Conversation Naturally",
                  description:
                    "Ambient listening captures your natural conversation. Focus on your patient, not your keyboard.",
                },
                {
                  step: "5",
                  title: "One-Click Sign & Push",
                  description:
                    "AI generates your note. Review, sign, and it's instantly pushed to Charm. No copy-paste, no switching systems.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6">
                  <div className="h-12 w-12 rounded-full bg-[#2E6FA8] flex items-center justify-center flex-shrink-0 text-xl font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-slate-300">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground">
                Fill out the form below and we&apos;ll help you get set up with
                Write Great Notes + Charm Health integration.
              </p>
            </div>

            <Card className="border-0 shadow-xl">
              <CardContent className="pt-6">
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                    <p className="text-muted-foreground mb-6">
                      We&apos;ve received your request and will be in touch
                      within 24 hours to help you get started with Charm Health
                      integration.
                    </p>
                    <Button asChild>
                      <Link href="/">Explore Write Great Notes</Link>
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          required
                          value={formState.firstName}
                          onChange={handleChange}
                          placeholder="John"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          required
                          value={formState.lastName}
                          onChange={handleChange}
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Work Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formState.email}
                        onChange={handleChange}
                        placeholder="john.doe@practice.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formState.phone}
                        onChange={handleChange}
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Practice Name *</Label>
                      <Input
                        id="company"
                        name="company"
                        required
                        value={formState.company}
                        onChange={handleChange}
                        placeholder="ABC Medical Practice"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="practiceSize">Practice Size</Label>
                      <Select
                        value={formState.practiceSize}
                        onValueChange={(value) =>
                          setFormState((prev) => ({
                            ...prev,
                            practiceSize: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solo">Solo Provider</SelectItem>
                          <SelectItem value="small">2-5 Providers</SelectItem>
                          <SelectItem value="medium">6-20 Providers</SelectItem>
                          <SelectItem value="large">21-50 Providers</SelectItem>
                          <SelectItem value="enterprise">
                            50+ Providers
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">
                        Anything else we should know?
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formState.message}
                        onChange={handleChange}
                        placeholder="Tell us about your practice..."
                        rows={3}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#2E6FA8] hover:bg-[#2E6FA8]/90"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Get Started with Charm"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      By submitting this form, you agree to our{" "}
                      <Link
                        href="/privacy"
                        className="underline hover:text-foreground"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img
                src="/images/write-great-notes-logo.png"
                alt="Write Great Notes"
                className="h-6 w-auto"
              />
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Write Great Notes
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/features" className="hover:text-foreground">
                Features
              </Link>
              <Link href="/pricing" className="hover:text-foreground">
                Pricing
              </Link>
              <Link href="/privacy" className="hover:text-foreground">
                Privacy
              </Link>
              <Link href="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

