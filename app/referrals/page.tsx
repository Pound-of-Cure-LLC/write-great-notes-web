"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api-client";

type Referral = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  phone: string | null;
  email: string | null;
  location_id: string | null;
  referral_source_id: string | null;
  possible_duplicate_patient_id: string | null;
  possible_duplicate_referral_id: string | null;
  patient_id: string | null;
  created_at: string;
  current_status: {
    status_name: string;
    created_at: string;
  } | null;
  location: {
    name: string;
  } | null;
  referral_source: {
    name: string;
  } | null;
};

export default function ReferralsPage() {
  const router = useRouter();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    loadReferrals();
  }, [activeTab]);

  const loadReferrals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      // Apply filters based on active tab
      if (activeTab === "active") {
        params.append("exclude_inactive_status", "true");
        params.append("exclude_converted_status", "true");
      } else if (activeTab === "converted") {
        // For converted tab, we'd need to get the converted status ID
        // For now, we'll filter client-side
      }
      // "all" tab has no filters

      const data = await apiGet<Referral[]>(`/referrals?${params.toString()}`);
      setReferrals(data);
    } catch (error) {
      console.error("Failed to load referrals:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReferrals = referrals.filter((referral) => {
    // Client-side filtering for converted tab
    if (activeTab === "converted") {
      if (referral.current_status?.status_name !== "Converted") return false;
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const fullName = `${referral.first_name} ${referral.last_name}`.toLowerCase();
      const phone = referral.phone?.toLowerCase() || "";
      const email = referral.email?.toLowerCase() || "";

      return (
        fullName.includes(search) || phone.includes(search) || email.includes(search)
      );
    }

    return true;
  });

  const getStatusBadgeVariant = (statusName: string | undefined) => {
    switch (statusName) {
      case "New":
        return "default";
      case "Converted":
        return "default";
      case "Inactive":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateDaysSince = (dateString: string) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Referrals</h1>
            <p className="text-muted-foreground mt-1">
              Manage patient referrals and convert to patients
            </p>
          </div>
          <Button onClick={() => router.push("/referrals/new")}>
            <UserPlus className="h-4 w-4 mr-2" />
            New Referral
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active">Active Referrals</TabsTrigger>
            <TabsTrigger value="converted">Converted</TabsTrigger>
            <TabsTrigger value="all">All Referrals</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading referrals...</p>
              </div>
            ) : filteredReferrals.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No referrals found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "Get started by adding your first referral"}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => router.push("/referrals/new")}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      New Referral
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredReferrals.map((referral) => (
                  <Card
                    key={referral.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/referrals/${referral.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2">
                            {referral.first_name} {referral.last_name}
                            {(referral.possible_duplicate_patient_id ||
                              referral.possible_duplicate_referral_id) && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Possible Duplicate
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {referral.date_of_birth && (
                              <span>DOB: {formatDate(referral.date_of_birth)} • </span>
                            )}
                            {referral.phone && <span>{referral.phone} • </span>}
                            {referral.email && <span>{referral.email}</span>}
                          </CardDescription>
                        </div>
                        <Badge variant={getStatusBadgeVariant(referral.current_status?.status_name)}>
                          {referral.current_status?.status_name || "Unknown"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-6 text-sm text-muted-foreground">
                        {referral.location && (
                          <div>
                            <span className="font-medium">Location:</span> {referral.location.name}
                          </div>
                        )}
                        {referral.referral_source && (
                          <div>
                            <span className="font-medium">Source:</span>{" "}
                            {referral.referral_source.name}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Created:</span>{" "}
                          {calculateDaysSince(referral.created_at)} days ago
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
