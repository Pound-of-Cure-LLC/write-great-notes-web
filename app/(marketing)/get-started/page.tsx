"use client";

import { useState } from "react";
import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/scroll-animation";

const benefits = [
  {
    icon: Clock,
    title: "Save 2+ Hours Daily",
    description: "Eliminate after-hours charting",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Notes",
    description: "Comprehensive documentation in seconds",
  },
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description: "Enterprise-grade security",
  },
  {
    icon: Zap,
    title: "EMR Integration",
    description: "Works with Charm Health & more",
  },
];

// EMR options - alphabetized, with "Other" and "No EMR" at the end
const emrOptions = [
  { value: "allscripts", label: "Allscripts" },
  { value: "athena", label: "Athena" },
  { value: "cerner", label: "Cerner" },
  { value: "charm-health", label: "Charm Health" },
  { value: "drchrono", label: "DrChrono" },
  { value: "eclinicalworks", label: "eClinicalWorks" },
  { value: "epic", label: "Epic" },
  { value: "nextgen", label: "NextGen" },
  { value: "other", label: "Other" },
  { value: "none", label: "No EMR / Paper" },
];

const practiceSizeOptions = [
  { value: "solo", label: "Solo Provider" },
  { value: "small", label: "2-5 Providers" },
  { value: "medium", label: "6-20 Providers" },
  { value: "large", label: "21-50 Providers" },
  { value: "enterprise", label: "50+ Providers" },
];

export default function GetStartedPage() {
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    practiceName: "",
    practiceSize: "",
    currentEMR: "",
    otherEMR: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Determine the EMR value to submit
    const emrValue = formState.currentEMR === "other" 
      ? formState.otherEMR 
      : formState.currentEMR;

    // Track conversion in Google Analytics
    sendGAEvent("event", "sign_up", {
      method: "Get Started Form",
      practice_size: formState.practiceSize,
      current_emr: emrValue,
    });

    try {
      // Submit directly to external API and get the lead ID
      const response = await fetch("https://api.grailhealth.ai/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formState.firstName,
          last_name: formState.lastName,
          email: formState.email,
          phone: null,
          practice_name: formState.practiceName || null,
          practice_size: formState.practiceSize || null,
          current_emr: emrValue || null,
          inquiry_type: "signup",
          message: null,
          source: "Get Started Form",
        }),
      });

      const data = await response.json();

      // Redirect to signup page with email pre-filled and lead_id for tracking
      const signupUrl = new URL("https://app.grailhealth.ai/signup");
      signupUrl.searchParams.set("email", formState.email);
      signupUrl.searchParams.set("name", `${formState.firstName} ${formState.lastName}`);
      if (formState.practiceName) {
        signupUrl.searchParams.set("practice", formState.practiceName);
      }
      // Check for both camelCase (legacy) and snake_case (new API)
      const leadId = data.leadId || data.lead_id;
      if (leadId) {
        signupUrl.searchParams.set("lead_id", leadId);
      }
      
      window.location.href = signupUrl.toString();
    } catch (err) {
      console.error("Failed to save lead:", err);
      // Still redirect even if lead save fails, just without the lead_id
      const signupUrl = new URL("https://app.grailhealth.ai/signup");
      signupUrl.searchParams.set("email", formState.email);
      signupUrl.searchParams.set("name", `${formState.firstName} ${formState.lastName}`);
      if (formState.practiceName) {
        signupUrl.searchParams.set("practice", formState.practiceName);
      }
      window.location.href = signupUrl.toString();
    }
  };

  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* Hero Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-b from-background to-muted/30 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* Left side - Form */}
              <FadeIn direction="right" className="lg:sticky lg:top-24">
                <div className="mb-8">
                  <Badge variant="secondary" className="mb-4 px-4 py-2 bg-primary/10 text-primary border-primary/20">
                    <Sparkles className="h-4 w-4 mr-2 fill-current" />
                    7-Day Free Trial
                  </Badge>
                  <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 leading-tight">
                    Start Writing Great Notes Today
                  </h1>
                  <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                    Join thousands of healthcare providers saving hours on documentation. 
                    No credit card required.
                  </p>
                </div>

                <Card className="border-0 shadow-2xl overflow-hidden ring-1 ring-primary/10">
                  <CardHeader className="pb-6 pt-8 px-8 bg-muted/10 border-b">
                    <CardTitle className="text-2xl font-bold">Create Your Free Account</CardTitle>
                    <CardDescription className="text-base">
                      Fill in your details to get started with your free trial.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                            className="h-11"
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
                            className="h-11"
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
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="practiceName">Practice/Organization Name</Label>
                        <Input
                          id="practiceName"
                          name="practiceName"
                          value={formState.practiceName}
                          onChange={handleChange}
                          placeholder="ABC Medical Practice"
                          className="h-11"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="practiceSize">Practice Size *</Label>
                          <Select
                            value={formState.practiceSize}
                            onValueChange={(value) =>
                              setFormState((prev) => ({
                                ...prev,
                                practiceSize: value,
                              }))
                            }
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              {practiceSizeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="currentEMR">Current EMR *</Label>
                          <Select
                            value={formState.currentEMR}
                            onValueChange={(value) =>
                              setFormState((prev) => ({
                                ...prev,
                                currentEMR: value,
                                // Clear otherEMR if not selecting "other"
                                otherEMR: value === "other" ? prev.otherEMR : "",
                              }))
                            }
                          >
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select EMR" />
                            </SelectTrigger>
                            <SelectContent>
                              {emrOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Show text input when "Other" is selected */}
                      {formState.currentEMR === "other" && (
                        <div className="space-y-2">
                          <Label htmlFor="otherEMR">Please specify your EMR *</Label>
                          <Input
                            id="otherEMR"
                            name="otherEMR"
                            required
                            value={formState.otherEMR}
                            onChange={handleChange}
                            placeholder="Enter your EMR name"
                            className="h-11"
                          />
                        </div>
                      )}

                      {error && (
                        <div className="text-sm text-destructive bg-destructive/10 p-4 rounded-lg font-medium">
                          {error}
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full h-14 text-lg shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                        size="lg"
                        disabled={
                          isSubmitting || 
                          !formState.practiceSize || 
                          !formState.currentEMR ||
                          (formState.currentEMR === "other" && !formState.otherEMR)
                        }
                      >
                        {isSubmitting ? "Starting Your Trial..." : "Start Free Trial"}
                        <ArrowRight className="ml-2 h-6 w-6" />
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        By continuing, you agree to our{" "}
                        <Link href="/terms" className="underline hover:text-foreground">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="underline hover:text-foreground">
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    </form>
                  </CardContent>
                </Card>

                <p className="mt-6 text-center text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="https://app.grailhealth.ai/login" className="text-primary hover:underline font-bold text-lg">
                    Sign in
                  </Link>
                </p>
              </FadeIn>

              {/* Right side - Benefits */}
              <div className="hidden lg:block pt-10">
                <FadeIn direction="left" delay={0.2}>
                  <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-10 border shadow-lg sticky top-24">
                    <h2 className="text-2xl font-bold mb-8">What You&apos;ll Get</h2>
                    <div className="space-y-8">
                      {benefits.map((benefit) => (
                        <div key={benefit.title} className="flex items-start gap-5">
                          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <benefit.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg mb-1">{benefit.title}</h3>
                            <p className="text-muted-foreground">{benefit.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-10 pt-10 border-t border-border">
                      <h3 className="font-bold text-lg mb-6">Included in Your Free Trial:</h3>
                      <ul className="space-y-4">
                        {[
                          "Unlimited transcriptions",
                          "Unlimited note generation",
                          "Custom note templates",
                          "Full feature access",
                        ].map((item) => (
                          <li key={item} className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            </div>
                            <span className="font-medium">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Benefits - Only shown on mobile */}
      <section className="py-16 bg-muted/30 lg:hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">What You&apos;ll Get</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="border-0 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-card border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-muted-foreground">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-success/80" />
              <span className="font-medium">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-success/80" />
              <span className="font-medium">No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-success/80" />
              <span className="font-medium">7-Day Free Trial</span>
            </div>
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-success/80" />
              <span className="font-medium">Setup in 5 Minutes</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
