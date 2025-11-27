"use client";

import { useState, useEffect } from "react";

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic';
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, Shield, Database, Building2, Users, Briefcase, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, CreditCard, AlertTriangle, ExternalLink, CheckCircle } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/AppLayout";
import { cn } from "@/lib/utils";

import { logger } from "@/lib/logger";
type Organization = {
  id: string;
  name: string;
  created_at: string;
  emr_connection_count: number;
  ai_model_setting?: string;
};

type EMRConnection = {
  id: string;
  organization_id: string;
  emr_type: string;
  connection_name: string;
  connection_status: string;
  created_at: string;
};

type EMRType = {
  id: string;
  name: string;
  display_name: string;
  description: string;
  is_active: boolean;
};

type User = {
  uid: string;
  email: string;
  first_name: string;
  last_name: string;
  organization_id: string;
  organization_name?: string;
  roles: string[];
  is_super_admin: boolean;
};

type SidebarSection = 'organizations' | 'users' | 'emr-types' | 'jobs' | 'subscriptions' | 'error-logs';

type Job = {
  id: string;
  organization_id: string;
  job_type: string;
  job_data: Record<string, unknown>;
  status: string;
  priority: number;
  max_attempts: number;
  attempts: number;
  last_error?: string;
  next_retry_at?: string;
  started_at?: string;
  completed_at?: string;
  processing_time_ms?: number;
  created_at: string;
  scheduled_for: string;
  created_by?: string;
  result?: Record<string, unknown>;
};

type JobStatistics = {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  recent_failures: Job[];
};

type Subscription = {
  id: string;
  user_id: string;
  organization_id: string;
  subscription_tier: string;
  status: string;
  plan_id: string;
  base_monthly_limit: number;
  addon_notes_remaining: number;
  notes_used_this_month: number;
  trial_end?: string;
  current_period_start?: string;
  current_period_end?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_first_name?: string;
  user_last_name?: string;
  organization_name?: string;
};

export default function AppAdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Section state
  const [activeSection, setActiveSection] = useState<SidebarSection>('organizations');

  // Organizations & EMR Connections state
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [orgSearchQuery, setOrgSearchQuery] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [orgConnections, setOrgConnections] = useState<EMRConnection[]>([]);
  const [showAddConnectionDialog, setShowAddConnectionDialog] = useState(false);
  const [selectedOrgAIModel, setSelectedOrgAIModel] = useState<string>("low");
  const [savingAIModel, setSavingAIModel] = useState(false);

  // User management state
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [superAdmins, setSuperAdmins] = useState<User[]>([]);

  // EMR Types state
  const [emrTypes, setEmrTypes] = useState<EMRType[]>([]);
  const [showAddEMRTypeDialog, setShowAddEMRTypeDialog] = useState(false);
  const [emrTypeFormData, setEmrTypeFormData] = useState({
    name: '',
    display_name: '',
    description: ''
  });
  const [emrTypeError, setEmrTypeError] = useState<string>('');

  // Jobs state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobStatistics, setJobStatistics] = useState<JobStatistics | null>(null);
  const [jobStatusFilter, setJobStatusFilter] = useState<string>('all');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('all');

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subStatusFilter, setSubStatusFilter] = useState<string>('all');
  const [subTierFilter, setSubTierFilter] = useState<string>('all');
  const [subOrgFilter, setSubOrgFilter] = useState<string>('all');
  const [showCreateSubDialog, setShowCreateSubDialog] = useState(false);
  const [showEditSubDialog, setShowEditSubDialog] = useState(false);
  const [showAddAddonDialog, setShowAddAddonDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  // Error logs state
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [errorLogsTotal, setErrorLogsTotal] = useState(0);
  const [errorLogsLoading, setErrorLogsLoading] = useState(false);
  const [errorLogsFilter, setErrorLogsFilter] = useState<{ resolved?: boolean | undefined; severity?: string; error_type?: string }>({});
  const [selectedErrorLog, setSelectedErrorLog] = useState<any | null>(null);
  const [showErrorLogDialog, setShowErrorLogDialog] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');
  const [subFormData, setSubFormData] = useState({
    user_id: '',
    organization_id: '',
    subscription_tier: 'limited',
    status: 'trialing',
    plan_id: 'trial_7_day',
    base_monthly_limit: 100
  });
  const [orgProviders, setOrgProviders] = useState<User[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [editSubFormData, setEditSubFormData] = useState({
    subscription_tier: '',
    status: '',
    base_monthly_limit: 0,
    addon_notes_remaining: 0,
    notes_used_this_month: 0
  });
  const [addonFormData, setAddonFormData] = useState({
    notes_purchased: 250,
    price_paid_cents: 4900
  });

  // Loading states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Check if user is super-admin
  useEffect(() => {
    if (user && !user.user_metadata?.roles?.includes('super-admin')) {
      router.push('/');
    }
  }, [user, router]);

  // Load EMR types on mount (needed for Add Connection dialog)
  useEffect(() => {
    loadEMRTypes();
  }, []);

  // Load data based on active section
  useEffect(() => {
    if (activeSection === 'organizations') {
      loadOrganizations();
    } else if (activeSection === 'users') {
      loadSuperAdmins();
    } else if (activeSection === 'emr-types') {
      loadEMRTypes();
    } else if (activeSection === 'jobs') {
      loadJobs();
      loadJobStatistics();
    } else if (activeSection === 'subscriptions') {
      loadSubscriptions();
    }
  }, [activeSection]);

  // Filter organizations based on search query
  useEffect(() => {
    if (orgSearchQuery.trim() === '') {
      setFilteredOrganizations(organizations);
    } else {
      const query = orgSearchQuery.toLowerCase();
      setFilteredOrganizations(
        organizations.filter(org =>
          org.name.toLowerCase().includes(query)
        )
      );
    }
  }, [orgSearchQuery, organizations]);

  // Auto-reload jobs when filters change
  useEffect(() => {
    if (activeSection === 'jobs') {
      loadJobs();
    }
  }, [jobStatusFilter, jobTypeFilter]);

  // Subscribe to jobs realtime updates
  useEffect(() => {
    if (activeSection !== 'jobs') return;

    const supabase = createClient();

    // Subscribe to all changes on jobs table
    const channel = supabase
      .channel('jobs_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
        },
        (payload: any) => {
          logger.debug('Job realtime update:', payload);

          if (payload.eventType === 'INSERT') {
            setJobs((prev) => [payload.new as Job, ...prev]);
            loadJobStatistics();
          } else if (payload.eventType === 'UPDATE') {
            setJobs((prev) =>
              prev.map((job) =>
                job.id === payload.new.id ? (payload.new as Job) : job
              )
            );
            loadJobStatistics();
          } else if (payload.eventType === 'DELETE') {
            setJobs((prev) => prev.filter((job) => job.id !== payload.old.id));
            loadJobStatistics();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSection]);

  // Load error logs when error-logs tab is active
  useEffect(() => {
    if (activeSection === 'error-logs') {
      const loadErrorLogs = async () => {
        setErrorLogsLoading(true);
        try {
          const params = new URLSearchParams();
          if (errorLogsFilter.resolved !== undefined) {
            params.append('resolved', errorLogsFilter.resolved.toString());
          }
          if (errorLogsFilter.severity) {
            params.append('severity', errorLogsFilter.severity);
          }
          if (errorLogsFilter.error_type) {
            params.append('error_type', errorLogsFilter.error_type);
          }
          params.append('limit', '50');
          params.append('offset', '0');
          const response = await apiGet(`/super-admin/error-logs?${params.toString()}`) as { logs?: any[]; total?: number };
          setErrorLogs(response.logs || []);
          setErrorLogsTotal(response.total || 0);
        } catch (error) {
          logger.error('Failed to load error logs', error);
        } finally {
          setErrorLogsLoading(false);
        }
      };
      loadErrorLogs();
    }
  }, [activeSection, errorLogsFilter]);

  // Load organizations
  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/super-admin/organizations') as Organization[];
      setOrganizations(data);
      setFilteredOrganizations(data);
    } catch (error) {
      logger.error('Failed to load organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load EMR connections for organization
  const loadOrgConnections = async (orgId: string) => {
    try {
      const data = await apiGet(`/super-admin/organizations/${orgId}/emr-connections`) as EMRConnection[];
      setOrgConnections(data);
    } catch (error) {
      logger.error('Failed to load EMR connections:', error);
    }
  };

  // Load EMR types
  const loadEMRTypes = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/super-admin/emr-types') as EMRType[];
      setEmrTypes(data);
    } catch (error) {
      logger.error('Failed to load EMR types:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load super admins
  const loadSuperAdmins = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/super-admin/users/super-admins') as User[];
      setSuperAdmins(data);
    } catch (error) {
      logger.error('Failed to load super admins:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search users
  const handleSearchUsers = async () => {
    if (!userSearchQuery || userSearchQuery.length < 2) {
      return;
    }

    try {
      setLoading(true);
      const data = await apiGet(`/super-admin/users/search?q=${encodeURIComponent(userSearchQuery)}`) as User[];
      setSearchResults(data);
    } catch (error) {
      logger.error('Failed to search users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle super-admin role
  const handleToggleSuperAdmin = async (userId: string, isSuperAdmin: boolean) => {
    try {
      setActionLoading(true);
      await apiPost(`/super-admin/users/${userId}/roles`, {
        action: isSuperAdmin ? 'remove' : 'add',
        role: 'super-admin'
      });

      // Refresh super admins list and search results
      await loadSuperAdmins();
      if (userSearchQuery && userSearchQuery.length >= 2) {
        await handleSearchUsers();
      }
    } catch (error) {
      logger.error('Failed to toggle super-admin role:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Add EMR connection
  const handleAddConnection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOrg) return;

    const formData = new FormData(e.currentTarget);

    try {
      setActionLoading(true);
      await apiPost(`/super-admin/organizations/${selectedOrg.id}/emr-connections`, {
        organization_id: selectedOrg.id,
        emr_type: formData.get('emr_type') as string,
        connection_name: formData.get('connection_name') as string,
        connection_status: formData.get('connection_status') as string,
      });

      setShowAddConnectionDialog(false);
      await loadOrgConnections(selectedOrg.id);
    } catch (error) {
      logger.error('Failed to add EMR connection:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Update connection status
  const handleUpdateConnectionStatus = async (connectionId: string, status: string) => {
    try {
      setActionLoading(true);
      await apiPatch(`/super-admin/emr-connections/${connectionId}`, {
        connection_status: status
      });

      if (selectedOrg) {
        await loadOrgConnections(selectedOrg.id);
      }
    } catch (error) {
      logger.error('Failed to update connection status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete EMR connection
  const handleDeleteConnection = async (connectionId: string) => {
    try {
      setActionLoading(true);
      await apiDelete(`/super-admin/emr-connections/${connectionId}`);

      if (selectedOrg) {
        await loadOrgConnections(selectedOrg.id);
      }
    } catch (error) {
      logger.error('Failed to delete EMR connection:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Add EMR type
  const handleAddEMRType = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmrTypeError('');

    try {
      setActionLoading(true);
      await apiPost('/super-admin/emr-types', {
        name: emrTypeFormData.name,
        display_name: emrTypeFormData.display_name,
        description: emrTypeFormData.description,
        is_active: true,
      });

      setShowAddEMRTypeDialog(false);
      setEmrTypeFormData({ name: '', display_name: '', description: '' });
      await loadEMRTypes();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add EMR type';
      setEmrTypeError(errorMessage);
      logger.error('Failed to add EMR type:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle EMR type active status
  const handleToggleEMRTypeStatus = async (typeId: string, isActive: boolean) => {
    try {
      setActionLoading(true);
      await apiPatch(`/super-admin/emr-types/${typeId}`, {
        is_active: !isActive
      });

      await loadEMRTypes();
    } catch (error) {
      logger.error('Failed to update EMR type status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectOrganization = (org: Organization) => {
    setSelectedOrg(org);
    setSelectedOrgAIModel(org.ai_model_setting || 'low');
    loadOrgConnections(org.id);
  };

  // Handle AI Model Setting Update
  const handleUpdateAIModel = async () => {
    if (!selectedOrg) return;

    try {
      setSavingAIModel(true);
      await apiPatch(`/super-admin/organizations/${selectedOrg.id}`, {
        ai_model_setting: selectedOrgAIModel
      });

      // Update local state
      setOrganizations(orgs =>
        orgs.map(org =>
          org.id === selectedOrg.id
            ? { ...org, ai_model_setting: selectedOrgAIModel }
            : org
        )
      );
      setFilteredOrganizations(orgs =>
        orgs.map(org =>
          org.id === selectedOrg.id
            ? { ...org, ai_model_setting: selectedOrgAIModel }
            : org
        )
      );
      setSelectedOrg({ ...selectedOrg, ai_model_setting: selectedOrgAIModel });

      // Show success toast (if toast library is available)
      logger.info('AI model setting updated successfully');
    } catch (error) {
      logger.error('Failed to update AI model setting:', error);
    } finally {
      setSavingAIModel(false);
    }
  };

  // Load jobs
  const loadJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (jobStatusFilter && jobStatusFilter !== 'all') {
        params.append('status', jobStatusFilter);
      }
      if (jobTypeFilter && jobTypeFilter !== 'all') {
        params.append('job_type', jobTypeFilter);
      }
      params.append('limit', '100');

      const data = await apiGet(`/jobs?${params.toString()}`) as { jobs: Job[], count: number };
      setJobs(data.jobs);
    } catch (error) {
      logger.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load job statistics
  const loadJobStatistics = async () => {
    try {
      const data = await apiGet('/jobs/statistics') as JobStatistics;
      setJobStatistics(data);
    } catch (error) {
      logger.error('Failed to load job statistics:', error);
    }
  };

  // Cancel job
  const handleCancelJob = async (jobId: string) => {
    try {
      setActionLoading(true);
      await apiPost(`/jobs/${jobId}/cancel`, {});
      await loadJobs();
      await loadJobStatistics();
    } catch (error) {
      logger.error('Failed to cancel job:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Load subscriptions
  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (subStatusFilter && subStatusFilter !== 'all') {
        params.append('status', subStatusFilter);
      }
      if (subTierFilter && subTierFilter !== 'all') {
        params.append('tier', subTierFilter);
      }
      if (subOrgFilter && subOrgFilter !== 'all') {
        params.append('organization_id', subOrgFilter);
      }

      const data = await apiGet(`/super-admin/subscriptions?${params.toString()}`) as Subscription[];
      setSubscriptions(data);
    } catch (error) {
      logger.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load providers for organization
  const loadProvidersForOrg = async (organizationId: string) => {
    if (!organizationId) {
      setOrgProviders([]);
      return;
    }

    try {
      setLoadingProviders(true);
      const data = await apiGet(`/super-admin/organizations/${organizationId}/users?role=provider`) as User[];
      setOrgProviders(data);
    } catch (error) {
      logger.error('Failed to load providers for organization:', error);
      setOrgProviders([]);
    } finally {
      setLoadingProviders(false);
    }
  };

  // Handle organization selection in create subscription form
  const handleOrgSelectForSubscription = (orgId: string) => {
    setSubFormData({
      ...subFormData,
      organization_id: orgId,
      user_id: '' // Reset user selection when org changes
    });
    loadProvidersForOrg(orgId);
  };

  // Create subscription
  const handleCreateSubscription = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setActionLoading(true);
      await apiPost('/super-admin/subscriptions', subFormData);

      setShowCreateSubDialog(false);
      setSubFormData({
        user_id: '',
        organization_id: '',
        subscription_tier: 'limited',
        status: 'trialing',
        plan_id: 'trial_7_day',
        base_monthly_limit: 100
      });
      setOrgProviders([]); // Clear providers list
      await loadSubscriptions();
    } catch (error) {
      logger.error('Failed to create subscription:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Open edit dialog
  const handleOpenEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setEditSubFormData({
      subscription_tier: subscription.subscription_tier,
      status: subscription.status,
      base_monthly_limit: subscription.base_monthly_limit,
      addon_notes_remaining: subscription.addon_notes_remaining,
      notes_used_this_month: subscription.notes_used_this_month
    });
    setShowEditSubDialog(true);
  };

  // Update subscription
  const handleUpdateSubscription = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSubscription) return;

    try {
      setActionLoading(true);
      await apiPatch(`/super-admin/subscriptions/${selectedSubscription.id}`, editSubFormData);

      setShowEditSubDialog(false);
      setSelectedSubscription(null);
      await loadSubscriptions();
    } catch (error) {
      logger.error('Failed to update subscription:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel subscription
  const handleCancelSubscription = async (subscriptionId: string, immediately: boolean = false) => {
    try {
      setActionLoading(true);
      await apiDelete(`/super-admin/subscriptions/${subscriptionId}?cancel_immediately=${immediately}`);
      await loadSubscriptions();
    } catch (error) {
      logger.error('Failed to cancel subscription:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Open add addon dialog
  const handleOpenAddAddon = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setAddonFormData({
      notes_purchased: 250,
      price_paid_cents: 4900
    });
    setShowAddAddonDialog(true);
  };

  // Create addon purchase
  const handleCreateAddon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSubscription) return;

    try {
      setActionLoading(true);
      await apiPost(`/super-admin/subscriptions/${selectedSubscription.id}/addons`, {
        user_id: selectedSubscription.user_id,
        notes_purchased: addonFormData.notes_purchased,
        price_paid_cents: addonFormData.price_paid_cents
      });

      setShowAddAddonDialog(false);
      setSelectedSubscription(null);
      await loadSubscriptions();
    } catch (error) {
      logger.error('Failed to create addon:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (!user || !user.user_metadata?.roles?.includes('super-admin')) {
    return null; // Will redirect in useEffect
  }

  return (
    <AppLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">App Admin</h1>
        <p className="text-sm text-muted-foreground">
          Manage organizations, users, and system settings
        </p>
      </div>

      {/* Tabs for section switching */}
      <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as SidebarSection)} className="mb-6">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
          <TabsTrigger
            value="organizations"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Building2 className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Organizations</span>
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Users className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">User Management</span>
          </TabsTrigger>
          <TabsTrigger
            value="emr-types"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Database className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">EMR Types</span>
          </TabsTrigger>
          <TabsTrigger
            value="jobs"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Briefcase className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Job Queue</span>
          </TabsTrigger>
          <TabsTrigger
            value="subscriptions"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <CreditCard className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Subscriptions</span>
          </TabsTrigger>
          <TabsTrigger
            value="error-logs"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <AlertTriangle className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Error Logs</span>
          </TabsTrigger>
        </TabsList>

        {/* Organizations Section */}
        <TabsContent value="organizations">
        <div className="space-y-6 max-w-4xl">
          {/* Organization Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Organization</CardTitle>
              <CardDescription>Choose an organization to manage EMR connections and AI model settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedOrg?.id || ""}
                onValueChange={(value) => {
                  const org = organizations.find(o => o.id === value);
                  if (org) handleSelectOrganization(org);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an organization..." />
                </SelectTrigger>
                <SelectContent>
                  {loading ? (
                    <div className="p-2 text-sm text-muted-foreground">Loading organizations...</div>
                  ) : organizations.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No organizations found</div>
                  ) : (
                    organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name} ({org.emr_connection_count} connection{org.emr_connection_count !== 1 ? 's' : ''})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedOrg && (
            <>
              {/* EMR Connections Card */}
              <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>EMR Connections</CardTitle>
                  <CardDescription>
                    {selectedOrg ? selectedOrg.name : 'Select an organization'}
                  </CardDescription>
                </div>
                {selectedOrg && (
                  <Dialog open={showAddConnectionDialog} onOpenChange={setShowAddConnectionDialog}>
                    <Button size="sm" onClick={() => setShowAddConnectionDialog(true)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Connection
                    </Button>
                    <DialogContent>
                      <form onSubmit={handleAddConnection}>
                        <DialogHeader>
                          <DialogTitle>Add EMR Connection</DialogTitle>
                          <DialogDescription>
                            Create a new EMR connection for {selectedOrg.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="emr_type">EMR Type</Label>
                            <Select name="emr_type" required>
                              <SelectTrigger>
                                <SelectValue placeholder="Select EMR type" />
                              </SelectTrigger>
                              <SelectContent>
                                {emrTypes.filter(t => t.is_active).map((type) => (
                                  <SelectItem key={type.id} value={type.name}>
                                    {type.display_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="connection_name">Connection Name</Label>
                            <Input
                              id="connection_name"
                              name="connection_name"
                              placeholder="e.g., Main Office Charm"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="connection_status">Status</Label>
                            <Select name="connection_status" defaultValue="pending">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setShowAddConnectionDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={actionLoading}>
                            {actionLoading ? 'Creating...' : 'Create Connection'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedOrg ? (
                <p className="text-muted-foreground text-center py-8">
                  Select an organization to view connections
                </p>
              ) : orgConnections.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No EMR connections yet
                </p>
              ) : (
                <div className="space-y-2">
                  {orgConnections.map((conn) => (
                    <div
                      key={conn.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{conn.connection_name}</div>
                        <div className="text-xs text-muted-foreground">{conn.emr_type}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={conn.connection_status}
                          onValueChange={(value) => handleUpdateConnectionStatus(conn.id, value)}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteConnection(conn.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

              {/* AI Model Configuration Card */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Model Configuration</CardTitle>
                  <CardDescription>
                    Configure the OpenAI model used for clinical note generation. Higher tiers provide better quality but cost more.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai_model_setting">AI Model Tier</Label>
                    <Select
                      value={selectedOrgAIModel}
                      onValueChange={setSelectedOrgAIModel}
                    >
                      <SelectTrigger id="ai_model_setting" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Low - GPT-5 Nano</span>
                            <span className="text-xs text-muted-foreground">Minimal reasoning, low verbosity - most economical</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Medium - GPT-5 Mini</span>
                            <span className="text-xs text-muted-foreground">Low reasoning, medium verbosity - balanced performance</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">High - GPT-5.1</span>
                            <span className="text-xs text-muted-foreground">Medium reasoning, high verbosity - best quality</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={handleUpdateAIModel}
                    disabled={savingAIModel || selectedOrgAIModel === selectedOrg.ai_model_setting}
                  >
                    {savingAIModel ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save AI Model Setting'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
        </TabsContent>

        {/* User Management Section */}
        <TabsContent value="users">
        <div className="space-y-6">
          {/* Super Admins List */}
          <Card>
            <CardHeader>
              <CardTitle>Super Admins</CardTitle>
              <CardDescription>Current users with super-admin privileges</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : superAdmins.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No super admins found
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {superAdmins.map((admin) => (
                      <TableRow key={admin.uid}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            {admin.first_name} {admin.last_name}
                          </div>
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {admin.organization_name || admin.organization_id}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleToggleSuperAdmin(admin.uid, true)}
                            disabled={actionLoading || admin.uid === user.user_metadata?.sub}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* User Search */}
          <Card>
            <CardHeader>
              <CardTitle>Add Super Admin</CardTitle>
              <CardDescription>Search for users and grant super-admin privileges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search by email, first name, or last name..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}
                  />
                </div>
                <Button onClick={handleSearchUsers} disabled={!userSearchQuery || userSearchQuery.length < 2}>
                  <Search className="h-4 w-4 mr-1" />
                  Search
                </Button>
              </div>

              {searchResults.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Super Admin</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((searchUser) => (
                      <TableRow key={searchUser.uid}>
                        <TableCell>
                          {searchUser.first_name} {searchUser.last_name}
                        </TableCell>
                        <TableCell>{searchUser.email}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {searchUser.roles.map((role) => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {searchUser.is_super_admin && (
                            <Badge variant="default">
                              <Shield className="h-3 w-3 mr-1" />
                              Super Admin
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={searchUser.is_super_admin ? "destructive" : "default"}
                            onClick={() => handleToggleSuperAdmin(searchUser.uid, searchUser.is_super_admin)}
                            disabled={actionLoading || searchUser.uid === user.user_metadata?.sub}
                          >
                            {searchUser.is_super_admin ? 'Remove' : 'Make Super Admin'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {!loading && searchResults.length === 0 && userSearchQuery && (
                <p className="text-muted-foreground text-center py-8">
                  No users found matching "{userSearchQuery}"
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        </TabsContent>

        {/* EMR Types Management Section */}
        <TabsContent value="emr-types">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>EMR Types</CardTitle>
                <CardDescription>Manage available EMR integration types</CardDescription>
              </div>
              <Dialog open={showAddEMRTypeDialog} onOpenChange={setShowAddEMRTypeDialog}>
                <Button onClick={() => {
                  setEmrTypeError('');
                  setEmrTypeFormData({ name: '', display_name: '', description: '' });
                  setShowAddEMRTypeDialog(true);
                }}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add EMR Type
                </Button>
                <DialogContent>
                  <form onSubmit={handleAddEMRType}>
                    <DialogHeader>
                      <DialogTitle>Add EMR Type</DialogTitle>
                      <DialogDescription>
                        Create a new EMR integration type
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name (identifier)</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="e.g., athena"
                          pattern="[a-z\-]+"
                          title="Lowercase letters and hyphens only"
                          value={emrTypeFormData.name}
                          onChange={(e) => setEmrTypeFormData({ ...emrTypeFormData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="display_name">Display Name</Label>
                        <Input
                          id="display_name"
                          name="display_name"
                          placeholder="e.g., Athena Health"
                          value={emrTypeFormData.display_name}
                          onChange={(e) => setEmrTypeFormData({ ...emrTypeFormData, display_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          name="description"
                          placeholder="Brief description of this EMR type"
                          value={emrTypeFormData.description}
                          onChange={(e) => setEmrTypeFormData({ ...emrTypeFormData, description: e.target.value })}
                        />
                      </div>

                      {emrTypeError && (
                        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                          {emrTypeError}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowAddEMRTypeDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={actionLoading}>
                        {actionLoading ? 'Creating...' : 'Create EMR Type'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Identifier</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emrTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell className="font-medium">{type.display_name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{type.name}</code>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {type.description || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={type.is_active ? "default" : "secondary"}>
                          {type.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleEMRTypeStatus(type.id, type.is_active)}
                          disabled={actionLoading}
                        >
                          {type.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        </TabsContent>

        {/* Jobs Section */}
        <TabsContent value="jobs">
        <div className="space-y-6">
          {/* Job Statistics */}
          {jobStatistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold">{jobStatistics.pending}</p>
                    </div>
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Processing</p>
                      <p className="text-2xl font-bold">{jobStatistics.processing}</p>
                    </div>
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">{jobStatistics.completed}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Failed</p>
                      <p className="text-2xl font-bold">{jobStatistics.failed}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Jobs Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Job Queue</CardTitle>
                  <CardDescription>Monitor background job processing with real-time updates</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={jobStatusFilter} onValueChange={setJobStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="note_generation">Note Generation</SelectItem>
                      <SelectItem value="template_modification">Template Modification</SelectItem>
                      <SelectItem value="daily_summary_email">Daily Summary</SelectItem>
                      <SelectItem value="cleanup_old_jobs">Cleanup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : jobs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No jobs found</p>
              ) : (
                <div className="space-y-2">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          {job.status === 'pending' && <Clock className="h-4 w-4 text-muted-foreground" />}
                          {job.status === 'processing' && <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
                          {job.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                          {job.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                          {job.status === 'cancelled' && <AlertCircle className="h-4 w-4 text-orange-500" />}
                          <span className="font-medium">{job.job_type.replace(/_/g, ' ')}</span>
                          <Badge variant={
                            job.status === 'completed' ? 'default' :
                            job.status === 'failed' ? 'destructive' :
                            job.status === 'processing' ? 'secondary' :
                            'outline'
                          }>
                            {job.status}
                          </Badge>
                          {job.priority > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Priority: {job.priority}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Created: {new Date(job.created_at).toLocaleString()}
                          {job.started_at && ` • Started: ${new Date(job.started_at).toLocaleString()}`}
                          {job.completed_at && ` • Completed: ${new Date(job.completed_at).toLocaleString()}`}
                          {job.processing_time_ms && ` • ${job.processing_time_ms}ms`}
                        </div>
                        {job.last_error && (
                          <div className="text-sm text-red-600 mt-1">
                            Error: {job.last_error}
                          </div>
                        )}
                        {job.attempts > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Attempts: {job.attempts}/{job.max_attempts}
                            {job.next_retry_at && ` • Next retry: ${new Date(job.next_retry_at).toLocaleString()}`}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {job.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelJob(job.id)}
                            disabled={actionLoading}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </TabsContent>

        {/* Subscriptions Section */}
        <TabsContent value="subscriptions">
        <div className="space-y-6">
          {/* Header with filters and create button */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Subscriptions</CardTitle>
                  <CardDescription>Manage subscriptions across all organizations</CardDescription>
                </div>
                <Dialog open={showCreateSubDialog} onOpenChange={(open) => {
                  setShowCreateSubDialog(open);
                  if (!open) {
                    // Reset form when dialog closes
                    setSubFormData({
                      user_id: '',
                      organization_id: '',
                      subscription_tier: 'limited',
                      status: 'trialing',
                      plan_id: 'trial_7_day',
                      base_monthly_limit: 100
                    });
                    setOrgProviders([]);
                  }
                }}>
                  <Button onClick={() => setShowCreateSubDialog(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Create Subscription
                  </Button>
                  <DialogContent>
                    <form onSubmit={handleCreateSubscription}>
                      <DialogHeader>
                        <DialogTitle>Create Subscription</DialogTitle>
                        <DialogDescription>
                          Select an organization, then choose a provider to create a subscription
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="organization_id">Organization</Label>
                          <Select
                            name="organization_id"
                            value={subFormData.organization_id}
                            onValueChange={handleOrgSelectForSubscription}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select organization..." />
                            </SelectTrigger>
                            <SelectContent>
                              {organizations.map((org) => (
                                <SelectItem key={org.id} value={org.id}>
                                  {org.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="user_id">Provider</Label>
                          <Select
                            name="user_id"
                            value={subFormData.user_id}
                            onValueChange={(value) => setSubFormData({ ...subFormData, user_id: value })}
                            disabled={!subFormData.organization_id || loadingProviders}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={
                                loadingProviders
                                  ? "Loading providers..."
                                  : !subFormData.organization_id
                                    ? "Select organization first"
                                    : orgProviders.length === 0
                                      ? "No providers found"
                                      : "Select provider..."
                              } />
                            </SelectTrigger>
                            <SelectContent>
                              {orgProviders.map((provider) => (
                                <SelectItem key={provider.uid} value={provider.uid}>
                                  {provider.first_name} {provider.last_name} ({provider.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {loadingProviders && (
                            <p className="text-xs text-muted-foreground">
                              <Loader2 className="h-3 w-3 inline animate-spin mr-1" />
                              Loading providers...
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subscription_tier">Tier</Label>
                          <Select
                            name="subscription_tier"
                            value={subFormData.subscription_tier}
                            onValueChange={(value) => {
                              // Auto-set plan_id and base_monthly_limit based on tier
                              const updates = {
                                subscription_tier: value,
                                base_monthly_limit: value === 'unlimited' ? 750 : 100,
                                plan_id: subFormData.status === 'trialing' ? 'trial_7_day' : `${value}_monthly`
                              };
                              setSubFormData({ ...subFormData, ...updates });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="limited">Limited (100 notes/month - $99)</SelectItem>
                              <SelectItem value="unlimited">Unlimited (750 notes/month - $129)</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Monthly limit: {subFormData.base_monthly_limit} notes
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            name="status"
                            value={subFormData.status}
                            onValueChange={(value) => {
                              // Update plan_id when status changes
                              const plan_id = value === 'trialing' ? 'trial_7_day' : `${subFormData.subscription_tier}_monthly`;
                              setSubFormData({ ...subFormData, status: value, plan_id });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="trialing">Trialing (7-day trial)</SelectItem>
                              <SelectItem value="active">Active (Paid)</SelectItem>
                              <SelectItem value="canceled">Canceled</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Plan: {subFormData.plan_id}
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowCreateSubDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={actionLoading}>
                          {actionLoading ? 'Creating...' : 'Create Subscription'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4 flex-wrap">
                <Select value={subStatusFilter} onValueChange={setSubStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="trialing">Trialing</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="scheduled_change">Scheduled Change</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={subTierFilter} onValueChange={setSubTierFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="limited">Limited</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={subOrgFilter} onValueChange={setSubOrgFilter}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Organizations</SelectItem>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={loadSubscriptions} variant="outline">
                  <Search className="h-4 w-4 mr-1" />
                  Filter
                </Button>
              </div>

              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : subscriptions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No subscriptions found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Add-ons</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {sub.user_first_name} {sub.user_last_name}
                            </div>
                            <div className="text-xs text-muted-foreground">{sub.user_email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{sub.organization_name || sub.organization_id}</TableCell>
                        <TableCell>
                          <Badge variant={sub.subscription_tier === 'unlimited' ? 'default' : 'secondary'}>
                            {sub.subscription_tier}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            sub.status === 'active' ? 'default' :
                            sub.status === 'trialing' ? 'secondary' :
                            sub.status === 'canceled' ? 'destructive' :
                            'outline'
                          }>
                            {sub.status}
                          </Badge>
                          {sub.cancel_at_period_end && (
                            <div className="text-xs text-orange-600 mt-1">Cancels at period end</div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>{sub.notes_used_this_month} / {sub.base_monthly_limit}</div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {sub.addon_notes_remaining > 0 ? (
                            <Badge variant="outline">{sub.addon_notes_remaining} notes</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenEditSubscription(sub)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenAddAddon(sub)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            {sub.status !== 'canceled' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleCancelSubscription(sub.id, false)}
                                disabled={actionLoading}
                              >
                                Cancel
                              </Button>
                            )}
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

        {/* Edit Subscription Dialog */}
        <Dialog open={showEditSubDialog} onOpenChange={setShowEditSubDialog}>
          <DialogContent>
            <form onSubmit={handleUpdateSubscription}>
              <DialogHeader>
                <DialogTitle>Edit Subscription</DialogTitle>
                <DialogDescription>
                  Update subscription details for {selectedSubscription?.user_email}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_tier">Tier</Label>
                  <Select
                    name="edit_tier"
                    value={editSubFormData.subscription_tier}
                    onValueChange={(value) => setEditSubFormData({ ...editSubFormData, subscription_tier: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="limited">Limited (100 notes)</SelectItem>
                      <SelectItem value="unlimited">Unlimited (750 notes)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_status">Status</Label>
                  <Select
                    name="edit_status"
                    value={editSubFormData.status}
                    onValueChange={(value) => setEditSubFormData({ ...editSubFormData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trialing">Trialing</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_base_limit">Base Monthly Limit</Label>
                  <Input
                    id="edit_base_limit"
                    name="edit_base_limit"
                    type="number"
                    value={editSubFormData.base_monthly_limit}
                    onChange={(e) => setEditSubFormData({ ...editSubFormData, base_monthly_limit: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_addon_remaining">Add-on Notes Remaining</Label>
                  <Input
                    id="edit_addon_remaining"
                    name="edit_addon_remaining"
                    type="number"
                    value={editSubFormData.addon_notes_remaining}
                    onChange={(e) => setEditSubFormData({ ...editSubFormData, addon_notes_remaining: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_notes_used">Notes Used This Month</Label>
                  <Input
                    id="edit_notes_used"
                    name="edit_notes_used"
                    type="number"
                    value={editSubFormData.notes_used_this_month}
                    onChange={(e) => setEditSubFormData({ ...editSubFormData, notes_used_this_month: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditSubDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={actionLoading}>
                  {actionLoading ? 'Updating...' : 'Update Subscription'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Addon Dialog */}
        <Dialog open={showAddAddonDialog} onOpenChange={setShowAddAddonDialog}>
          <DialogContent>
            <form onSubmit={handleCreateAddon}>
              <DialogHeader>
                <DialogTitle>Add Addon Notes</DialogTitle>
                <DialogDescription>
                  Grant complimentary addon notes to {selectedSubscription?.user_email}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="notes_purchased">Notes to Add</Label>
                  <Input
                    id="notes_purchased"
                    name="notes_purchased"
                    type="number"
                    value={addonFormData.notes_purchased}
                    onChange={(e) => setAddonFormData({ ...addonFormData, notes_purchased: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_paid_cents">Price (cents)</Label>
                  <Input
                    id="price_paid_cents"
                    name="price_paid_cents"
                    type="number"
                    value={addonFormData.price_paid_cents}
                    onChange={(e) => setAddonFormData({ ...addonFormData, price_paid_cents: parseInt(e.target.value) })}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    For complimentary notes, use $0. Default is $4900 (=$49.00)
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddAddonDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={actionLoading}>
                  {actionLoading ? 'Creating...' : 'Add Addon'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </TabsContent>

        {/* Error Logs Section */}
        <TabsContent value="error-logs">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Error Logs</CardTitle>
                <CardDescription>
                  Review critical system errors with extensive debug information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex gap-4 mb-4 flex-wrap">
                  <Select
                    value={errorLogsFilter.resolved === undefined ? 'all' : errorLogsFilter.resolved ? 'resolved' : 'unresolved'}
                    onValueChange={(value) => {
                      if (value === 'all') {
                        const { resolved, ...rest } = errorLogsFilter;
                        setErrorLogsFilter(rest);
                      } else {
                        setErrorLogsFilter({ ...errorLogsFilter, resolved: value === 'resolved' });
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="unresolved">Unresolved</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={errorLogsFilter.severity || 'all'}
                    onValueChange={(value) => {
                      if (value === 'all') {
                        const { severity, ...rest } = errorLogsFilter;
                        setErrorLogsFilter(rest);
                      } else {
                        setErrorLogsFilter({ ...errorLogsFilter, severity: value });
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={async () => {
                      setErrorLogsLoading(true);
                      try {
                        const params = new URLSearchParams();
                        if (errorLogsFilter.resolved !== undefined) {
                          params.append('resolved', errorLogsFilter.resolved.toString());
                        }
                        if (errorLogsFilter.severity) {
                          params.append('severity', errorLogsFilter.severity);
                        }
                        if (errorLogsFilter.error_type) {
                          params.append('error_type', errorLogsFilter.error_type);
                        }
                        params.append('limit', '50');
                        params.append('offset', '0');
                        const response = await apiGet(`/super-admin/error-logs?${params.toString()}`) as { logs?: any[]; total?: number };
                        setErrorLogs(response.logs || []);
                        setErrorLogsTotal(response.total || 0);
                      } catch (error) {
                        logger.error('Failed to fetch error logs', error);
                      } finally {
                        setErrorLogsLoading(false);
                      }
                    }}
                    disabled={errorLogsLoading}
                  >
                    {errorLogsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
                  </Button>
                </div>

                {/* Error Logs Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Severity</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {errorLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            {errorLogsLoading ? 'Loading...' : 'No error logs found'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        errorLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              <Badge
                                variant={
                                  log.severity === 'critical'
                                    ? 'destructive'
                                    : log.severity === 'error'
                                    ? 'destructive'
                                    : 'secondary'
                                }
                              >
                                {log.severity}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{log.error_type}</TableCell>
                            <TableCell className="max-w-md truncate">{log.title}</TableCell>
                            <TableCell>
                              {new Date(log.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {log.resolved_at ? (
                                <Badge variant="outline" className="text-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Resolved
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-orange-600">
                                  Unresolved
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedErrorLog(log);
                                  setShowErrorLogDialog(true);
                                }}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {errorLogsTotal > errorLogs.length && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Showing {errorLogs.length} of {errorLogsTotal} error logs
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Error Log Detail Dialog */}
            <Dialog open={showErrorLogDialog} onOpenChange={setShowErrorLogDialog}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              {selectedErrorLog && (
                <>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      {selectedErrorLog.title}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedErrorLog.error_type} • {new Date(selectedErrorLog.created_at).toLocaleString()}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Severity and Status */}
                    <div className="flex gap-4">
                      <Badge
                        variant={
                          selectedErrorLog.severity === 'critical'
                            ? 'destructive'
                            : selectedErrorLog.severity === 'error'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {selectedErrorLog.severity}
                      </Badge>
                      {selectedErrorLog.resolved_at ? (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolved {new Date(selectedErrorLog.resolved_at).toLocaleString()}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-orange-600">
                          Unresolved
                        </Badge>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <Label className="text-sm font-semibold">Message</Label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{selectedErrorLog.message}</p>
                    </div>

                    {/* Log Links */}
                    {selectedErrorLog.log_links && selectedErrorLog.log_links.length > 0 && (
                      <div>
                        <Label className="text-sm font-semibold">Log Links</Label>
                        <div className="space-y-2 mt-1">
                          {selectedErrorLog.log_links.map((link: any, idx: number) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                              {link.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Context */}
                    {selectedErrorLog.context && Object.keys(selectedErrorLog.context).length > 0 && (
                      <div>
                        <Label className="text-sm font-semibold">Context</Label>
                        <pre className="text-xs bg-muted p-3 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(selectedErrorLog.context, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Debug Info */}
                    {selectedErrorLog.debug_info && Object.keys(selectedErrorLog.debug_info).length > 0 && (
                      <div>
                        <Label className="text-sm font-semibold">Debug Information</Label>
                        <pre className="text-xs bg-muted p-3 rounded mt-1 overflow-x-auto max-h-96">
                          {JSON.stringify(selectedErrorLog.debug_info, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Resolution Notes */}
                    {selectedErrorLog.resolution_notes && (
                      <div>
                        <Label className="text-sm font-semibold">Resolution Notes</Label>
                        <p className="text-sm mt-1 whitespace-pre-wrap">{selectedErrorLog.resolution_notes}</p>
                      </div>
                    )}

                    {/* Resolve Button */}
                    {!selectedErrorLog.resolved_at && (
                      <div className="space-y-2">
                        <Label htmlFor="resolve_notes">Resolution Notes (optional)</Label>
                        <textarea
                          id="resolve_notes"
                          className="w-full min-h-[100px] p-2 border rounded"
                          value={resolveNotes}
                          onChange={(e) => setResolveNotes(e.target.value)}
                          placeholder="Add notes about how this error was resolved..."
                        />
                        <Button
                          onClick={async () => {
                            try {
                              await apiPatch(`/super-admin/error-logs/${selectedErrorLog.id}/resolve`, {
                                resolution_notes: resolveNotes || undefined,
                              });
                              setShowErrorLogDialog(false);
                              setResolveNotes('');
                              // Refresh error logs
                              const params = new URLSearchParams();
                              if (errorLogsFilter.resolved !== undefined) {
                                params.append('resolved', errorLogsFilter.resolved.toString());
                              }
                              if (errorLogsFilter.severity) {
                                params.append('severity', errorLogsFilter.severity);
                              }
                              params.append('limit', '50');
                              params.append('offset', '0');
                              const response = await apiGet(`/super-admin/error-logs?${params.toString()}`) as { logs?: any[]; total?: number };
                              setErrorLogs(response.logs || []);
                              setErrorLogsTotal(response.total || 0);
                            } catch (error) {
                              logger.error('Failed to resolve error log', error);
                            }
                          }}
                        >
                          Mark as Resolved
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

      </Tabs>
    </AppLayout>
  );
}
