"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Pencil, Building2 } from "lucide-react";
import { apiGet, apiDelete } from "@/lib/api-client";
import { ProviderFormModal } from "@/components/ProviderFormModal";
import type { OrganizationProvider } from "@/types/providers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function ProvidersSettingsPage() {
  const [providers, setProviders] = useState<OrganizationProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<OrganizationProvider[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<OrganizationProvider | null>(null);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<OrganizationProvider | null>(null);

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    // Filter providers based on search query
    if (!searchQuery) {
      setFilteredProviders(providers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = providers.filter(
      (p) =>
        p.provider_name.toLowerCase().includes(query) ||
        p.npi?.toLowerCase().includes(query) ||
        p.specialty?.toLowerCase().includes(query) ||
        p.credentials?.toLowerCase().includes(query)
    );
    setFilteredProviders(filtered);
  }, [searchQuery, providers]);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const data = await apiGet<OrganizationProvider[]>("/providers?is_active=true");
      setProviders(data);
      setFilteredProviders(data);
    } catch (error) {
      console.error("Failed to load providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvider = () => {
    setEditingProvider(null);
    setFormModalOpen(true);
  };

  const handleEditProvider = (provider: OrganizationProvider) => {
    setEditingProvider(provider);
    setFormModalOpen(true);
  };

  const handleDeleteClick = (provider: OrganizationProvider) => {
    setProviderToDelete(provider);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!providerToDelete) return;

    try {
      await apiDelete(`/providers/${providerToDelete.id}`);
      await loadProviders();
      setDeleteDialogOpen(false);
      setProviderToDelete(null);
      toast.success("Provider deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete provider");
    }
  };

  const handleFormSuccess = async (provider: OrganizationProvider) => {
    await loadProviders();
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Provider Directory</h1>
            <p className="text-muted-foreground mt-1">
              Manage your organization's provider directory
            </p>
          </div>
          <Button onClick={handleAddProvider}>
            <Plus className="h-4 w-4 mr-2" />
            Add Provider
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search Providers</CardTitle>
            <CardDescription>
              Search by name, NPI, specialty, or credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Providers Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Providers ({filteredProviders.length})</CardTitle>
                <CardDescription>
                  All providers in your organization's directory
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading providers...
              </div>
            ) : filteredProviders.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No providers found matching your search"
                    : "No providers in your directory yet"}
                </p>
                {!searchQuery && (
                  <Button onClick={handleAddProvider} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Provider
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>NPI</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProviders.map((provider) => (
                    <TableRow key={provider.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{provider.provider_name}</div>
                          {provider.credentials && (
                            <div className="text-sm text-muted-foreground">
                              {provider.credentials}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {provider.npi ? (
                          <code className="text-sm">{provider.npi}</code>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {provider.specialty || (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {provider.phone && <div>{provider.phone}</div>}
                          {provider.fax && (
                            <div className="text-muted-foreground">Fax: {provider.fax}</div>
                          )}
                          {!provider.phone && !provider.fax && (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={provider.source === "npi" ? "default" : "outline"}>
                          {provider.source === "npi" ? "NPI" : "Custom"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProvider(provider)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(provider)}
                            className="text-destructive hover:text-destructive"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Provider Form Modal */}
      <ProviderFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        provider={editingProvider}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Provider</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{providerToDelete?.provider_name}</strong>? This will remove the
              provider from your directory. Existing referrals and patients will retain
              their provider information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive">
              Delete Provider
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
