import Link from "next/link";
import Image from "next/image";
import { Shield, Lock, FileCheck } from "lucide-react";

const footerNavigation = {
  product: [
    { name: "Features", href: "/features" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Pricing", href: "/pricing" },
    { name: "Start Free Trial", href: "/get-started" },
  ],
  integrations: [
    { name: "Charm Health", href: "/integrations/charm-health" },
    { name: "Epic", href: "/integrations/epic" },
    { name: "Athena", href: "/integrations/athena" },
  ],
  company: [
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-8 mb-12 pb-8 border-b">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-medium">HIPAA Compliant</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Lock className="h-5 w-5" />
            <span className="text-sm font-medium">AES-256 Encryption</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <FileCheck className="h-5 w-5" />
            <span className="text-sm font-medium">SOC 2 Ready</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex flex-col space-y-2 mb-4">
              <Image
                src="/images/grail logo - transparent.png"
                alt="Grail Digital Health"
                width={600}
                height={200}
                className="h-8 w-auto object-contain object-left"
              />
              <span className="font-medium text-sm text-muted-foreground">Write Great Notes</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered clinical documentation for modern healthcare practices.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {footerNavigation.product.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Integrations */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Integrations</h3>
            <ul className="space-y-3">
              {footerNavigation.integrations.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerNavigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerNavigation.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            &copy; 2025 Pound of Cure LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
