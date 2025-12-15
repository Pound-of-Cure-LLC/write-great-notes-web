import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Calendar, Clock } from "lucide-react";
import { FadeIn } from "@/components/ui/scroll-animation";
import { SampleNoteModal } from "@/components/marketing/sample-note-modal";

export const metadata: Metadata = {
  title: "Where Did Grail Health Come From? Building User-Friendly AI-Powered Healthcare Tools | Grail Digital Health",
  description: "A bariatric surgeon's 20-year journey from EHR frustration to building Grail Health -user-friendly, AI-powered healthcare software with AI scribe technology designed by a physician, for physicians.",
  keywords: [
    "user friendly EMR",
    "user friendly EHR",
    "AI powered EMR",
    "AI powered EHR",
    "AI scribe",
    "AI medical scribe",
    "physician built EMR",
    "doctor designed EHR",
    "easy to use EMR",
    "intuitive EHR",
    "healthcare AI",
    "ambient AI scribe",
    "EMR for physicians",
    "EHR for doctors",
    "physician friendly EMR",
    "modern EMR software",
    "AI documentation",
    "clinical documentation AI",
    "medical practice EMR",
    "healthcare technology",
  ],
  openGraph: {
    title: "Where Did Grail Health Come From? A Physician's Journey to Building User-Friendly AI-Powered Healthcare Tools",
    description: "Dr. Matthew Weiner, a bariatric surgeon with 20 years of clinical experience, shares his journey from EHR frustration to building Grail Health -user-friendly, AI-powered healthcare software with AI scribe technology.",
    url: "https://grailhealth.ai/blog/where-did-grail-health-come-from",
    type: "article",
    publishedTime: "2024-12-14T00:00:00.000Z",
  },
  alternates: {
    canonical: "https://grailhealth.ai/blog/where-did-grail-health-come-from",
  },
};

export default function WhereDidGrailComeFromArticle() {
  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <FadeIn>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>

              <Badge variant="outline" className="mb-4 text-xs">
                Founder Story
              </Badge>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4 leading-tight">
                Where Did Grail Health Come From?
              </h1>

              <p className="text-lg text-muted-foreground mb-4 italic">
                A physician&apos;s 20-year journey from EHR frustration to building user-friendly, AI-powered healthcare tools
              </p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  December 14, 2024
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  7 min read
                </span>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="pt-4 sm:pt-6 pb-8 sm:pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <FadeIn>
              {/* TL;DR Section */}
              <div className="mb-8 p-6 bg-muted/50 rounded-lg border border-border/50">
                <h2 className="text-lg font-semibold mb-4">TL;DR</h2>
                <ul className="space-y-2 text-base leading-relaxed list-disc pl-6">
                  <li>Grail Health was built by Matthew Weiner, MD -a bariatric surgeon with 20 years of clinical experience.</li>
                  <li>Every legacy EHR seemed designed without ever consulting the physicians who had to use them.</li>
                  <li>AI unlocked two capabilities: the power to build user-friendly software and intelligent AI scribe technology to transform clinical documentation.</li>
                  <li>This is AI-powered software built by a doctor who understands what physicians actually need at the point of care.</li>
                </ul>
              </div>

              <article className="space-y-6">
                {/* Lead paragraph */}
                {/* Author Image */}
                <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
                  <div className="flex-shrink-0">
                    <Image
                      src="/images/blog/dr-matthew-weiner-headshot.jpg"
                      alt="Dr. Matthew Weiner, MD - Bariatric Surgeon and Founder of Grail Health"
                      width={150}
                      height={150}
                      className="rounded-full object-cover"
                      priority
                    />
                  </div>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    My name is Matthew Weiner, MD. I&apos;m a bariatric surgeon who has been practicing medicine for the past 20 years -most recently running my own practice in Tucson, Arizona for the last seven years -and I&apos;ve been a lifelong technology enthusiast. In that time, I&apos;ve seen thousands of patients, performed countless surgeries, and built lasting relationships with people whose lives I&apos;ve helped transform. But throughout all of it, there&apos;s been one constant source of frustration: the electronic health record.
                  </p>
                </div>

                <div className="pt-4">
                  <h2 className="text-xl font-bold mb-4">Two Decades of EHR Frustration</h2>

                  <p className="text-base leading-relaxed mb-4">
                    Over my career, I&apos;ve used virtually every EHR and EMR on the market. Each one promised to be a &quot;user-friendly EMR&quot; that would streamline my workflow. Each one claimed to be &quot;intuitive&quot; and &quot;physician-friendly.&quot; And <strong>each one felt like it was designed by people who had never spent a single day in a clinical setting.</strong>
                  </p>

                  <p className="text-base leading-relaxed mb-4">
                    These so-called user-friendly EHR systems were overburdened with:
                  </p>

                  <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed mb-4">
                    <li>Endless checkboxes that had nothing to do with patient care</li>
                    <li>Dropdown menus that never contained the option I actually needed</li>
                    <li>Rigid templates that forced me to document the way the software wanted, not the way I think</li>
                    <li>Time-consuming, tedious documentation requirements repeated for every single patient</li>
                  </ul>

                  <p className="text-base leading-relaxed">
                    Patient after patient. Year after year. For two decades, I watched these EMR systems add feature after feature -and not once did it feel like anyone had consulted an actual physician about what we needed. <strong>The result was software that got in the way of patient care rather than supporting it.</strong>
                  </p>
                </div>

                {/* AI Banner */}
                <div className="my-8 rounded-xl overflow-hidden">
                  <Image
                    src="/images/DCECE009-6FD7-4686-B65F-B3CBB37CC8F5.png"
                    alt="AI transforming healthcare technology"
                    width={800}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </div>

                <div className="pt-4">
                  <h2 className="text-xl font-bold mb-4">Then AI Changed Everything</h2>

                  <p className="text-base leading-relaxed mb-4">
                    The emergence of artificial intelligence didn&apos;t just change healthcare documentation -it gave me two transformative tools that finally made it possible to build truly user-friendly, AI-powered healthcare software.
                  </p>

                  <p className="text-base leading-relaxed mb-4">
                    <strong>First, AI let me write code better and faster.</strong> I&apos;ve always written code -it&apos;s been part of how I&apos;ve built and managed my practice for years. But AI amplified what I could do. For the first time, a physician could actually create production-quality software at scale -and at a tiny fraction of the cost it would have taken just a few years ago. I didn&apos;t need to explain my workflow to developers who&apos;d never seen a patient. I didn&apos;t need to compromise on every feature because &quot;that&apos;s not how the system works.&quot; I could build AI-powered tools that worked the way doctors think -software that could search through mountains of medical data and surface exactly what providers need at the point of care.
                  </p>

                  <p className="text-base leading-relaxed">
                    <strong>Second, AI scribe technology transformed what documentation could be.</strong> <Link href="/features" className="text-primary hover:underline font-semibold">Ambient AI scribes</Link>, intelligent summaries, automated note generation -these AI medical scribe tools don&apos;t just save time. They allow me to be more present with my patients. To listen. To connect. To provide the kind of care that made me become a doctor in the first place.
                  </p>
                </div>

                {/* Demo Video Placeholder */}
                <div className="my-8 rounded-lg overflow-hidden border-2 border-dashed border-primary/30 bg-muted/30">
                  <div className="aspect-video flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <p className="text-lg font-semibold text-foreground mb-2">Product Demo Coming Soon</p>
                    <p className="text-sm text-muted-foreground">See Grail Health in action</p>
                  </div>
                </div>

                <div className="pt-4">
                  <h2 className="text-xl font-bold mb-4">User-Friendly Healthcare Software Built by a Doctor, for Doctors</h2>

                  <p className="text-base leading-relaxed mb-4">
                    Grail Health didn&apos;t come from a software company looking for a new market. It came from a healthcare provider who spent 20 years in the trenches -using every EMR in the business, being frustrated by each one, and finally building the user-friendly AI-powered tools I needed.
                  </p>

                  <p className="text-base leading-relaxed mb-4">
                    This product exists because I wanted to:
                  </p>

                  <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed mb-4">
                    <li><strong>Treat my patients better</strong> -with more time for care and less time fighting software</li>
                    <li><strong>Move through my day with less overhead</strong> -eliminating the paperwork that burns out physicians</li>
                    <li><strong>Reduce the cost of documentation</strong> -stop paying for complexity that doesn&apos;t serve patient care</li>
                    <li><strong>Run my practice more efficiently</strong> -with tools that actually support clinical workflows</li>
                  </ul>

                  <p className="text-base leading-relaxed">
                    <strong>Ultimately, this is about providing better care for patients.</strong> That&apos;s why I became a doctor. And that&apos;s why I built Grail Health.
                  </p>
                </div>

                <div className="pt-4">
                  <h2 className="text-xl font-bold mb-4">Features That Actually Matter to Physicians</h2>

                  <p className="text-base leading-relaxed mb-4">
                    Because I&apos;ve been practicing medicine for 20 years -tightly linked to patients and daily clinical workflows -I know what features actually matter. I built Grail Health with the tools that make a real difference:
                  </p>

                  <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed mb-4">
                    <li><strong>Workflow automations</strong> -streamline repetitive tasks so your team can focus on patient care instead of administrative busywork</li>
                    <li><strong>Task tracking across your entire team</strong> -assign, monitor, and complete tasks with full visibility across all employees</li>
                    <li><strong>Patient tags for organization</strong> -categorize and find patients quickly with customizable tagging systems</li>
                    <li><strong>Fully customizable note templates</strong> -create documentation that matches your clinical style, not some software designer&apos;s idea of what you need</li>
                  </ul>

                  <p className="text-base leading-relaxed mb-4">
                    Most importantly, the <Link href="/features" className="text-primary hover:underline font-semibold">AI scribe</Link> creates truly high-quality, detailed notes that stand up to any scrutiny -whether for prior authorization or malpractice review. I&apos;ve always spent time with my patients. I take the time to listen, to explain, to truly care. But my old EHR notes never reflected that level of attention and thoroughness.
                  </p>

                  <p className="text-base leading-relaxed mb-4">
                    <strong>Now my notes finally reflect the care I actually provide.</strong> That&apos;s what physician-designed, AI-powered software can do.
                  </p>

                  <div className="flex justify-center">
                    <SampleNoteModal />
                  </div>
                </div>

                <div className="pt-4">
                  <h2 className="text-xl font-bold mb-4">We&apos;re Just Getting Started</h2>

                  <p className="text-base leading-relaxed mb-4">
                    What you see today in Grail Health is just the beginning. <strong>We&apos;re building a platform that will fundamentally change how medical practices operate</strong> -and we have an ambitious roadmap ahead.
                  </p>

                  <p className="text-base leading-relaxed mb-4">
                    <strong>EMR integrations across the industry.</strong> We&apos;re working to integrate with most major EMR systems, so you can use Grail Health&apos;s AI-powered tools regardless of what legacy system you&apos;re currently locked into.
                  </p>

                  <p className="text-base leading-relaxed mb-4">
                    <strong>A new patient intake process that actually works.</strong> No more pages and pages of tedious forms that patients hate filling out and staff hate entering. We&apos;re building an intelligent intake system that respects your patients&apos; time while capturing all the information you need.
                  </p>

                  <p className="text-base leading-relaxed mb-4">
                    <strong>True interoperability.</strong> The ability to actually pull data from other providers through interoperability platforms like <a href="https://carequality.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Carequality</a> and <a href="https://www.commonwellalliance.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">CommonWell</a> -giving you the complete picture of your patient&apos;s health history at the point of care.
                  </p>

                  <p className="text-base leading-relaxed mb-4">
                    <strong>AI-powered practice automation to reduce overhead costs.</strong> Imagine AI that can answer phone calls, manage prior authorizations, and handle the countless administrative tasks that currently require expensive staff time. I&apos;ve spent 20 years building systems to manage my own office - I know exactly how these workflows should run. Now I&apos;m teaching AI to do it for all of us.
                  </p>

                  <p className="text-base leading-relaxed">
                    <strong>Denial prevention and revenue protection.</strong> Insurance companies deny claims constantly, and many of those denials slip through the cracks. We&apos;re developing AI tools that ensure your documentation and claims are filled out in ways that simply can&apos;t be denied -and that catch denials before they become lost revenue.
                  </p>
                </div>

                <div className="pt-4">
                  <h2 className="text-xl font-bold mb-4">The Future of User-Friendly, AI-Powered Healthcare Technology</h2>

                  <p className="text-base leading-relaxed mb-4">
                    I believe we&apos;re at an inflection point. For too long, healthcare technology - EHRs, EMRs, practice management systems - has been built by technologists who don&apos;t understand medicine, then sold to healthcare providers who have no choice but to use it.
                  </p>

                  <p className="text-base leading-relaxed mb-4">
                    AI changes this equation. It democratizes software development in a way that allows domain experts - people who actually understand the problems - to build solutions. <strong>I built Grail Health from the ground up. I built it for me and my staff first, because we needed it. And now I&apos;m building it for you</strong> - to help you be a better, more efficient healthcare provider.
                  </p>

                  <p className="text-base leading-relaxed">
                    <strong>Grail Health is proof of what&apos;s possible when the people who understand the problem are empowered to solve it.</strong> Truly user-friendly, AI-powered healthcare tools designed by a physician who has lived with the frustrations of legacy EHR systems for two decades. <strong>This is just the beginning.</strong>
                  </p>
                </div>
              </article>
            </FadeIn>

            {/* CTA Card */}
            <FadeIn delay={0.2}>
              <Card className="mt-12 border-primary/20 bg-primary/5">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-xl font-bold mb-3">
                    Experience User-Friendly, AI-Powered Healthcare Tools Built by a Physician
                  </h3>
                  <p className="text-base text-muted-foreground mb-5 leading-relaxed">
                    Grail Health combines 20 years of clinical experience with cutting-edge AI scribe technology to create truly user-friendly software that works the way doctors think. See the difference physician-designed, AI-powered tools can make for your practice.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild>
                      <Link href="/get-started">
                        Start Free Trial
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/how-it-works">
                        See How It Works
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Back to Blog */}
            <FadeIn delay={0.3}>
              <div className="mt-8 pt-6 border-t">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to all articles
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
