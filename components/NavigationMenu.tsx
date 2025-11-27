"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Building2,
  User,
  FileText,
  Cable,
  Calendar,
  ListChecks,
  UserRound,
  UserPlus,
  Shield,
} from "lucide-react";
import { useCapabilities } from "@/lib/capabilities";
import { useAuth } from "@/hooks/useAuth";

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  conditional?: string; // Optional conditional rendering key
};

const navigationItems: NavigationItem[] = [
  {
    name: "Schedule",
    href: "/appointments",
    icon: Calendar,
    description: "View and manage appointments",
  },
  {
    name: "Referrals",
    href: "/referrals",
    icon: UserPlus,
    description: "Manage patient referrals",
  },
  {
    name: "Patients",
    href: "/patients",
    icon: UserRound,
    description: "Patients and clinical notes",
  },
  {
    name: "Your Practice",
    href: "/settings/organization",
    icon: Building2,
    description: "Practice settings and users",
  },
  {
    name: "Your Profile",
    href: "/settings/profile",
    icon: User,
    description: "Your profile and preferences",
  },
  {
    name: "Note Sections",
    href: "/settings/note-sections",
    icon: FileText,
    description: "Configure note sections",
  },
  {
    name: "Charm",
    href: "/settings/charm",
    icon: Cable,
    description: "Charm EHR integration",
    conditional: "charm", // Only show for Charm adapter users
  },
  {
    name: "Subscription",
    href: "/settings/subscription",
    icon: ListChecks,
    description: "Subscription management",
  },
  {
    name: "App Admin",
    href: "/admin",
    icon: Shield,
    description: "System administration (super-admin only)",
    conditional: "super-admin",
  },
];

export function NavigationMenu() {
  const [open, setOpen] = useState(false);
  const capabilities = useCapabilities();
  const { user } = useAuth();

  // Filter navigation items based on conditional rendering
  const filteredItems = navigationItems.filter((item) => {
    if (!item.conditional) return true; // Show if no conditional

    // Handle "charm" conditional - show if Charm adapter is active
    if (item.conditional === "charm") {
      return capabilities.adapterType.toLowerCase() === "charm";
    }

    // Handle "super-admin" conditional - only show for super-admins
    if (item.conditional === "super-admin") {
      const roles = user?.user_metadata?.roles || [];
      return roles.includes("super-admin");
    }

    return true;
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 mt-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>
            Navigate to different sections of the application
          </SheetDescription>
        </SheetHeader>
        <nav className="mt-6 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-start gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-muted"
              >
                <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
