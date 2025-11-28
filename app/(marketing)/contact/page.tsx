"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    description: "Get a response within 24 hours",
    contact: "support@writegreatnotes.ai",
    href: "mailto:support@writegreatnotes.ai",
  },
  {
    icon: Calendar,
    title: "Schedule a Demo",
    description: "See the product in action",
    contact: "Book a 30-min call",
    href: "/contact#demo-form",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Available Mon-Fri 9am-5pm ET",
    contact: "Start a conversation",
    href: "#",
  },
];

export default function ContactPage() {
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    practiceSize: "",
    currentEMR: "",
    inquiryType: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formState,
          source: "Main Contact Form",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit form");
      }

      // Open mailto as fallback to ensure email is sent
      if (data.mailto) {
        window.open(
          `mailto:${data.mailto.to}?subject=${data.mailto.subject}&body=${data.mailto.body}`,
          "_blank"
        );
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              Contact
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Let&apos;s Talk
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Have questions about Write Great Notes? Want to schedule a demo?
              We&apos;re here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {contactMethods.map((method) => (
              <Card key={method.title} className="border-0 shadow-md text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <method.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{method.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {method.description}
                  </p>
                  <Link
                    href={method.href}
                    className="text-primary hover:underline font-medium"
                  >
                    {method.contact}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="demo-form" className="py-20 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Request a Demo</CardTitle>
                <CardDescription>
                  Fill out the form below and we&apos;ll get back to you within 24
                  hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="h-8 w-8 text-success" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Thank You!
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      We&apos;ve received your request and will be in touch within
                      24 hours.
                    </p>
                    <Button asChild>
                      <Link href="/">Return to Home</Link>
                    </Button>
                  </div>
                ) : (
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
                      <Label htmlFor="company">Practice/Organization Name *</Label>
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
                      <Label htmlFor="currentEMR">What EMR do you currently use? *</Label>
                      <Input
                        id="currentEMR"
                        name="currentEMR"
                        required
                        value={formState.currentEMR}
                        onChange={handleChange}
                        placeholder="e.g., Epic, Charm, Athena, eClinicalWorks..."
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
                            <SelectItem value="solo">Solo Provider</SelectItem>
                            <SelectItem value="small">2-5 Providers</SelectItem>
                            <SelectItem value="medium">6-20 Providers</SelectItem>
                            <SelectItem value="large">21-50 Providers</SelectItem>
                            <SelectItem value="enterprise">50+ Providers</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inquiryType">Inquiry Type *</Label>
                        <Select
                          value={formState.inquiryType}
                          onValueChange={(value) =>
                            setFormState((prev) => ({
                              ...prev,
                              inquiryType: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="demo">Request a Demo</SelectItem>
                            <SelectItem value="pricing">Pricing Question</SelectItem>
                            <SelectItem value="emr">EMR Integration</SelectItem>
                            <SelectItem value="support">Technical Support</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formState.message}
                        onChange={handleChange}
                        placeholder="Tell us about your practice and what you're looking for..."
                        rows={4}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isSubmitting}
                      isLoading={isSubmitting}
                      loadingText="Submitting..."
                    >
                      Submit Request
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      By submitting this form, you agree to our{" "}
                      <Link href="/privacy" className="underline hover:text-foreground">
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

      {/* Quick Start CTA */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Prefer to Get Started Right Away?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Skip the demo and start your free trial today. No credit card
              required.
            </p>
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
