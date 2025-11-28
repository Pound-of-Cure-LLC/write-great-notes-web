"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Heart,
  Scale,
  Puzzle,
  Mic,
  Copy,
  XCircle,
  Upload,
  Link2,
  RefreshCw,
} from "lucide-react";

const oldWayProblems = [
  {
    icon: Copy,
    title: "Copy-Paste Templates",
    description: "The same generic text for every patient. \"Patient is a pleasant X-year-old...\"",
  },
  {
    icon: FileText,
    title: "Dot Phrases & SmartText",
    description: "Pre-written paragraphs that say nothing specific about this patient's visit.",
  },
  {
    icon: XCircle,
    title: "Checkbox Medicine",
    description: "Click, click, click. Documentation that satisfies requirements but tells no story.",
  },
];

const newWayBenefits = [
  {
    icon: Mic,
    title: "Ambient Listening",
    description: "Talk to your patient, not your computer. We capture the real conversation.",
  },
  {
    icon: FileText,
    title: "Narrative Notes",
    description: "Comprehensive documentation that tells the story of each unique encounter.",
  },
  {
    icon: Sparkles,
    title: "Like You Were Taught",
    description: "Proper clinical documentation: HPI, ROS, Physical Exam, Assessment & Plan. Done right.",
  },
];

const features = [
  {
    icon: Upload,
    title: "Your Format, Your Style",
    description:
      "Upload an example note and we'll match your format exactly. Dermatology, cardiology, primary care—your notes look like YOUR notes.",
  },
  {
    icon: Link2,
    title: "Growing EMR Integrations",
    description:
      "We're building integrations with major EMRs and adding new ones monthly. Don't see yours? Let us know—it's probably next.",
  },
  {
    icon: Clock,
    title: "No Waiting, No Backlog",
    description:
      "See your patient, move to the next. Your notes are ready when you need them—no staying late.",
  },
  {
    icon: Shield,
    title: "Insurance-Ready",
    description:
      "Thorough documentation that supports medical necessity and stands up to audits.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-24 sm:py-32">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            {/* Main headline */}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground mb-6">
              You listen. You examine. You care.
            </h1>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
              Your notes should show it.
            </p>

            <p className="mt-8 text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              AI-powered ambient scribing that captures your conversations 
              and generates comprehensive, professional notes.
            </p>

            <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
              <Button 
                size="lg" 
                asChild 
                className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 shadow-lg transition-all hover:scale-105"
              >
                <Link href="https://app.writegreatnotes.ai/signup">
                  Start Writing Great Notes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7"
              >
                <Link href="/how-it-works">
                  See How It Works
                </Link>
              </Button>
            </div>
            
            <p className="mt-6 text-sm text-muted-foreground">
              No credit card required · 7-day free trial · Works with any EMR
            </p>
          </div>
        </div>

        {/* Decorative glow using brand colors */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Additional brand color decoration */}
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

      {/* Your Notes, Your Way Section */}
      <section className="py-24 sm:py-32 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-primary font-semibold text-xl uppercase tracking-wider mb-4">
                <Upload className="h-5 w-5" />
                Personalized to You
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Your notes should look like
                <br />
                <span className="text-primary">your notes.</span>
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  Every specialty is different. Every provider has their own style. 
                  That&apos;s why Write Great Notes learns <em>your</em> format.
                </p>
                <p>
                  <strong className="text-foreground">Upload one example note</strong> and our AI parses your structure, 
                  your sections, your style. Future notes match your format exactly.
                </p>
                <p>
                  Dermatology SOAP notes. Cardiology consults. Primary care visits. 
                  Psychiatry evaluations. <strong className="text-foreground">Your notes look like YOUR notes.</strong>
                </p>
              </div>
            </div>
            <div className="bg-muted/30 rounded-2xl p-8 border border-border">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Upload an example</h3>
                    <p className="text-muted-foreground">Paste one of your best notes—the format you want to keep using.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">We learn your style</h3>
                    <p className="text-muted-foreground">AI parses your sections, headings, and documentation patterns.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Every note matches</h3>
                    <p className="text-muted-foreground">All future notes follow your format. Consistency without the copy-paste.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fight Insurance AI Section */}
      <section className="py-24 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 text-destructive font-semibold text-xl uppercase tracking-wider mb-4">
                <Shield className="h-5 w-5" />
                Fight Back
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Insurance companies use AI to deny your claims.
                <br />
                <span className="text-primary">Fight back with better AI.</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Insurance companies are using algorithms to scan your notes for any excuse to deny payment. 
                Incomplete documentation? Denied. Missing medical necessity? Denied. 
                Template notes make you an easy target.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-destructive mb-4 flex items-center gap-2">
                  <XCircle className="h-6 w-6" />
                  What Insurance AI Looks For
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-destructive font-bold">×</span>
                    <span>Vague or templated language</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-destructive font-bold">×</span>
                    <span>Missing documentation of medical necessity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-destructive font-bold">×</span>
                    <span>Lack of clinical reasoning for decisions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-destructive font-bold">×</span>
                    <span>Copy-paste notes that look identical</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-destructive font-bold">×</span>
                    <span>Missing pertinent negatives</span>
                  </li>
                </ul>
              </div>

              <div className="bg-success/5 border border-success/20 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-success mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6" />
                  What Write Great Notes Generates
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Unique, patient-specific narratives</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Clear documentation of medical necessity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Clinical reasoning in assessment & plan</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Detailed HPI with context and timeline</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Relevant positives AND negatives</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-lg text-foreground font-semibold">
                You provide excellent care. Don&apos;t let insurance algorithms say otherwise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution: AI Ambient Scribing */}
      <section className="py-24 sm:py-32 bg-slate-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 text-slate-300 font-semibold text-xl uppercase tracking-wider mb-4">
                <Sparkles className="h-5 w-5" />
                The New Way
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-white">
                Write comprehensive notes.
                <br />
                AI handles the typing.
              </h2>
              <p className="mt-6 text-xl text-slate-300 max-w-2xl mx-auto">
                AI ambient scribing captures your real conversations and generates notes 
                with actual clinical reasoning. No templates. No shortcuts.
              </p>
            </div>

            {/* Example of good note */}
            <div className="bg-slate-800 rounded-2xl p-6 sm:p-8 mb-12 border border-slate-700">
              <p className="text-sm text-slate-400 uppercase tracking-wider mb-4">What great notes look like:</p>
              <div className="text-sm text-slate-200 space-y-4 bg-slate-800/50 rounded-lg p-4 sm:p-6">
                <p><strong className="text-white">HPI:</strong> Mr. Johnson is a 45-year-old carpenter who presents with progressive right knee pain over the past 3 weeks. He reports the pain began after kneeling for extended periods while installing flooring. Pain is localized to the anterior knee, worse with stairs and prolonged sitting, rated 6/10. He has tried ibuprofen with minimal relief. He denies locking, giving way, or swelling. No prior knee injuries or surgeries.</p>
                <p><strong className="text-white">Assessment:</strong> Presentation is most consistent with patellofemoral syndrome given the anterior location, provocation with stairs and prolonged flexion, and occupational risk factors. Less likely but considered: prepatellar bursitis (no visible swelling on exam), meniscal pathology (no mechanical symptoms).</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {newWayBenefits.map((benefit) => (
                <div key={benefit.title} className="bg-slate-800 rounded-xl p-5 sm:p-6 border border-slate-700">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-white">{benefit.title}</h3>
                      <p className="text-slate-300">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EMR Integration Section */}
      <section className="py-24 sm:py-32 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 text-primary font-semibold text-xl uppercase tracking-wider mb-4">
              <Link2 className="h-5 w-5" />
              Designed for Integration
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Built to work with your EMR.
              <br />
              <span className="text-primary">New integrations every month.</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Write Great Notes was designed from day one to integrate with your existing workflow. 
              We&apos;re adding new EMR integrations constantly—and if yours isn&apos;t on the list yet, it&apos;s probably next.
            </p>
            
            {/* EMR Logos/Names */}
            <div className="bg-muted/30 rounded-2xl p-8 border border-border mb-8">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-6">Current & Coming Soon</p>
              <div className="flex flex-wrap justify-center gap-4">
                {/* Charm Health - Available Now */}
                <Link 
                  href="/integrations/charm-health"
                  className="px-6 py-3 bg-success/10 rounded-lg border-2 border-success text-success font-semibold hover:bg-success/20 transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Charm Health
                </Link>
                {/* Other EMRs - On Roadmap */}
                {[
                  { name: "Epic", slug: "epic" },
                  { name: "Cerner", slug: "cerner" },
                  { name: "Athena", slug: "athena" },
                  { name: "eClinicalWorks", slug: "eclinicalworks" },
                  { name: "NextGen", slug: "nextgen" },
                  { name: "Allscripts", slug: "allscripts" },
                  { name: "DrChrono", slug: "drchrono" },
                ].map((emr) => (
                  <Link 
                    key={emr.slug}
                    href={`/integrations/${emr.slug}`}
                    className="px-6 py-3 bg-card rounded-lg border border-border text-foreground font-medium hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    {emr.name}
                  </Link>
                ))}
                <Link 
                  href="/contact?type=emr"
                  className="px-6 py-3 bg-card rounded-lg border border-dashed border-border text-muted-foreground font-medium hover:border-primary hover:text-foreground transition-colors"
                >
                  + Other EMRs
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                <span className="text-success font-medium">✓ Available now</span> · Click any EMR to learn more or express interest—<span className="text-primary font-medium">demand drives our roadmap!</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { number: "0", label: "Data migrations needed" },
                { number: "New", label: "Integrations monthly", icon: RefreshCw },
                { number: "5 min", label: "To get started" },
              ].map((stat) => (
                <div key={stat.label} className="bg-muted/50 rounded-xl p-6 border border-border">
                  <div className="text-4xl font-black text-primary mb-2">{stat.number}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Deep EMR Integration Section */}
      <section className="py-24 sm:py-32 bg-slate-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 text-slate-300 font-semibold text-xl uppercase tracking-wider mb-4">
                <Sparkles className="h-5 w-5" />
                Deep EMR Integration
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
                Your EMR, supercharged with AI.
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Write Great Notes doesn&apos;t just sit alongside your EMR—it reaches deep into your existing 
                system to pull the context you need and enhance every patient encounter with powerful AI.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[
                {
                  title: "AI Patient Summary",
                  description: "Get an intelligent summary of your patient before every visit—medical history, recent visits, and key concerns synthesized by AI.",
                  icon: "🧠",
                },
                {
                  title: "Previous Notes",
                  description: "Access past notes directly from your EMR. Review previous encounters without switching systems.",
                  icon: "📋",
                },
                {
                  title: "Live Vitals",
                  description: "Current vitals pulled automatically from your EMR and incorporated into your notes.",
                  icon: "💓",
                },
                {
                  title: "Demographics",
                  description: "Patient demographics flow directly from your EMR—no duplicate data entry.",
                  icon: "👤",
                },
                {
                  title: "Referring Providers",
                  description: "See referring provider information and context for every referral patient.",
                  icon: "🔗",
                },
                {
                  title: "More Coming Monthly",
                  description: "We're constantly adding new AI-powered features that enhance your existing EMR capabilities.",
                  icon: "🚀",
                },
              ].map((feature) => (
                <div key={feature.title} className="bg-slate-800 rounded-xl p-5 sm:p-6 border border-slate-700">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{feature.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-white">{feature.title}</h3>
                      <p className="text-slate-300 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-lg text-slate-200 mb-4">
                Think of it as <strong className="text-white">AI co-pilot features</strong> for the EMR you already use.
              </p>
              <p className="text-slate-400">
                No migration. No new system to learn. Just powerful new capabilities added to your existing workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fight Insurance AI Section */}
      <section className="py-24 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 text-destructive font-semibold text-xl uppercase tracking-wider mb-4">
                <Shield className="h-5 w-5" />
                Fight Back
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Insurance companies use AI to deny your claims.
                <br />
                <span className="text-primary">Fight back with better AI.</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Insurance companies are using algorithms to scan your notes for any excuse to deny payment. 
                Incomplete documentation? Denied. Missing medical necessity? Denied. 
                Template notes make you an easy target.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-destructive mb-4 flex items-center gap-2">
                  <XCircle className="h-6 w-6" />
                  What Insurance AI Looks For
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-destructive font-bold">×</span>
                    <span>Vague or templated language</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-destructive font-bold">×</span>
                    <span>Missing documentation of medical necessity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-destructive font-bold">×</span>
                    <span>Lack of clinical reasoning for decisions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-destructive font-bold">×</span>
                    <span>Copy-paste notes that look identical</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-destructive font-bold">×</span>
                    <span>Missing pertinent negatives</span>
                  </li>
                </ul>
              </div>

              <div className="bg-success/5 border border-success/20 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-success mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6" />
                  What Write Great Notes Generates
                </h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Unique, patient-specific narratives</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Clear documentation of medical necessity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Clinical reasoning in assessment & plan</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Detailed HPI with context and timeline</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span>Relevant positives AND negatives</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-lg text-foreground font-semibold">
                You provide excellent care. Don&apos;t let insurance algorithms say otherwise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Work-Life Balance Section */}
      <section className="py-24 sm:py-32 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 text-white/90 font-semibold text-xl uppercase tracking-wider mb-4">
              <Heart className="h-5 w-5" />
              Be a Professional, Not a Box Checker
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
              Clock in. See patients.
              <br />
              Go home on time.
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
              You didn&apos;t spend years training to stay late clicking checkboxes. 
              With Write Great Notes, you can log off at the end of your day knowing 
              every note is complete—and every note reflects the quality care you provided.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left">
              <div className="bg-white/20 rounded-xl p-5 sm:p-6 border border-white/30">
                <div className="text-4xl mb-4">☀️</div>
                <h3 className="text-lg font-semibold mb-2 text-white">Morning</h3>
                <p className="text-white/90">
                  Log in. Review your schedule. Start seeing patients.
                </p>
              </div>
              <div className="bg-white/20 rounded-xl p-5 sm:p-6 border border-white/30">
                <div className="text-4xl mb-4">🩺</div>
                <h3 className="text-lg font-semibold mb-2 text-white">During the Day</h3>
                <p className="text-white/90">
                  Focus on patients. AI captures and documents each encounter as you go.
                </p>
              </div>
              <div className="bg-white/20 rounded-xl p-5 sm:p-6 border border-white/30">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="text-lg font-semibold mb-2 text-white">End of Day</h3>
                <p className="text-white/90">
                  Log off. Go home. All notes complete. No pajama time documentation.
                </p>
              </div>
            </div>

            <p className="mt-12 text-lg text-white/90 italic">
              &ldquo;I haven&apos;t brought work home in months. I forgot what that felt like.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 sm:py-32 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              Built for real clinical workflows
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From primary care to specialists. Solo practices to large groups.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-uranian-blue flex items-center justify-center flex-shrink-0 shadow-lg">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1 text-foreground">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about Write Great Notes.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  question: "How does Write Great Notes work with my existing EMR?",
                  answer: "Write Great Notes integrates directly with your EMR through our growing list of integrations (Epic, Cerner, Athena, Charm, and more). You can push notes directly to patient charts, or simply copy and paste. No migration required—it works alongside your current system.",
                },
                {
                  question: "What types of providers can use Write Great Notes?",
                  answer: "Write Great Notes is designed for any healthcare provider who documents patient encounters—physicians, nurse practitioners, physician assistants, chiropractors, and more. Our customizable templates adapt to any specialty and documentation style.",
                },
                {
                  question: "How do I get notes that match my documentation style?",
                  answer: "Simply upload an example of one of your notes, and our AI learns your format, sections, and style. All future notes will match your preferred documentation structure—whether you're in dermatology, cardiology, primary care, or any other specialty.",
                },
                {
                  question: "Is my patient data secure?",
                  answer: "Absolutely. Write Great Notes is fully HIPAA compliant with BAA available. All data is encrypted using AES-256 encryption at rest and in transit. We maintain complete audit trails and row-level security to ensure your patients' information stays protected.",
                },
                {
                  question: "How long does it take to get started?",
                  answer: "You can be up and running in about 5 minutes. Sign up, connect your EMR (optional), upload a sample note to set your format, and start documenting. There's no lengthy onboarding or training required.",
                },
                {
                  question: "What if my EMR isn't on your integration list?",
                  answer: "We're adding new EMR integrations every month. Contact us to let us know which EMR you use—it's likely already on our roadmap. In the meantime, you can use Write Great Notes in standalone mode and copy notes to your EMR.",
                },
                {
                  question: "How does this help with insurance denials?",
                  answer: "Insurance companies use AI to scan notes for reasons to deny claims. Write Great Notes generates comprehensive documentation with clear medical necessity, clinical reasoning, and detailed patient-specific narratives—exactly what you need to stand up to audits and appeals.",
                },
                {
                  question: "What happens after the free trial?",
                  answer: "After your 7-day free trial, you can choose the plan that fits your practice. We offer flexible pricing for solo providers and groups. No commitment during the trial—cancel anytime if it's not right for you.",
                },
              ].map((faq, index) => (
                <div key={index} className="bg-card rounded-xl p-6 border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground">
                Have more questions?{" "}
                <Link href="/contact" className="text-primary hover:underline font-medium">
                  Contact our team
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 bg-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Your care deserves great documentation.
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              Stop settling for template notes. Start writing documentation that reflects the care you actually provide.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                asChild 
                className="text-lg px-10 py-7 shadow-xl transition-all hover:scale-105"
              >
                <Link href="https://app.writegreatnotes.ai/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-lg px-10 py-7"
              >
                <Link href="/contact">Request a Demo</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              No credit card required · 7-day free trial · Works with any EMR · HIPAA compliant
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

