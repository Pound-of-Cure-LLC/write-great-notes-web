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
    description: "Remember medical school? HPI, ROS, Physical Exam, Assessment & Plan. Done right.",
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
      "New integrations shipping monthly. Epic, Cerner, Athena, Charm, and more. Don't see yours? It's probably next.",
  },
  {
    icon: Clock,
    title: "Fire & Forget",
    description:
      "Start recording, see your patient, move on. Notes appear in minutes, not hours.",
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
              and generates comprehensive notes—the kind you were taught to write.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                asChild 
                className="text-lg px-10 py-7 shadow-lg transition-all hover:scale-105"
              >
                <Link href="/signup">
                  Start Writing Great Notes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-lg px-10 py-7"
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
              <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider mb-4">
                <Upload className="h-4 w-4" />
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

      {/* The Problem: Old EMR Way */}
      <section className="py-24 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 text-destructive font-semibold text-sm uppercase tracking-wider mb-4">
                <XCircle className="h-4 w-4" />
                The Old Way
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                Templates trained you to write
                <br />
                <span className="text-destructive">incomplete notes.</span>
              </h2>
              <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
                First-generation EMRs optimized for speed over substance. 
                Templates, dot phrases, and checkboxes created documentation that says nothing.
              </p>
            </div>

            {/* Example of bad note */}
            <div className="bg-card rounded-2xl p-8 mb-12 border border-border">
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">Sound familiar?</p>
              <div className="font-mono text-sm text-muted-foreground space-y-2 bg-muted/30 rounded-lg p-6">
                <p><span className="text-destructive">.hpi</span> → &ldquo;Patient is a pleasant 45-year-old male presenting with chief complaint of [COMPLAINT]. Symptoms began [DURATION] ago. Patient denies [STANDARD DENIAL LIST].&rdquo;</p>
                <p className="mt-4"><span className="text-destructive">.pe</span> → &ldquo;General: NAD. HEENT: NCAT, PERRL, EOMI. Neck: Supple. Lungs: CTAB. Heart: RRR, no M/R/G...&rdquo;</p>
                <p className="mt-4 text-muted-foreground/60 italic">Copy. Paste. Repeat. For every patient.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {oldWayProblems.map((problem) => (
                <Card key={problem.title} className="border-destructive/20 bg-destructive/5">
                  <CardContent className="pt-6">
                    <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                      <problem.icon className="h-6 w-6 text-destructive" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">{problem.title}</h3>
                    <p className="text-muted-foreground">{problem.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Solution: AI Ambient Scribing */}
      <section className="py-24 sm:py-32 bg-gradient-to-br from-primary via-jordy-blue to-uranian-blue text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 text-primary-foreground/80 font-semibold text-sm uppercase tracking-wider mb-4">
                <Sparkles className="h-4 w-4" />
                The New Way
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold">
                Write notes like you were taught.
                <br />
                AI handles the typing.
              </h2>
              <p className="mt-6 text-xl text-primary-foreground/90 max-w-2xl mx-auto">
                Remember learning to write a proper H&P? AI ambient scribing captures your real 
                conversations and generates notes with actual clinical reasoning. No templates. No shortcuts.
              </p>
            </div>

            {/* Example of good note */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-white/20">
              <p className="text-sm text-primary-foreground/70 uppercase tracking-wider mb-4">What great notes look like:</p>
              <div className="text-sm text-primary-foreground/90 space-y-4 bg-white/5 rounded-lg p-6">
                <p><strong>HPI:</strong> Mr. Johnson is a 45-year-old carpenter who presents with progressive right knee pain over the past 3 weeks. He reports the pain began after kneeling for extended periods while installing flooring. Pain is localized to the anterior knee, worse with stairs and prolonged sitting, rated 6/10. He has tried ibuprofen with minimal relief. He denies locking, giving way, or swelling. No prior knee injuries or surgeries.</p>
                <p><strong>Assessment:</strong> Presentation is most consistent with patellofemoral syndrome given the anterior location, provocation with stairs and prolonged flexion, and occupational risk factors. Less likely but considered: prepatellar bursitis (no visible swelling on exam), meniscal pathology (no mechanical symptoms).</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {newWayBenefits.map((benefit) => (
                <div key={benefit.title} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-primary-foreground/80">{benefit.description}</p>
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
            <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              <Link2 className="h-4 w-4" />
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
              <div className="flex flex-wrap justify-center gap-6">
                {["Epic", "Cerner", "Athena", "Charm", "eClinicalWorks", "NextGen", "Allscripts", "DrChrono"].map((emr) => (
                  <div 
                    key={emr} 
                    className="px-6 py-3 bg-card rounded-lg border border-border text-foreground font-medium"
                  >
                    {emr}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Don&apos;t see yours? <Link href="/contact" className="text-primary hover:underline">Let us know</Link>—we&apos;re adding new integrations monthly.
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

      {/* Fight Insurance AI Section */}
      <section className="py-24 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 text-destructive font-semibold text-sm uppercase tracking-wider mb-4">
                <Shield className="h-4 w-4" />
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
      <section className="py-24 sm:py-32 bg-gradient-to-br from-primary via-jordy-blue to-uranian-blue text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 text-primary-foreground/80 font-semibold text-sm uppercase tracking-wider mb-4">
              <Heart className="h-4 w-4" />
              Be a Professional, Not a Box Checker
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Clock in. See patients.
              <br />
              Go home on time.
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-12 max-w-2xl mx-auto">
              You didn&apos;t spend years in training to stay late clicking checkboxes. 
              With Write Great Notes, you can log off at the end of your day knowing 
              every note is complete—and every note reflects the quality care you provided.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl mb-4">☀️</div>
                <h3 className="text-lg font-semibold mb-2">Morning</h3>
                <p className="text-primary-foreground/80">
                  Log in. Review your schedule. Start seeing patients.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl mb-4">🩺</div>
                <h3 className="text-lg font-semibold mb-2">During the Day</h3>
                <p className="text-primary-foreground/80">
                  Focus on patients. AI captures and documents each encounter as you go.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="text-lg font-semibold mb-2">End of Day</h3>
                <p className="text-primary-foreground/80">
                  Log off. Go home. All notes complete. No pajama time documentation.
                </p>
              </div>
            </div>

            <p className="mt-12 text-lg text-primary-foreground/80 italic">
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
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-uranian-blue flex items-center justify-center mb-4 shadow-lg">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
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
                <Link href="/signup">
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
