import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/scroll-animation";

const articles = [
  {
    slug: "ehr-reckoning-legacy-systems",
    title: "AI Scribe EHR Integration: Why Legacy Systems Are Struggling",
    description: "Discover why AI scribe EHR integration is challenging legacy systems. Learn how ambient AI scribes and EMR add-on solutions bridge the gap while EHR vendors struggle with technical debt.",
    date: "December 13, 2024",
    readTime: "6 min read",
    category: "AI & EHR Integration",
  },
];

export default function BlogPage() {
  return (
    <div className="flex flex-col overflow-x-hidden">
      {/* Hero Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <FadeIn>
              <Badge variant="secondary" className="mb-4 px-4 py-2 bg-primary/10 text-primary border-primary/20">
                Blog
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                Insights on Healthcare AI
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Perspectives on AI in healthcare, clinical documentation, and the future of medical technology.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="pt-8 sm:pt-12 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {articles.map((article) => (
              <StaggerItem key={article.slug}>
                <Link href={`/blog/${article.slug}`} className="block h-full group">
                  <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                    <CardContent className="p-8">
                      <Badge variant="outline" className="mb-4 text-xs">
                        {article.category}
                      </Badge>
                      <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                        {article.title}
                      </h2>
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {article.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {article.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {article.readTime}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}
