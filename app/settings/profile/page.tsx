"use client";

import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiGet, apiPatch } from "@/lib/api-client";
import { createClient } from "@/lib/supabase/client";
import { isProvider } from "@/lib/roles";
import { clearSWRCache } from "@/lib/swr-config";
import { AlertCircle, CheckCircle2, LogOut, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useUserProfile } from "@/lib/use-user-profile";
import { useEMRConnections, hasActiveConnection } from "@/lib/use-emr-connections";

import { logger } from "@/lib/logger";
type VisitType = {
  id: string;
  name: string;
};

export default function ProfileSettingsPage() {
  const router = useRouter();

  // Use SWR hooks for cached data (instant render, no shuffling)
  const { data: profile, isLoading: profileLoading, mutate: mutateProfile } = useUserProfile();
  const { data: connections } = useEMRConnections();
  const hasActive = hasActiveConnection(connections);

  // Active section state
  const [activeSection, setActiveSection] = useState('profile');

  // Profile data (initialized from SWR cache)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [degree, setDegree] = useState("");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [userId, setUserId] = useState("");
  const [allowedVisitTypes, setAllowedVisitTypes] = useState<string[]>([]);
  const [defaultVisitType, setDefaultVisitType] = useState<string | null>(null);
  const [charmPostGenerationAction, setCharmPostGenerationAction] = useState<string>("do_nothing");

  // Visit types data
  const [visitTypes, setVisitTypes] = useState<VisitType[]>([]);
  const [selectedVisitType, setSelectedVisitType] = useState("");

  // Derived state
  const hasCharmConnection = hasActiveConnection(connections, 'charm');

  // UI state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize form fields from profile data (SWR cache)
  useEffect(() => {
    if (profile) {
      setUserId(profile.uid);
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setPhone(profile.phone || "");
      setDegree(profile.degree || "");
      setEmail(profile.email || "");
      setRoles(profile.roles || []);
      setAllowedVisitTypes(profile.allowed_visit_types || []);
      setDefaultVisitType(profile.default_visit_type || null);

      // Load Charm settings
      const emrSettings = profile.emr_settings || {};
      setCharmPostGenerationAction(emrSettings.charm_post_generation_action || "do_nothing");
    }
  }, [profile]);

  // Load visit types when visit-types section is active
  useEffect(() => {
    if (activeSection === 'visit-types') {
      loadVisitTypes();
    }
  }, [activeSection]);

  const loadVisitTypes = async () => {
    try {
      const data = await apiGet<VisitType[]>('/visit-types');
      setVisitTypes(data);
    } catch (err) {
      logger.error('Failed to load visit types:', err);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await apiPatch("/users/me", {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        degree: degree,
      });
      setSuccess("Profile updated");
      setTimeout(() => setSuccess(""), 3000);
      // Refresh cache with fresh data
      await mutateProfile();
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };


  const handleCharmSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await apiPatch("/users/me", {
        emr_settings: {
          charm_post_generation_action: charmPostGenerationAction,
        },
      });
      setSuccess("Charm settings updated");
      setTimeout(() => setSuccess(""), 3000);
      // Refresh cache with fresh data
      await mutateProfile();
    } catch (err: any) {
      setError(err.message || "Failed to update Charm settings");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVisitType = async () => {
    if (!selectedVisitType) return;

    setError("");
    setSuccess("");

    try {
      await apiPatch(`/users/${userId}/allowed-visit-types`, {
        visit_type_id: selectedVisitType,
        action: 'add'
      });

      // Update local state
      setAllowedVisitTypes(prev => [...prev, selectedVisitType]);
      setSelectedVisitType("");
      setSuccess("Visit type added");
      setTimeout(() => setSuccess(""), 3000);
      // Refresh cache with fresh data
      await mutateProfile();
    } catch (err: any) {
      setError(err?.message || "Failed to add visit type");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleRemoveVisitType = async (visitTypeId: string) => {
    setError("");
    setSuccess("");

    try {
      await apiPatch(`/users/${userId}/allowed-visit-types`, {
        visit_type_id: visitTypeId,
        action: 'remove'
      });

      // Update local state
      setAllowedVisitTypes(prev => prev.filter(id => id !== visitTypeId));

      // If removed visit type was the default, unset it
      if (defaultVisitType === visitTypeId) {
        setDefaultVisitType(null);
        await handleUpdateDefaultVisitType(null);
      }

      setSuccess("Visit type removed");
      setTimeout(() => setSuccess(""), 3000);
      // Refresh cache with fresh data
      await mutateProfile();
    } catch (err: any) {
      setError(err?.message || "Failed to remove visit type");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleUpdateDefaultVisitType = async (visitTypeId: string | null) => {
    setError("");
    setSuccess("");

    try {
      await apiPatch(`/users/${userId}/default-visit-type`, {
        default_visit_type_id: visitTypeId
      });

      setDefaultVisitType(visitTypeId);
      setSuccess(visitTypeId ? "Default visit type updated" : "Default visit type cleared");
      setTimeout(() => setSuccess(""), 3000);
      // Refresh cache with fresh data
      await mutateProfile();
    } catch (err: any) {
      setError(err?.message || "Failed to update default visit type");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    clearSWRCache(); // Clear all cached data before logout
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Get allowed and available visit types for the dropdown
  const allowedVisitTypeObjects = visitTypes.filter(vt => allowedVisitTypes.includes(vt.id));
  const availableVisitTypes = visitTypes.filter(vt => !allowedVisitTypes.includes(vt.id));

  return (
    <AppLayout>

      {/* Tabs for section switching */}
      <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as typeof activeSection)} className="mb-6">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
          <TabsTrigger
            value="profile"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <span className="hidden sm:inline">Profile</span>
            <span className="sm:hidden">Profile</span>
          </TabsTrigger>
          {isProvider(roles) && hasCharmConnection && (
            <TabsTrigger
              value="charm"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <span className="hidden sm:inline">Charm</span>
              <span className="sm:hidden">Charm</span>
            </TabsTrigger>
          )}
          {isProvider(roles) && (
            <TabsTrigger
              value="visit-types"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <span className="hidden sm:inline">Visit Types</span>
              <span className="sm:hidden">Types</span>
            </TabsTrigger>
          )}
          <TabsTrigger
            value="account"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <span className="hidden sm:inline">Account</span>
            <span className="sm:hidden">Account</span>
          </TabsTrigger>
        </TabsList>

        {/* Global Status Messages - shown in all sections except visit-types */}
        {activeSection !== 'visit-types' && error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {activeSection !== 'visit-types' && success && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Profile Section */}
        <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal and professional information
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {roles.length > 0 &&
                      roles.map((role) => (
                        <Badge
                          key={role}
                          variant={role === "admin" ? "default" : "secondary"}
                        >
                          {role}
                        </Badge>
                      ))}
                  </div>
                </div>
              </CardHeader>
              <form onSubmit={handleProfileSubmit}>
                <CardContent className="space-y-4">
                  {/* Email (read-only) */}
                  <div className="space-y-2" style={{ width: "520px" }}>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      Your email address cannot be changed
                    </p>
                  </div>

                  {/* Name fields */}
                  <div className="flex gap-4">
                    <div className="space-y-2" style={{ width: "250px" }}>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2" style={{ width: "250px" }}>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Mobile and Degree */}
                  <div className="flex gap-4">
                    <div className="space-y-2" style={{ width: "250px" }}>
                      <Label htmlFor="phone">Mobile</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2" style={{ width: "150px" }}>
                      <Label htmlFor="degree">Degree</Label>
                      <Input
                        id="degree"
                        type="text"
                        placeholder="MD, DO, NP"
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </form>
            </Card>
        </TabsContent>

        {/* Charm Section */}
        <TabsContent value="charm">
            <Card>
              <CardHeader>
                <CardTitle>Charm Note Management</CardTitle>
                <CardDescription>
                  Choose what happens after a note is generated
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleCharmSettingsSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-base font-medium">After a note is generated:</Label>

                    <div className="space-y-3 ml-1">
                      {/* Option 1: Do Nothing */}
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          id="do_nothing"
                          name="charm_post_generation"
                          value="do_nothing"
                          checked={charmPostGenerationAction === "do_nothing"}
                          onChange={(e) => setCharmPostGenerationAction(e.target.value)}
                          className="mt-1 h-4 w-4"
                        />
                        <label htmlFor="do_nothing" className="flex-1 cursor-pointer">
                          <div className="font-medium">Do Nothing, I will push the note later if necessary</div>
                          <div className="text-sm text-muted-foreground mt-0.5">
                            Notes will remain in Write Great Notes until you manually push them to Charm
                          </div>
                        </label>
                      </div>

                      {/* Option 2: Auto Push */}
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          id="auto_push"
                          name="charm_post_generation"
                          value="auto_push"
                          checked={charmPostGenerationAction === "auto_push"}
                          onChange={(e) => setCharmPostGenerationAction(e.target.value)}
                          className="mt-1 h-4 w-4"
                        />
                        <label htmlFor="auto_push" className="flex-1 cursor-pointer">
                          <div className="font-medium">Automatically push generated notes to Charm</div>
                          <div className="text-sm text-muted-foreground mt-0.5">
                            Notes will be sent to Charm immediately after generation
                          </div>
                        </label>
                      </div>

                      {/* Option 3: Auto Push and Sign */}
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          id="auto_push_and_sign"
                          name="charm_post_generation"
                          value="auto_push_and_sign"
                          checked={charmPostGenerationAction === "auto_push_and_sign"}
                          onChange={(e) => setCharmPostGenerationAction(e.target.value)}
                          className="mt-1 h-4 w-4"
                        />
                        <label htmlFor="auto_push_and_sign" className="flex-1 cursor-pointer">
                          <div className="font-medium">Automatically push generated notes to Charm and Sign them</div>
                          <div className="text-sm text-muted-foreground mt-0.5">
                            Notes will be sent to Charm and automatically signed after generation
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </form>
            </Card>
        </TabsContent>

        {/* Visit Types Section */}
        <TabsContent value="visit-types">
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Allowed Visit Types</CardTitle>
                      <CardDescription>
                        Select which visit types you can use for appointments
                      </CardDescription>
                    </div>
                    {/* Inline toast messages for visit-types section */}
                    {error && (
                      <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 flex-shrink-0" />
                        <span className="max-w-xs truncate">{error}</span>
                      </div>
                    )}
                    {success && (
                      <div className="rounded-md bg-green-50 px-3 py-2 text-xs text-green-700 flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                        <span className="max-w-xs truncate">{success}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4 space-y-3">
                    {/* Currently allowed visit types */}
                    {allowedVisitTypeObjects.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {allowedVisitTypeObjects.map((vt) => (
                          <Badge key={vt.id} variant="secondary" className="flex items-center gap-2">
                            {vt.name}
                            <button
                              onClick={() => handleRemoveVisitType(vt.id)}
                              className="hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Add new visit type */}
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedVisitType}
                        onValueChange={setSelectedVisitType}
                      >
                        <SelectTrigger className="w-[300px]">
                          <SelectValue placeholder="Select a visit type" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableVisitTypes.map((vt) => (
                            <SelectItem key={vt.id} value={vt.id}>
                              {vt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={handleAddVisitType}
                        disabled={!selectedVisitType}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    {availableVisitTypes.length === 0 && (
                      <span className="text-sm text-muted-foreground">
                        All visit types are already allowed
                      </span>
                    )}
                  </div>

                  {/* Link to add more visit types in organization settings */}
                  <div className="mt-3 pt-3 border-t">
                    <a
                      href="/settings/organization?section=visit-types"
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      Add Visit Types
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Default Visit Type Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Default Visit Type</CardTitle>
                  <CardDescription>
                    Choose a default visit type for new appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {allowedVisitTypeObjects.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Add at least one visit type above to set a default
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <Select
                        value={defaultVisitType || "none"}
                        onValueChange={(value) => handleUpdateDefaultVisitType(value === "none" ? null : value)}
                      >
                        <SelectTrigger className="w-[300px]">
                          <SelectValue placeholder="Select default visit type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <span className="text-muted-foreground">No default</span>
                          </SelectItem>
                          {allowedVisitTypeObjects.map((vt) => (
                            <SelectItem key={vt.id} value={vt.id}>
                              {vt.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        This visit type will be pre-selected when creating new appointments
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
        </TabsContent>

        {/* Account Section */}
        <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Sign out of your account</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
