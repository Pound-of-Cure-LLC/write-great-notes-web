import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, X, ArrowRight, Zap, Send, Flame, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/scroll-animation";
import { SampleNoteModal } from "@/components/marketing/sample-note-modal";

interface PlanFeature {
  name: string;
  included: boolean;
  bold?: boolean;
  muted?: boolean;
}

const plans = [
  {
    name: "Essential",
    description: "For individual practitioners",
    price: 99,
    features: [
      { name: "Ambient AI medical scribe", included: true },
      { name: "250 notes per month included", included: true },
      { name: "Additional notes: $0.25 each", included: true, muted: true },
      { name: "200 faxes per month included", included: true },
      { name: "Additional faxes: $0.10/page", included: true, muted: true },
      { name: "Works with or without EMR", included: true },
      { name: "Custom note templates", included: true },
      { name: "Standard support", included: true },
      { name: "EMR integration", included: false },
      { name: "Priority support", included: false },
    ] as PlanFeature[],
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
      { name: "Additional faxes: $0.10/page", included: true, muted: true },
    ] as PlanFeature[],
    cta: "Start Free Trial",
    popular: true,
  },
];

const comparisonFeatures = [
  { name: "Monthly Price", essential: "$99/provider", pro: "$149/provider" },
  { name: "Ambient AI Scribe", essential: true, pro: true },
  { name: "EMR Integration", essential: "—", pro: true },
  { name: "Notes Included", essential: "250/mo", pro: "600/mo" },
  { name: "Additional Notes", essential: "$0.25 ea", pro: "$0.25 ea" },
  { name: "Faxes Included", essential: "200/mo", pro: "600/mo" },
  { name: "Additional Faxes", essential: "$0.10/page", pro: "$0.10/page" },
  { name: "Support Level", essential: "Standard", pro: "Priority (24h)" },
];

const faqs = [
  {
    question: "How does the free trial work?",
    answer:
      "Start with a 7-day free trial with full access to all features. Cancel anytime.",
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
      "Yes! All plans include a monthly allowance of faxes (200 for Essential, 600 for Pro), with additional faxes available at just $0.10/page.",
  },
  {
    question: "Are faxes HIPAA compliant?",
    answer:
      "Yes — all fax transmissions use encrypted, HIPAA-compliant channels with full audit trails.",
  },
  {
    question: "What happens after the 6-month unlimited faxing promotion?",
    answer:
      "Your plan reverts to its standard fax allowance, with inexpensive pay-as-you-go for additional faxes at $0.10/page.",
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
    <div className="flex flex-col overflow-x-hidden">
      {/* Promo Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 py-3 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 text-white">
            <Flame className="h-5 w-5 animate-pulse" />
            <p className="text-center font-semibold text-sm sm:text-base tracking-wide">
              <span className="font-extrabold uppercase">Limited-Time:</span>{" "}
              Get 6 Months of <span className="underline decoration-white/50 underline-offset-4">Unlimited Faxing</span> When You Sign Up Now
            </p>
            <Flame className="h-5 w-5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <FadeIn>
              <Badge variant="secondary" className="mb-6 px-4 py-2 bg-primary/10 text-primary border-primary/20">
                Pricing
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-8">
                Simple, Transparent Pricing
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Choose the plan that fits your practice. Start with a 7-day free
                trial.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <StaggerItem key={plan.name} className="h-full">
                <Card
                  className={cn(
                    "relative border-2 h-full flex flex-col transition-all duration-300 hover:-translate-y-2",
                    plan.popular
                      ? "border-primary shadow-2xl z-10 scale-105 md:scale-110"
                      : "border-border shadow-lg hover:shadow-xl bg-card/50"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1 text-base shadow-lg">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4 pt-8">
                    <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="text-center mb-8">
                      <span className="text-5xl font-bold tracking-tight">
                        ${plan.price}
                      </span>
                      <span className="text-muted-foreground block mt-2 font-medium">
                        /provider/month
                      </span>
                    </div>

                    <ul className="space-y-4 mb-8 flex-1">
                      {plan.features.map((feature) => (
                        <li
                          key={feature.name}
                          className="flex items-start text-sm group"
                        >
                          {feature.included ? (
                            <CheckCircle2 className="h-5 w-5 text-success mr-3 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground/40 mr-3 flex-shrink-0 mt-0.5" />
                          )}
                          <span
                            className={cn(
                              "leading-relaxed",
                              feature.included ? "text-foreground" : "text-muted-foreground/50",
                              feature.muted && "text-muted-foreground",
                              feature.bold && "font-bold"
                            )}
                          >
                            {feature.name}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={cn("w-full py-6 text-lg shadow-md transition-all", plan.popular && "shadow-primary/25 hover:shadow-primary/40")}
                      variant={plan.popular ? "default" : "outline"}
                      asChild
                    >
                      <Link href="/get-started">
                        {plan.cta}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <FadeIn delay={0.4}>
            <p className="text-center text-muted-foreground mt-12 font-medium">
              All plans include a 7-day free trial.
            </p>
          </FadeIn>

          {/* Promo Callout */}
          <FadeIn delay={0.6}>
            <div className="max-w-3xl mx-auto mt-20">
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800 overflow-hidden shadow-lg">
                <CardContent className="p-8 sm:p-10">
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg rotate-3">
                      <Send className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl sm:text-2xl mb-3 flex items-center gap-2">
                        <Flame className="h-6 w-6 text-orange-500 fill-orange-500" />
                        Launch Special: 6 Months Unlimited Faxing
                      </h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        Sign up now and get unlimited faxing for your first 6 months. 
                        After that, your plan includes monthly fax credits (200 or 600 depending on plan)
                        with additional faxes at just $0.10/page.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-20 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <FadeIn>
              <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
                Compare Plans
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="overflow-x-auto rounded-2xl border bg-card shadow-sm">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-6 px-6 font-bold text-lg">Feature</th>
                      <th className="text-center py-6 px-6 font-bold text-lg w-1/3">Essential</th>
                      <th className="text-center py-6 px-6 font-bold text-lg w-1/3 bg-primary/5">
                        <div className="flex flex-col items-center">
                          Pro
                          <Badge variant="secondary" className="mt-1 text-[10px] h-5">Popular</Badge>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {comparisonFeatures.map((feature, idx) => (
                      <tr key={feature.name} className={cn("hover:bg-muted/20 transition-colors", idx % 2 === 0 && "bg-muted/10")}>
                        <td className="py-5 px-6 font-medium">{feature.name}</td>
                        <td className="text-center py-5 px-6">
                          {feature.essential === true ? (
                            <CheckCircle2 className="h-6 w-6 text-success mx-auto" />
                          ) : (
                            <span className="text-muted-foreground font-medium">{feature.essential}</span>
                          )}
                        </td>
                        <td className="text-center py-5 px-6 bg-primary/5 font-medium">
                          {feature.pro === true ? (
                            <CheckCircle2 className="h-6 w-6 text-success mx-auto" />
                          ) : (
                            <span className="text-foreground">{feature.pro}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Integrated Faxing Feature Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <FadeIn>
              <div className="text-center mb-16">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Send className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                  Integrated Faxing System
                </h2>
                <Badge variant="outline" className="mb-6 text-base py-1 px-4">Included in Every Plan</Badge>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Every plan includes built-in faxing that automatically sends your completed 
                  notes to referring physicians, specialists, and other care partners.
                </p>
              </div>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <StaggerItem>
                <Card className="h-full border-primary/10 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-5">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Faxing Included</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Each plan includes a monthly allowance of faxes to send notes 
                          directly to referring physicians and care partners.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="h-full border-primary/10 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-5">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Zap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Monthly Allowances</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Essential: 200 faxes/month<br />
                          Pro: 600 faxes/month
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="h-full border-primary/10 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-5">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Low-Cost Additional Faxes</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Need more? Additional faxes are only <strong>$0.10/page</strong>. 
                          Never worry about running out.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>

              <StaggerItem>
                <Card className="h-full border-primary/10 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-5">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Zap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Automatic Delivery</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Notes can be faxed automatically as soon as they are generated. 
                          No extra steps required.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            </StaggerContainer>
            
            <FadeIn delay={0.4}>
              <Card className="mt-12 bg-primary/5 border-primary/20 shadow-inner">
                <CardContent className="p-8 text-center">
                  <p className="text-xl text-muted-foreground italic font-medium">
                    &quot;Faxing is a critical part of medical workflows. WriteGreatNotes.ai 
                    makes it automatic, affordable, and fully integrated with the clinical 
                    note creation process.&quot;
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <FadeIn>
              <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
                Frequently Asked Questions
              </h2>
            </FadeIn>
            <StaggerContainer className="space-y-6">
              {faqs.map((faq) => (
                <StaggerItem key={faq.question}>
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6 sm:p-8">
                      <h3 className="text-lg font-bold mb-3">{faq.question}</h3>
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Still Have Questions?
              </h2>
              <p className="text-xl text-muted-foreground mb-10">
                Our team is here to help. Contact us for custom pricing or
                enterprise solutions.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <Button size="lg" asChild className="text-lg px-10 py-7 shadow-lg transition-all hover:scale-105">
                  <Link href="/get-started">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <SampleNoteModal
                  trigger={
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-lg px-8 py-7 border-2 gap-2"
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
