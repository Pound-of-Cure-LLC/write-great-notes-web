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
      // Save lead to database and get the lead ID
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formState,
          currentEMR: emrValue,
          inquiryType: "signup",
          source: "Get Started Form",
        }),
      });

      const data = await response.json();

      // Redirect to signup page with email pre-filled and lead_id for tracking
      const signupUrl = new URL("https://app.writegreatnotes.ai/signup");
      signupUrl.searchParams.set("email", formState.email);
      signupUrl.searchParams.set("name", `${formState.firstName} ${formState.lastName}`);
      if (formState.practiceName) {
        signupUrl.searchParams.set("practice", formState.practiceName);
      }
      if (data.leadId) {
        signupUrl.searchParams.set("lead_id", data.leadId);
      }
      
      window.location.href = signupUrl.toString();
    } catch (err) {
      console.error("Failed to save lead:", err);
      // Still redirect even if lead save fails, just without the lead_id
      const signupUrl = new URL("https://app.writegreatnotes.ai/signup");
      signupUrl.searchParams.set("email", formState.email);
      signupUrl.searchParams.set("name", `${formState.firstName} ${formState.lastName}`);
      if (formState.practiceName) {
        signupUrl.searchParams.set("practice", formState.practiceName);
      }
      window.location.href = signupUrl.toString();
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Form */}
              <div>
                <Badge variant="secondary" className="mb-4">
                  <Sparkles className="h-3 w-3 mr-1" />
                  7-Day Free Trial
                </Badge>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                  Start Writing Great Notes Today
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Join thousands of healthcare providers saving hours on documentation. 
                  No credit card required.
                </p>

                <Card className="border-0 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Create Your Free Account</CardTitle>
                    <CardDescription>
                      Fill in your details to get started with your free trial.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                        <Label htmlFor="practiceName">Practice/Organization Name</Label>
                        <Input
                          id="practiceName"
                          name="practiceName"
                          value={formState.practiceName}
                          onChange={handleChange}
                          placeholder="ABC Medical Practice"
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
                            <SelectTrigger>
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
                            <SelectTrigger>
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
                          />
                        </div>
                      )}

                      {error && (
                        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                          {error}
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={
                          isSubmitting || 
                          !formState.practiceSize || 
                          !formState.currentEMR ||
                          (formState.currentEMR === "other" && !formState.otherEMR)
                        }
                      >
                        {isSubmitting ? "Starting Your Trial..." : "Start Free Trial"}
                        <ArrowRight className="ml-2 h-5 w-5" />
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

                <p className="mt-4 text-sm text-muted-foreground text-center">
                  Already have an account?{" "}
                  <Link href="https://app.writegreatnotes.ai/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </div>

              {/* Right side - Benefits */}
              <div className="hidden lg:block">
                <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
                  <h2 className="text-2xl font-bold mb-6">What You&apos;ll Get</h2>
                  <div className="space-y-6">
                    {benefits.map((benefit) => (
                      <div key={benefit.title} className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <benefit.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{benefit.title}</h3>
                          <p className="text-sm text-muted-foreground">{benefit.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-primary/10">
                    <h3 className="font-semibold mb-4">Included in Your Free Trial:</h3>
                    <ul className="space-y-2">
                      {[
                        "Unlimited transcriptions",
                        "Unlimited note generation",
                        "Custom note templates",
                        "EMR integration (Charm Health)",
                        "Full feature access",
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Benefits - Only shown on mobile */}
      <section className="py-12 bg-muted/30 lg:hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold mb-6 text-center">What You&apos;ll Get</h2>
          <div className="grid grid-cols-2 gap-4">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-card rounded-lg p-4 border text-center">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">{benefit.title}</h3>
                <p className="text-xs text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-card border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">7-Day Free Trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <span className="text-sm font-medium">Setup in 5 Minutes</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

