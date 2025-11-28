"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Solo",
    description: "For individual practitioners",
    monthlyPrice: 99,
    yearlyPrice: 79,
    features: [
      { name: "1 Provider", included: true },
      { name: "Unlimited transcriptions", included: true },
      { name: "Unlimited note generation", included: true },
      { name: "Custom note templates", included: true },
      { name: "Real-time status updates", included: true },
      { name: "In-app support", included: true },
      { name: "EMR integration", included: false },
      { name: "Team management", included: false },
      { name: "Priority support", included: false },
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Practice",
    description: "For small to medium practices",
    monthlyPrice: 249,
    yearlyPrice: 199,
    features: [
      { name: "Up to 10 Providers", included: true },
      { name: "Unlimited transcriptions", included: true },
      { name: "Unlimited note generation", included: true },
      { name: "Custom note templates", included: true },
      { name: "Real-time status updates", included: true },
      { name: "In-app support", included: true },
      { name: "EMR integration (Charm)", included: true },
      { name: "Team management", included: true },
      { name: "Priority support", included: false },
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For larger organizations",
    monthlyPrice: null,
    yearlyPrice: null,
    features: [
      { name: "Unlimited Providers", included: true },
      { name: "Unlimited transcriptions", included: true },
      { name: "Unlimited note generation", included: true },
      { name: "Custom note templates", included: true },
      { name: "Real-time status updates", included: true },
      { name: "Dedicated support", included: true },
      { name: "All EMR integrations", included: true },
      { name: "Advanced team management", included: true },
      { name: "Priority support & SLA", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const faqs = [
  {
    question: "How does the free trial work?",
    answer:
      "Start with a 7-day free trial with full access to all features. No credit card required. Cancel anytime.",
  },
  {
    question: "Can I change plans later?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.",
  },
  {
    question: "What EMR systems do you integrate with?",
    answer:
      "We currently integrate with Charm EMR, with Epic and Athena integrations coming soon. Contact us for specific EMR needs.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use AES-256 encryption for all PHI, maintain HIPAA compliance, and provide full audit trails.",
  },
  {
    question: "Do you offer a BAA?",
    answer:
      "Yes, we provide Business Associate Agreements (BAA) for all paid plans. Contact us to get started.",
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              Pricing
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Choose the plan that fits your practice. Start with a 7-day free
              trial, no credit card required.
            </p>

            {/* Billing Toggle */}
            <div className="mt-10 flex items-center justify-center gap-4">
              <span
                className={cn(
                  "text-sm font-medium",
                  !isYearly ? "text-foreground" : "text-muted-foreground"
                )}
              >
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  isYearly ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm",
                    isYearly && "translate-x-5"
                  )}
                />
              </button>
              <span
                className={cn(
                  "text-sm font-medium",
                  isYearly ? "text-foreground" : "text-muted-foreground"
                )}
              >
                Yearly
              </span>
              {isYearly && (
                <Badge variant="secondary" className="ml-2">
                  Save 20%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  "relative border-2",
                  plan.popular
                    ? "border-primary shadow-xl scale-105"
                    : "border-transparent shadow-lg"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    {plan.monthlyPrice !== null ? (
                      <>
                        <span className="text-4xl font-bold">
                          ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                        </span>
                        <span className="text-muted-foreground">
                          /provider/month
                        </span>
                        {isYearly && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Billed annually
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="text-3xl font-bold">Custom</span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li
                        key={feature.name}
                        className="flex items-center text-sm"
                      >
                        {feature.included ? (
                          <CheckCircle2 className="h-5 w-5 text-success mr-3 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground/50 mr-3 flex-shrink-0" />
                        )}
                        <span
                          className={
                            feature.included ? "" : "text-muted-foreground/50"
                          }
                        >
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link
                      href={
                        plan.monthlyPrice !== null ? "https://app.writegreatnotes.ai/signup" : "/contact"
                      }
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            All plans include 7-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-8">
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Still Have Questions?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our team is here to help. Schedule a demo or contact us for
              custom pricing.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link href="/contact">
                  Contact Sales
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-lg px-8 py-6"
              >
                <Link href="https://app.writegreatnotes.ai/signup">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
