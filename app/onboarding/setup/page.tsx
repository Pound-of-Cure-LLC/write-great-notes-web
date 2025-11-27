"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { apiPost, apiGet } from "@/lib/api-client";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import { clearAuthRedirectCache } from "@/hooks/useAuthRedirect";
import { useUserProfile } from "@/lib/use-user-profile";

import { logger } from "@/lib/logger";
export default function OnboardingSetupPage() {
  const [formData, setFormData] = useState({
    // Organization details
    name: "",
    phone: "",
    fax: "",
    website: "",
    address_street: "",
    address_city: "",
    address_state: "",
    address_zip: "",

    // User details
    first_name: "",
    last_name: "",
    user_phone: "",
    npi: "",
    is_provider: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Use SWR hook for user profile (instant render from cache, no shuffling)
  const { data: profile, isLoading: checking } = useUserProfile();

  // Check if user already has an organization
  useEffect(() => {
    if (!checking && profile?.organization_id) {
      // User already has organization, redirect to appointments
      logger.debug('User already has organization, redirecting to appointments');
      router.push('/appointments');
    }
  }, [checking, profile, router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      logger.debug('Onboarding: Creating organization and user profile');

      // Create organization with user details
      await apiPost("/organizations", formData);

      logger.debug('Onboarding: Success, clearing auth cache and redirecting to appointments');

      // Clear the auth redirect cache since user status changed
      clearAuthRedirectCache();

      // Redirect to appointments - the no visit types modal will show automatically
      router.push("/appointments");
    } catch (err: any) {
      logger.error('Onboarding: Error', err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Checking your account status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="flex justify-end mb-4">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold">Welcome to Write Great Notes</h1>
            <p className="text-muted-foreground mt-2">
              Let's set up your practice and your profile
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Organization Details */}
            <Card>
              <CardHeader>
                <CardTitle>Practice Information</CardTitle>
                <CardDescription>
                  Enter your clinic or practice details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="name">Practice Name *</Label>
                    <Input
                      id="name"
                      data-testid="org-name"
                      type="text"
                      placeholder="ABC Medical Clinic"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fax">Fax</Label>
                    <Input
                      id="fax"
                      type="tel"
                      placeholder="(555) 123-4568"
                      value={formData.fax}
                      onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="text"
                      placeholder="www.example.com"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address_street">Street Address</Label>
                    <Input
                      id="address_street"
                      type="text"
                      placeholder="123 Main St, Suite 100"
                      value={formData.address_street}
                      onChange={(e) => setFormData({ ...formData, address_street: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_city">City</Label>
                    <Input
                      id="address_city"
                      type="text"
                      placeholder="San Francisco"
                      value={formData.address_city}
                      onChange={(e) => setFormData({ ...formData, address_city: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_state">State</Label>
                    <Input
                      id="address_state"
                      type="text"
                      placeholder="CA"
                      maxLength={2}
                      value={formData.address_state}
                      onChange={(e) => setFormData({ ...formData, address_state: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address_zip">ZIP Code</Label>
                    <Input
                      id="address_zip"
                      type="text"
                      placeholder="94102"
                      value={formData.address_zip}
                      onChange={(e) => setFormData({ ...formData, address_zip: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Details */}
            <Card>
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>
                  Tell us about yourself
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      data-testid="user-first-name"
                      type="text"
                      placeholder="John"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      data-testid="user-last-name"
                      type="text"
                      placeholder="Doe"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user_phone">Your Phone</Label>
                    <Input
                      id="user_phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={formData.user_phone}
                      onChange={(e) => setFormData({ ...formData, user_phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="npi">NPI Number (Optional)</Label>
                    <Input
                      id="npi"
                      type="text"
                      placeholder="1234567890"
                      value={formData.npi}
                      onChange={(e) => setFormData({ ...formData, npi: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_provider"
                        data-testid="is-provider-checkbox"
                        checked={formData.is_provider}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, is_provider: checked === true })
                        }
                      />
                      <Label
                        htmlFor="is_provider"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        I am a healthcare provider
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      Check this if you will be creating clinical notes (you'll be assigned the "provider" role)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" data-testid="complete-setup" size="lg" disabled={loading} className="w-full">
              {loading ? "Setting up your account..." : "Complete Setup"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
