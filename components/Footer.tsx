"use client";

import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container px-4 py-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Write<span className="text-jordy-blue">Great</span>Notes.ai
            </h3>
            <p className="text-sm text-muted-foreground">
              Clinical note generation for healthcare providers. HIPAA-compliant, AI-powered documentation.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/appointments" className="hover:text-foreground transition-colors">
                  Appointments
                </Link>
              </li>
              <li>
                <Link href="/patients" className="hover:text-foreground transition-colors">
                  Patients
                </Link>
              </li>
            </ul>
          </div>

          {/* Settings Links */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Settings</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/settings/profile" className="hover:text-foreground transition-colors">
                  Profile
                </Link>
              </li>
              <li>
                <Link href="/settings/organization" className="hover:text-foreground transition-colors">
                  Organization
                </Link>
              </li>
              <li>
                <Link href="/settings/subscription" className="hover:text-foreground transition-colors">
                  Subscription
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="mailto:support@writegreatnotes.ai" className="hover:text-foreground transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-6">
          <p className="text-sm text-center text-muted-foreground">
            © {currentYear} Write Great Notes. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
