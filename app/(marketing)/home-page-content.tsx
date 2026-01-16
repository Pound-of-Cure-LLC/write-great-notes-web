"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Shield,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Heart,
  Mic,
  Upload,
  Link2,
  RefreshCw,
  XCircle,
  Zap,
  Settings,
  Mail,
  ListTodo,
  Tag,
  Rocket,
  MonitorPlay,
  Quote,
  Stethoscope,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/scroll-animation";
import { TypingEffect } from "@/components/marketing/typing-effect";
import { motion } from "framer-motion";

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
    icon: Shield,
    title: "Insurance-Ready",
    description:
      "Thorough documentation that supports medical necessity and stands up to audits.",
  },
];

const exampleHPI = "Mr. Johnson is a 45-year-old carpenter who presents with progressive right knee pain over the past 3 weeks. He reports the pain began after kneeling for extended periods while installing flooring. Pain is localized to the anterior knee, worse with stairs and prolonged sitting, rated 6/10. He has tried ibuprofen with minimal relief. He denies locking, giving way, or swelling. No prior knee injuries or surgeries.";
const exampleAssessment = "Presentation is most consistent with patellofemoral syndrome given the anterior location, provocation with stairs and prolonged flexion, and occupational risk factors. Less likely but considered: prepatellar bursitis (no visible swelling on exam), meniscal pathology (no mechanical symptoms).";

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-12 sm:py-16 lg:py-20">
      {/* Animated background pattern */}
      <motion.div 
        className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
      />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          {/* Logo and Tagline */}
          <FadeIn delay={0} duration={0.8}>
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Image
                src="/images/grail logo - transparent.png"
                alt="Grail Digital Health"
                width={400}
                height={133}
                className="h-16 sm:h-14 w-auto object-contain"
                priority
              />
              <p className="text-base sm:text-lg text-muted-foreground font-medium">
                Write Great Notes
              </p>
            </div>
          </FadeIn>

          {/* Main headline with floating animation */}
          <FadeIn delay={0.2} duration={0.8}>
            <motion.h1 
              className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-foreground mb-8 leading-tight"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              You listen. You examine.
              <br />
              <motion.span 
                className="text-primary inline-block"
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                You care.
              </motion.span>
            </motion.h1>
          </FadeIn>
          
          <FadeIn delay={0.3} duration={0.8}>
            <motion.p 
              className="text-2xl sm:text-3xl lg:text-4xl font-medium text-muted-foreground/80 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Your notes should show it.
            </motion.p>
          </FadeIn>

          <FadeIn delay={0.5} duration={0.8}>
            <p className="mt-8 text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Stop writing the same template note over and over. Start writing documentation that reflects the unique care you actually provide.
            </p>
          </FadeIn>

          <FadeIn delay={0.7} duration={0.8}>
            <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 sm:px-0">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button 
                  size="lg" 
                  asChild 
                  className="w-full sm:w-auto text-lg px-10 py-7 shadow-xl transition-all hover:shadow-2xl bg-primary hover:bg-primary/90 group"
                >
                  <Link href="/get-started" className="flex items-center">
                    Start Writing Great Notes
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto text-lg px-10 py-7 border-2 hover:bg-accent/50 hover:border-primary/50 transition-all"
                >
                  <Link href="/how-it-works">
                    See How It Works
                  </Link>
                </Button>
              </motion.div>
            </div>
          </FadeIn>
          
          <FadeIn delay={0.9} duration={0.8}>
            <p className="mt-8 text-sm text-muted-foreground/80 font-medium">
              7-day free trial · Works with any EMR
            </p>
          </FadeIn>
        </div>
      </div>

      {/* Enhanced decorative glow with floating animation */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Floating gradient decoration */}
      <motion.div 
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        animate={{
          rotate: [30, 35, 30],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-uranian-blue opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </motion.div>

      {/* Additional floating particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary/20 rounded-full blur-sm"
          style={{
            left: `${20 + i * 30}%`,
            top: `${30 + i * 20}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}
    </section>
  );
}

export default function HomePageContent() {
  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* Hero Section */}
      <HeroSection />

      {/* Your Notes, Your Way Section */}
      <section className="py-20 sm:py-32 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn direction="right">
              <div>
                <span className="inline-flex items-center gap-2 text-primary font-bold text-lg uppercase tracking-wider mb-4">
                  <Upload className="h-5 w-5" />
                  Personalized to You
                </span>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight">
                  Your notes should look like <span className="text-primary">your notes.</span>
                </h2>
                <div className="space-y-6 text-lg sm:text-xl text-muted-foreground">
                  <p>
                    Every specialty is different. Every provider has their own style. 
                    That&apos;s why Grail learns <em>your</em> format.
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
            </FadeIn>

            <FadeIn direction="left" delay={0.2}>
              <motion.div 
                className="bg-muted/30 rounded-3xl p-10 border border-border shadow-sm hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <StaggerContainer className="space-y-8">
                  {[
                    { num: "1", title: "Upload an example", desc: "Paste one of your best notes—the format you want to keep using." },
                    { num: "2", title: "We learn your style", desc: "AI parses your sections, headings, and documentation patterns." },
                    { num: "3", title: "Every note matches", desc: "All future notes follow your format. Consistency without the copy-paste." },
                  ].map((item, idx) => (
                    <StaggerItem key={idx}>
                      <motion.div 
                        className="flex items-start gap-5 group cursor-default"
                        whileHover={{ x: 4 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        <motion.div 
                          className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors"
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.5, type: "spring" }}
                        >
                          <span className="text-primary font-bold text-lg">{item.num}</span>
                        </motion.div>
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                          <p className="text-muted-foreground text-lg">{item.desc}</p>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </motion.div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Why I Built Grail - Founder Story Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <FadeIn>
              <div className="text-center mb-12">
                <span className="inline-flex items-center gap-2 text-primary font-bold text-lg uppercase tracking-wider mb-4">
                  <Stethoscope className="h-5 w-5" />
                  Built by a Physician
                </span>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                  Why I Built Grail
                </h2>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
              {/* Founder Photo */}
              <FadeIn direction="right" className="lg:col-span-2">
                <motion.div
                  className="relative mx-auto lg:mx-0"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto">
                    <Image
                      src="/images/blog/dr-matthew-weiner-headshot.jpg"
                      alt="Dr. Matthew Weiner, MD - Founder of Grail Health"
                      fill
                      className="rounded-2xl object-cover shadow-2xl"
                    />
                    <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-4 py-2 rounded-xl shadow-lg">
                      <p className="font-bold text-sm">Matthew Weiner, MD</p>
                      <p className="text-xs opacity-90">Founder & Physician</p>
                    </div>
                  </div>
                </motion.div>
              </FadeIn>

              {/* Story Content */}
              <FadeIn direction="left" delay={0.2} className="lg:col-span-3">
                <div className="space-y-6">
                  {/* Quote */}
                  <motion.div
                    className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-border"
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Quote className="absolute top-4 left-4 h-8 w-8 text-primary/20" />
                    <blockquote className="text-2xl sm:text-3xl font-bold text-foreground italic pl-8">
                      I became a physician to help people. Not to write the same note over and over again.
                    </blockquote>
                  </motion.div>

                  <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                    <p>
                      I spent years missing family dinners, soccer games, and bedtimes - all to complete documentation that didn&apos;t even reflect the unique care I was providing to each patient.
                    </p>
                    <p>
                      Template notes made every patient look the same, when their stories were anything but. <strong className="text-foreground">Copy-paste documentation was killing the art of medicine.</strong>
                    </p>
                    <p>
                      So I built Grail - an AI scribe that listens to real patient conversations and writes comprehensive clinical notes with actual narrative and reasoning. <strong className="text-foreground">Not templates. Not shortcuts. Documentation that tells each patient&apos;s unique story.</strong>
                    </p>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button variant="outline" asChild className="mt-4">
                      <Link href="/blog/where-did-grail-health-come-from">
                        Read the Full Story
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Fight Insurance AI Section */}
      <section className="py-20 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <FadeIn>
              <div className="text-center mb-16">
                <span className="inline-flex items-center gap-2 text-destructive font-bold text-lg uppercase tracking-wider mb-4">
                  <Shield className="h-5 w-5" />
                  Fight Back
                </span>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight">
                  Insurance companies use AI to deny your claims.
                  <br />
                  <span className="text-primary">Fight back with better AI.</span>
                </h2>
                <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Insurance companies are using algorithms to scan your notes for any excuse to deny payment.
                  Incomplete documentation? Denied. Missing medical necessity? Denied.
                  Template notes make you an easy target.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <FadeIn delay={0.2} direction="right">
                <div className="bg-destructive/5 border border-destructive/20 rounded-3xl p-8 sm:p-10 h-full">
                  <h3 className="text-2xl font-bold text-destructive mb-6 flex items-center gap-3">
                    <XCircle className="h-7 w-7" />
                    What Insurance AI Looks For
                  </h3>
                  <ul className="space-y-4 text-muted-foreground text-lg">
                    {[
                      "Vague or templated language",
                      "Missing documentation of medical necessity",
                      "Lack of clinical reasoning for decisions",
                      "Copy-paste notes that look identical",
                      "Missing pertinent negatives"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-destructive font-bold mt-1">×</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>

              <FadeIn delay={0.3} direction="left">
                <div className="bg-success/5 border border-success/20 rounded-3xl p-8 sm:p-10 h-full">
                  <h3 className="text-2xl font-bold text-success mb-6 flex items-center gap-3">
                    <CheckCircle2 className="h-7 w-7" />
                    What Gr<span className="text-primary">ai</span>l Generates
                  </h3>
                  <ul className="space-y-4 text-muted-foreground text-lg">
                    {[
                      "Unique, patient-specific narratives",
                      "Clear documentation of medical necessity",
                      "Clinical reasoning in assessment & plan",
                      "Detailed HPI with context and timeline",
                      "Relevant positives AND negatives"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.4}>
              <div className="mt-16 text-center">
                <p className="text-xl text-foreground font-semibold">
                  You provide excellent care. Don&apos;t let insurance algorithms say otherwise.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* The Solution: AI Note Writing */}
      <section className="py-20 sm:py-32 bg-slate-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <FadeIn>
              <div className="text-center mb-16">
                <span className="inline-flex items-center gap-2 text-slate-300 font-bold text-lg uppercase tracking-wider mb-4">
                  <Sparkles className="h-5 w-5" />
                  The New Way
                </span>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
                  Write comprehensive notes.
                  <br />
                  AI handles the typing.
                </h2>
                <p className="text-xl sm:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  AI listens to your real conversations and generates notes 
                  with actual clinical reasoning. No templates. No shortcuts.
                </p>
              </div>
            </FadeIn>

            {/* Example of good note */}
            <FadeIn delay={0.2}>
              <div className="bg-slate-800 rounded-3xl p-8 sm:p-10 mb-16 border border-slate-700 shadow-2xl">
                <p className="text-sm text-slate-400 uppercase tracking-wider mb-6 font-semibold">What great notes look like:</p>
                <div className="text-lg text-slate-200 space-y-6 bg-slate-900/50 rounded-xl p-6 sm:p-8 font-mono">
                  <div>
                    <strong className="text-white block mb-2">HPI:</strong>
                    <TypingEffect text={exampleHPI} speed={15} startDelay={500} className="leading-relaxed" />
                  </div>
                  <div>
                    <strong className="text-white block mb-2">Assessment:</strong>
                    <TypingEffect text={exampleAssessment} speed={15} startDelay={6000} cursorColor="bg-blue-400" className="leading-relaxed" />
                  </div>
                </div>
              </div>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {newWayBenefits.map((benefit) => (
                <StaggerItem key={benefit.title}>
                  <motion.div 
                    className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:bg-slate-800/80 transition-colors cursor-default group"
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="flex flex-col gap-6">
                      <motion.div 
                        className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors"
                        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <benefit.icon className="h-7 w-7 text-primary" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-primary transition-colors">{benefit.title}</h3>
                        <p className="text-slate-300 text-lg leading-relaxed">{benefit.description}</p>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* EMR Integration Section */}
      <section className="py-20 sm:py-32 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <FadeIn>
              <span className="inline-flex items-center gap-2 text-primary font-bold text-lg uppercase tracking-wider mb-4">
                <Link2 className="h-5 w-5" />
                Designed for Integration
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight">
                Built to work with your EMR.
                <br />
                <span className="text-primary">New integrations every month.</span>
              </h2>
              <p className="text-xl sm:text-2xl text-muted-foreground mb-16 max-w-2xl mx-auto leading-relaxed">
                Grail was designed from day one to integrate with your existing workflow. 
                We&apos;re adding new EMR integrations constantly—and if yours isn&apos;t on the list yet, it&apos;s probably next.
              </p>
            </FadeIn>
            
            {/* EMR Logos/Names */}
            <FadeIn delay={0.2}>
              <motion.div 
                className="bg-muted/30 rounded-3xl p-10 border border-border mb-12"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-8 font-semibold">Current & Coming Soon</p>
                <div className="flex flex-wrap justify-center gap-4">
                  {/* Charm Health - Available Now */}
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link 
                      href="/integrations/charm-health"
                      className="px-8 py-4 bg-success/10 rounded-xl border-2 border-success text-success font-bold hover:bg-success/20 transition-all flex items-center gap-3 text-lg group"
                    >
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </motion.div>
                      Charm Health
                    </Link>
                  </motion.div>
                  {/* Other EMRs - On Roadmap */}
                  {[
                    { name: "AdvancedMD", slug: "advancedmd" },
                    { name: "Athena", slug: "athena" },
                    { name: "Cerner", slug: "cerner" },
                    { name: "eClinicalWorks", slug: "eclinicalworks" },
                    { name: "NextGen", slug: "nextgen" },
                    { name: "Allscripts", slug: "allscripts" },
                    { name: "DrChrono", slug: "drchrono" },
                  ].map((emr) => (
                    <motion.div
                      key={emr.slug}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link 
                        href={`/integrations/${emr.slug}`}
                        className="px-8 py-4 bg-card rounded-xl border border-border text-foreground font-medium hover:border-primary hover:bg-primary/5 transition-all text-lg"
                      >
                        {emr.name}
                      </Link>
                    </motion.div>
                  ))}
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link 
                      href="/contact?type=emr"
                      className="px-8 py-4 bg-card rounded-xl border border-dashed border-border text-muted-foreground font-medium hover:border-primary hover:text-foreground transition-all text-lg"
                    >
                      + Other EMRs
                    </Link>
                  </motion.div>
                </div>
                <p className="text-sm text-muted-foreground mt-8 font-medium">
                  <span className="text-success font-bold">✓ Available now</span> · Click any EMR to learn more or express interest—<span className="text-primary font-bold">demand drives our roadmap!</span>
                </p>
              </motion.div>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { number: "0", label: "Data migrations needed" },
                { number: "New", label: "Integrations monthly", icon: RefreshCw },
                { number: "5 min", label: "To get started" },
              ].map((stat) => (
                <StaggerItem key={stat.label}>
                  <motion.div 
                    className="bg-muted/50 rounded-2xl p-8 border border-border hover:border-primary/50 transition-colors cursor-default group"
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.div 
                      className="text-5xl font-black text-primary mb-3"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {stat.number}
                      {stat.icon && (
                        <motion.span
                          className="inline-block ml-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <stat.icon className="h-8 w-8 inline" />
                        </motion.span>
                      )}
                    </motion.div>
                    <div className="text-lg text-muted-foreground font-medium group-hover:text-foreground transition-colors">{stat.label}</div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* One Screen Command Center Section */}
      <section className="py-20 sm:py-32 bg-slate-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <FadeIn>
              <div className="text-center mb-16">
                <span className="inline-flex items-center gap-2 text-slate-300 font-bold text-lg uppercase tracking-wider mb-4">
                  <MonitorPlay className="h-5 w-5" />
                  Your Command Center
                </span>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 text-white leading-tight">
                  Stop clicking through screens.
                  <br />
                  <span className="text-primary">Everything you need. One place.</span>
                </h2>
                <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                  How much of your mental energy goes to clicking around your EMR looking for the info you need?
                  Grail pulls everything out of your EMR - customized YOUR way - onto a single screen.
                  See your patient. Provide care. Click a button. Done.
                </p>
              </div>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {[
                {
                  title: "AI Patient Summary",
                  description: "Before every visit, get an intelligent summary - medical history, recent visits, key concerns - all synthesized by AI so you walk in prepared.",
                  icon: "🧠",
                },
                {
                  title: "Previous Notes at a Glance",
                  description: "Access past notes directly from your EMR. Review previous encounters without switching systems or losing focus.",
                  icon: "📋",
                },
                {
                  title: "Live Vitals & Demographics",
                  description: "Current vitals and patient demographics pulled automatically. No duplicate data entry, no hunting through tabs.",
                  icon: "💓",
                },
                {
                  title: "Referring Provider Context",
                  description: "See referring provider information and referral context for every patient - know why they're here before they sit down.",
                  icon: "🔗",
                },
                {
                  title: "One-Click Note to EMR",
                  description: "When you're done, click a button and your beautiful, comprehensive note goes straight to your EMR. No copy-paste, no extra steps.",
                  icon: "✨",
                },
                {
                  title: "Customizable to Your Workflow",
                  description: "Configure what you see and how you see it. Your command center, your way. We're adding new capabilities monthly.",
                  icon: "⚙️",
                },
              ].map((feature) => (
                <StaggerItem key={feature.title}>
                  <motion.div
                    className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:bg-slate-800/80 transition-colors group cursor-default"
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="flex items-start gap-5">
                      <motion.div
                        className="text-4xl"
                        animate={{
                          y: [0, -5, 0],
                          rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: Math.random() * 2,
                        }}
                        whileHover={{ scale: 1.2, rotate: 0 }}
                      >
                        {feature.icon}
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold mb-2 text-white group-hover:text-primary transition-colors">{feature.title}</h3>
                        <p className="text-slate-300 text-base leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <FadeIn delay={0.4}>
              <div className="text-center">
                <p className="text-2xl text-slate-200 mb-4 font-medium">
                  Imagine: You see a patient. You provide care. You click a button.
                  <strong className="text-white"> A beautiful note is created and sent to your EMR.</strong>
                </p>
                <p className="text-lg text-slate-400">
                  At the end of the day, after you see your last patient, you leave. That&apos;s it. That&apos;s the workflow.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Workflow Automation Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <FadeIn>
              <div className="text-center mb-16">
                <span className="inline-flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-lg uppercase tracking-wider mb-4">
                  <Zap className="h-5 w-5" />
                  Workflow Automation
                </span>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight">
                  Your practice runs itself.
                  <br />
                  <span className="text-amber-600 dark:text-amber-400">Nothing slips through the cracks.</span>
                </h2>
                <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Plug into your EMR and automate the tasks that eat up your staff&apos;s time.
                  Automated task creation, email workflows, patient tagging - all completely configurable for YOUR practice.
                </p>
              </div>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {[
                {
                  icon: ListTodo,
                  title: "Automated Task Creation",
                  description: "Tasks are created automatically based on EMR events. New referral? Task created. Lab results in? Task created. Your staff always knows what needs to happen next.",
                },
                {
                  icon: Mail,
                  title: "Email Automation",
                  description: "Automated patient communications, appointment reminders, and follow-up emails. Consistent communication without the manual work.",
                },
                {
                  icon: Tag,
                  title: "Smart Patient Tagging",
                  description: "Automatically tag and organize patients based on conditions, visit types, or any criteria you define. Find who you need, when you need them.",
                },
                {
                  icon: Settings,
                  title: "Fully Configurable",
                  description: "Every automation is customizable to YOUR practice. You define the triggers, the actions, and the rules. We execute them flawlessly.",
                },
              ].map((feature) => (
                <StaggerItem key={feature.title}>
                  <motion.div
                    className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-amber-200 dark:border-amber-800 shadow-md hover:shadow-xl transition-all group cursor-default"
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="flex items-start gap-5">
                      <motion.div
                        className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg"
                        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <feature.icon className="h-7 w-7 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{feature.title}</h3>
                        <p className="text-muted-foreground text-base leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <FadeIn delay={0.4}>
              <div className="text-center bg-white dark:bg-slate-800 rounded-2xl p-8 border border-amber-200 dark:border-amber-800 shadow-md">
                <p className="text-xl text-foreground font-medium mb-4">
                  Your staff becomes more efficient. Things stop slipping through the cracks.
                </p>
                <p className="text-lg text-muted-foreground">
                  And the best part? <strong className="text-amber-600 dark:text-amber-400">Your staff leaves on time too.</strong>
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Work-Life Balance Section */}
      <section className="py-20 sm:py-32 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <FadeIn>
              <span className="inline-flex items-center gap-2 text-white/90 font-bold text-lg uppercase tracking-wider mb-4">
                <Heart className="h-5 w-5" />
                Be a Professional, Not a Box Checker
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 text-white leading-tight">
                Clock in. See patients.
                <br />
                Go home on time.
              </h2>
              <p className="text-xl sm:text-2xl text-white/90 mb-16 max-w-2xl mx-auto leading-relaxed">
                You didn&apos;t spend years training to stay late clicking checkboxes. 
                With Grail, you can log off at the end of your day knowing 
                every note is complete—and every note reflects the quality care you provided.
              </p>
            </FadeIn>
            
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {[
                { emoji: "☀️", title: "Morning", desc: "Log in. Review your schedule. Start seeing patients." },
                { emoji: "🩺", title: "During the Day", desc: "Focus on patients. AI captures and documents each encounter as you go." },
                { emoji: "🏠", title: "End of Day", desc: "Log off. Go home. All notes complete. No pajama time documentation." },
              ].map((item) => (
                <StaggerItem key={item.title}>
                  <motion.div 
                    className="bg-white/10 rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-colors cursor-default group"
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.div 
                      className="text-5xl mb-6"
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      whileHover={{ scale: 1.2, rotate: 0 }}
                    >
                      {item.emoji}
                    </motion.div>
                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-white/90 text-lg">
                      {item.desc}
                    </p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <FadeIn delay={0.4}>
              <div className="mt-16 flex flex-col items-center gap-4">
                <p className="text-xl text-white/90 italic font-medium">
                  &ldquo;I haven&apos;t brought work home in months. I forgot what that felt like.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/blog/dr-matthew-weiner-headshot.jpg"
                    alt="Dr. Matthew Weiner"
                    width={48}
                    height={48}
                    className="rounded-full border-2 border-white/30"
                  />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">Dr. Matthew Weiner, MD</p>
                    <p className="text-xs text-white/70">Founder, Grail Health</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* The Future of Grail Health Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
        {/* Animated background glow */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <FadeIn>
              <div className="text-center mb-16">
                <motion.span
                  className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 rounded-full px-6 py-2 text-purple-300 font-bold text-sm uppercase tracking-wider mb-6"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Rocket className="h-4 w-4" />
                  The Future of Grail Health
                </motion.span>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 text-white leading-tight">
                  Your conversation becomes
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    automatic action.
                  </span>
                </h2>
                <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                  Imagine: You meet with a patient. You discuss their care. And from that conversation alone,
                  the AI understands what needs to happen next - and makes it happen.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-white/10 mb-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <motion.div
                    className="group"
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.div
                      className="text-5xl mb-4"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                    >
                      🗣️
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2 text-white">You Talk</h3>
                    <p className="text-slate-400">&ldquo;Let&apos;s get an MRI of that knee and follow up in two weeks.&rdquo;</p>
                  </motion.div>

                  <motion.div
                    className="group"
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.div
                      className="text-5xl mb-4"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    >
                      🧠
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2 text-white">AI Understands</h3>
                    <p className="text-slate-400">Grail processes your conversation and identifies actionable items.</p>
                  </motion.div>

                  <motion.div
                    className="group"
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.div
                      className="text-5xl mb-4"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                    >
                      ✨
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2 text-white">It Just Happens</h3>
                    <p className="text-slate-400">MRI ordered. Follow-up scheduled. Tasks created. Automatically.</p>
                  </motion.div>
                </div>
              </div>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {[
                { icon: "🔬", text: "Order imaging and labs from your conversation" },
                { icon: "📅", text: "Schedule follow-ups automatically" },
                { icon: "📋", text: "Create staff tasks based on care plan" },
                { icon: "💊", text: "Trigger medication refill workflows" },
                { icon: "📨", text: "Send patient instructions and education" },
                { icon: "🔗", text: "Coordinate referrals seamlessly" },
              ].map((item) => (
                <StaggerItem key={item.text}>
                  <motion.div
                    className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors cursor-default"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-lg text-slate-200">{item.text}</span>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <FadeIn delay={0.4}>
              <div className="text-center">
                <p className="text-2xl text-white font-bold mb-4">
                  Your practice executes seamlessly. Almost invisibly.
                </p>
                <p className="text-xl text-slate-300 mb-8">
                  This is what you&apos;re signing up to be a part of.
                  <br />
                  <span className="text-purple-400 font-semibold">New features shipping almost weekly.</span>
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    size="lg"
                    asChild
                    className="text-lg px-10 py-7 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-xl border-0"
                  >
                    <Link href="/get-started" className="flex items-center">
                      Join the Future
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </motion.div>
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 sm:py-32 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <FadeIn>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-foreground mb-6">
                Built for real clinical workflows
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                From primary care to specialists. Solo practices to large groups.
              </p>
            </FadeIn>
          </div>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card className="border-border shadow-sm hover:shadow-xl transition-all h-full group cursor-default">
                    <CardContent className="pt-8 p-8">
                      <div className="flex flex-col gap-6">
                        <motion.div 
                          className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-uranian-blue flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow"
                          whileHover={{ rotate: [0, -5, 5, -5, 0], scale: 1.1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <feature.icon className="h-7 w-7 text-primary-foreground" />
                        </motion.div>
                        <div>
                          <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">{feature.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 sm:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <FadeIn>
              <div className="text-center mb-16">
                <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                  Frequently Asked Questions
                </h2>
                <p className="text-xl text-muted-foreground">
                  Everything you need to know about Gr<span className="text-primary">ai</span>l.
                </p>
              </div>
            </FadeIn>

            <StaggerContainer className="space-y-6">
              {[
                {
                  question: "How does Grail work with my existing EMR?",
                  answer: "Grail integrates directly with your EMR through our growing list of integrations (AdvancedMD, Athena, Charm, and more). You can push notes directly to patient charts, or simply copy and paste. No migration required—it works alongside your current system.",
                },
                {
                  question: "What types of providers can use Grail?",
                  answer: "Grail is designed for any healthcare provider who documents patient encounters—physicians, nurse practitioners, physician assistants, chiropractors, and more. Our customizable templates adapt to any specialty and documentation style.",
                },
                {
                  question: "How do I get notes that match my documentation style?",
                  answer: "Simply upload an example of one of your notes, and our AI learns your format, sections, and style. All future notes will match your preferred documentation structure—whether you're in dermatology, cardiology, primary care, or any other specialty.",
                },
                {
                  question: "Is my patient data secure?",
                  answer: "Absolutely. Grail is fully HIPAA compliant with BAA available. All data is encrypted using AES-256 encryption at rest and in transit. We use industry-standard encryption and privacy practices, with complete audit trails to ensure your patients' information stays protected.",
                },
                {
                  question: "How long does it take to get started?",
                  answer: "You can be up and running in about 5 minutes. Sign up, connect your EMR (optional), upload a sample note to set your format, and start documenting. There's no lengthy onboarding or training required.",
                },
                {
                  question: "What if my EMR isn't on your integration list?",
                  answer: "We're adding new EMR integrations every month. Contact us to let us know which EMR you use—it's likely already on our roadmap. In the meantime, you can use Grail in standalone mode and copy notes to your EMR.",
                },
                {
                  question: "What workflow automation features are available?",
                  answer: "Grail includes powerful workflow automation: automated task creation from EMR events, email automation for patient communications, smart patient tagging, and configurable workflows customized to your practice. We're constantly adding new automation capabilities to help your staff be more efficient.",
                },
                {
                  question: "How does this help with insurance denials?",
                  answer: "Insurance companies use AI to scan notes for reasons to deny claims. Grail generates comprehensive documentation with clear medical necessity, clinical reasoning, and detailed patient-specific narratives—exactly what you need to stand up to audits and appeals.",
                },
                {
                  question: "What happens after the free trial?",
                  answer: "After your 7-day free trial, you can choose the plan that fits your practice. We offer flexible pricing for solo providers and groups. No commitment during the trial—cancel anytime if it's not right for you.",
                },
              ].map((faq, index) => (
                <StaggerItem key={index}>
                  <motion.div 
                    className="bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-xl transition-shadow cursor-default group"
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{faq.question}</h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">{faq.answer}</p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <FadeIn delay={0.4}>
              <div className="mt-16 text-center">
                <p className="text-muted-foreground text-lg">
                  Have more questions?{" "}
                  <Link href="/contact" className="text-primary hover:underline font-bold">
                    Contact our team
                  </Link>
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <FadeIn>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
                Your care deserves great documentation.
              </h2>
              <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                Stop settling for template notes. Start writing documentation that reflects the care you actually provide.
              </p>
            </FadeIn>
            
            <FadeIn delay={0.2}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button 
                    size="lg" 
                    asChild 
                    className="w-full sm:w-auto text-lg px-12 py-8 shadow-xl transition-all hover:shadow-2xl group"
                  >
                    <Link href="/get-started" className="flex items-center">
                      Start Free Trial
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                      </motion.div>
                    </Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="w-full sm:w-auto text-lg px-12 py-8 border-2 bg-background/50 backdrop-blur-sm hover:border-primary/50"
                  >
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </motion.div>
              </div>
              <p className="mt-8 text-sm text-muted-foreground font-medium">
                7-day free trial · Works with any EMR · HIPAA compliant
              </p>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}














