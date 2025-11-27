import { create } from 'zustand';
import { apiGet } from '@/lib/api-client';

export interface Capabilities {
  adapter_type: string;
  capabilities: string[];
}

interface CapabilitiesState {
  capabilities: Capabilities | null;
  isLoading: boolean;
  error: string | null;
  fetchCapabilities: () => Promise<void>;
  clearCapabilities: () => void;
  hasCapability: (capability: string) => boolean;
}

export const useCapabilitiesStore = create<CapabilitiesState>((set, get) => ({
  capabilities: null,
  isLoading: false,
  error: null,

  fetchCapabilities: async () => {
    set({ isLoading: true, error: null });

    try {
      // Add cache-busting timestamp to force fresh fetch
      const timestamp = new Date().getTime();
      const data = await apiGet<Capabilities>(`/organizations/me/capabilities?_t=${timestamp}`);
      set({ capabilities: data, isLoading: false });
    } catch (error) {
      // Silently fail - this is expected if user not fully authenticated yet
      set({ isLoading: false });
    }
  },

  clearCapabilities: () => {
    set({
      capabilities: { adapter_type: 'none', capabilities: [] },
      isLoading: false,
      error: 'EMR configuration required'
    });
  },

  hasCapability: (capability: string) => {
    const { capabilities } = get();
    if (!capabilities) return false;
    return capabilities.capabilities.includes(capability);
  },
}));
