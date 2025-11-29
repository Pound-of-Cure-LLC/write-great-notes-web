import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, X, ArrowRight, Zap, Send, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Essential",
    description: "For individual practitioners",
    price: 99,
    features: [
      { name: "Ambient AI medical scribe", included: true },
      { name: "400 notes per month included", included: true },
      { name: "Additional notes: $0.25 each", included: true, muted: true },
      { name: "400 faxes per month included", included: true },
      { name: "Additional faxes: $0.10 each", included: true, muted: true },
      { name: "Works with or without EMR", included: true },
      { name: "Custom note templates", included: true },
      { name: "Standard support", included: true },
      { name: "EMR integration", included: false },
      { name: "Priority support", included: false },
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Pro",
    description: "For practices needing EMR integration",
    price: 149,
    features: [
      { name: "Everything in Essential", included: true, bold: true },
      { name: "Full EMR integration", included: true },
      { name: "Priority support (24-hour response)", included: true },
      { name: "600 notes per month included", included: true },
      { name: "Additional notes: $0.25 each", included: true, muted: true },
      { name: "600 faxes per month included", included: true },
      { name: "Additional faxes: $0.10 each", included: true, muted: true },
    ],
    cta: "Start Free Trial",
    popular: true,
  },
];

const comparisonFeatures = [
  { name: "Monthly Price", essential: "$99/provider", pro: "$149/provider" },
  { name: "Ambient AI Scribe", essential: true, pro: true },
  { name: "EMR Integration", essential: "—", pro: true },
  { name: "Notes Included", essential: "400/mo", pro: "600/mo" },
  { name: "Additional Notes", essential: "$0.25 ea", pro: "$0.25 ea" },
  { name: "Faxes Included", essential: "400/mo", pro: "600/mo" },
  { name: "Additional Faxes", essential: "$0.10 ea", pro: "$0.10 ea" },
  { name: "Support Level", essential: "Standard", pro: "Priority (24h)" },
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
      "We currently integrate with Charm EMR, with AdvancedMD and Athena integrations coming soon. Contact us for specific EMR needs.",
  },
  {
    question: "Is faxing included?",
    answer:
      "Yes! All plans include a monthly allowance of faxes (400 for Essential, 600 for Pro), with additional faxes available at just $0.10 each.",
  },
  {
    question: "Are faxes HIPAA compliant?",
    answer:
      "Yes — all fax transmissions use encrypted, HIPAA-compliant channels with full audit trails.",
  },
  {
    question: "What happens after the 6-month unlimited faxing promotion?",
    answer:
      "Your plan reverts to its standard fax allowance, with inexpensive pay-as-you-go for additional faxes at $0.10 each.",
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
  return (
    <div className="flex flex-col">
      {/* Promo Banner */}
      <section className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 text-white">
            <Flame className="h-5 w-5 animate-pulse" />
            <p className="text-center font-semibold text-sm sm:text-base">
              <span className="font-bold">Limited-Time Launch Offer:</span>{" "}
              Get 6 Months of Unlimited Faxing When You Sign Up Now
            </p>
            <Flame className="h-5 w-5 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              Pricing
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the plan that fits your practice. Start with a 7-day free
              trial, no credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  "relative border-2",
                  plan.popular
                    ? "border-primary shadow-xl"
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
                    <span className="text-4xl font-bold">
                      ${plan.price}
                    </span>
                    <span className="text-muted-foreground">
                      /provider/month
                    </span>
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
                          className={cn(
                            feature.included ? "" : "text-muted-foreground/50",
                            feature.muted && "text-muted-foreground",
                            feature.bold && "font-semibold"
                          )}
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
                    <Link href="/get-started">
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

          {/* Promo Callout */}
          <div className="max-w-2xl mx-auto mt-12">
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                    <Send className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">🔥 Launch Special: 6 Months Unlimited Faxing</h3>
                    <p className="text-muted-foreground text-sm">
                      Sign up now and get unlimited faxing for your first 6 months. 
                      After that, your plan includes monthly fax credits (400 or 600 depending on plan) 
                      with additional faxes at just $0.10 each.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-8">
              Compare Plans
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4 font-semibold">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold">Essential</th>
                    <th className="text-center py-4 px-4 font-semibold">
                      <span className="inline-flex items-center gap-1">
                        Pro
                        <Badge variant="secondary" className="text-xs">Popular</Badge>
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, idx) => (
                    <tr key={feature.name} className={cn("border-b", idx % 2 === 0 && "bg-muted/50")}>
                      <td className="py-4 px-4 font-medium">{feature.name}</td>
                      <td className="text-center py-4 px-4">
                        {feature.essential === true ? (
                          <CheckCircle2 className="h-5 w-5 text-success mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">{feature.essential}</span>
                        )}
                      </td>
                      <td className="text-center py-4 px-4">
                        {feature.pro === true ? (
                          <CheckCircle2 className="h-5 w-5 text-success mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">{feature.pro}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Integrated Faxing Feature Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Send className="h-7 w-7 text-primary" />
                <h2 className="text-2xl font-bold tracking-tight">
                  Integrated Faxing System
                </h2>
              </div>
              <div className="mb-3">
                <Badge variant="secondary">Included in Every Plan</Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Every plan includes built-in faxing that automatically sends your completed 
                notes to referring physicians, specialists, and other care partners.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Faxing Included</h3>
                      <p className="text-sm text-muted-foreground">
                        Each plan includes a monthly allowance of faxes to send notes 
                        directly to referring physicians and care partners.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Monthly Allowances</h3>
                      <p className="text-sm text-muted-foreground">
                        Essential: 400 faxes/month<br />
                        Pro: 600 faxes/month
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Low-Cost Additional Faxes</h3>
                      <p className="text-sm text-muted-foreground">
                        Need more? Additional faxes are only <strong>$0.10 each</strong>. 
                        Never worry about running out.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Automatic Delivery</h3>
                      <p className="text-sm text-muted-foreground">
                        Notes can be faxed automatically as soon as they are generated. 
                        No extra steps required.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">HIPAA-Compliant</h3>
                      <p className="text-sm text-muted-foreground">
                        All transmissions are encrypted and HIPAA-compliant with 
                        full audit trails.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Faxing Callout */}
            <Card className="mt-8 bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground italic">
                  &quot;Faxing is a critical part of medical workflows. WriteGreatNotes.ai 
                  makes it automatic, affordable, and fully integrated with the clinical 
                  note creation process.&quot;
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
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
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl mb-4">
              Still Have Questions?
            </h2>
            <p className="text-muted-foreground mb-6">
              Our team is here to help. Contact us for custom pricing or
              enterprise solutions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link href="/get-started">
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
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
