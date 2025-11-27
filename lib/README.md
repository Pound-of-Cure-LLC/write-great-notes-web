# Frontend Library Documentation

This directory contains core frontend utilities, API clients, and data-fetching hooks for the Write Great Notes application.

## Table of Contents

- [SWR Cache Strategy](#swr-cache-strategy)
- [Why SWR?](#why-swr)
- [API Client](#api-client)
- [Custom Hooks](#custom-hooks)
- [Best Practices](#best-practices)

---

## SWR Cache Strategy

### Overview

We use [SWR (stale-while-revalidate)](https://swr.vercel.app/) for all data fetching in the frontend. SWR is a React Hooks library that provides:

- **Automatic caching** with localStorage persistence
- **Background revalidation** for fresh data
- **Request deduplication** to prevent duplicate API calls
- **Optimistic UI updates** for better UX
- **Error recovery** with automatic retry

### How It Works

#### 1. Cache-First Strategy

```typescript
// User navigates to appointments page
const { data, isLoading, error } = useAppointments(currentDate, providerIds, locationIds);

// What happens:
// 1. Check cache → serve immediately if available (instant page load)
// 2. Fetch from API in background → update cache
// 3. Re-render with fresh data if changed
```

#### 2. Prefetching for Performance

The appointments page uses **±2 day prefetching** for instant calendar navigation:

```typescript
usePrefetchAppointments(currentDate, providerIds, locationIds, {
  enabled: true,
  delay: 500,
  maxCacheDays: 10
});

// When viewing Nov 3:
// - Automatically fetches Nov 1, 2, 4, 5 in background
// - Stores in cache for instant access
// - User clicks "next day" → instant load (no API call)
```

**Prefetch Order (Closest First):**
1. currentDate + 1 (tomorrow)
2. currentDate - 1 (yesterday)
3. currentDate + 2
4. currentDate - 2

#### 3. Cache Eviction Strategy

To prevent unbounded cache growth, we enforce a **10-day maximum**:

```typescript
// Algorithm:
// 1. Calculate distance from currently selected date
// 2. Remove dates furthest from selection
// 3. Tie-breaker: remove earlier dates first

// Example: User on Nov 3, cache has 12 days
// Keep: Nov 1, 2, 3, 4, 5 (closest 5 days)
// Keep: Nov 6, 7, 8, 9, 10 (next 5 days)
// Evict: Oct 30, 31 (furthest from Nov 3)
```

#### 4. localStorage Persistence

The cache persists across page reloads and browser sessions:

**Persistence Triggers:**
- **On cache update** (debounced 1 second)
- **On visibility change** (user switches tabs)
- **Periodic backup** (every 30 seconds)
- **On beforeunload** (tab close)

**Storage Format:**
```json
[
  ["/appointments?start_date=2025-11-03&...", {
    "data": [...],
    "timestamp": 1762226388659
  }],
  ["/appointments?start_date=2025-11-04&...", {
    "data": [...],
    "timestamp": 1762226388659
  }]
]
```

**Why This Format?**
- Only stores `data` and `timestamp`, not entire SWR state
- Avoids serializing non-serializable objects (Promises, functions)
- Keeps localStorage usage minimal (~5-10KB for 10 days)

#### 5. Cache Invalidation

After CRUD operations (create/update/delete appointments), we invalidate **current date ± 2 days**:

```typescript
// User deletes appointment on Nov 3
await apiDelete(`/appointments/${id}`);

// Invalidates cache for:
// - Nov 1, 2, 3, 4, 5
// - Forces fresh fetch on next access
```

**Why ±2 days?**
- User might create appointment for tomorrow while viewing today
- Ensures nearby dates are always fresh after changes
- Balances freshness vs performance

---

## Why SWR?

### The Problem We're Solving

**Without caching:**
```typescript
// Every navigation = 5 API calls
// Nov 3 → Nov 4: Fetch Nov 2, 3, 4, 5, 6
// Nov 4 → Nov 5: Fetch Nov 3, 4, 5, 6, 7
// Nov 5 → Nov 4: Fetch Nov 2, 3, 4, 5, 6 (again!)

// Result:
// - Slow page loads (2-3 second wait)
// - Wasted bandwidth (fetching same data repeatedly)
// - Poor UX (loading spinners everywhere)
```

**With SWR caching:**
```typescript
// First load: Fetch current + ±2 days (5 API calls)
// Nov 3 → Nov 4: Instant (cached)
// Nov 4 → Nov 5: Instant (cached)
// Nov 5 → Nov 6: Instant (cached)

// Result:
// - Instant page loads (~50ms from cache)
// - 80% reduction in API calls
// - Smooth UX (no loading spinners)
```

### SWR vs Alternatives

| Feature | SWR | React Query | Redux + RTK Query | Custom Solution |
|---------|-----|-------------|-------------------|-----------------|
| Bundle Size | 4.5KB | 13KB | 45KB (with Redux) | Varies |
| Built-in Persistence | ✅ (custom) | ❌ (plugin needed) | ✅ | Must implement |
| Request Deduplication | ✅ | ✅ | ✅ | Must implement |
| Background Revalidation | ✅ | ✅ | ⚠️ (limited) | Must implement |
| TypeScript Support | ✅ | ✅ | ✅ | Must implement |
| Learning Curve | Low | Medium | High | N/A |
| Maintenance Burden | Low | Low | High | Very High |

**Why we chose SWR:**
1. **Lightweight** - 4.5KB vs 13KB+ for alternatives
2. **Simple API** - Minimal boilerplate compared to Redux
3. **Built for Next.js** - Created by Vercel, optimized for Next.js
4. **Flexible caching** - Easy to implement custom persistence
5. **Production-ready** - Used by Vercel, Netflix, GitHub

---

## API Client

### `api-client.ts`

Centralized API client with automatic authentication:

```typescript
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api-client';

// Automatically includes:
// - Authorization: Bearer <token>
// - X-Timezone: <user timezone>
// - Error handling (401 → redirect to login)
// - EMR configuration error modal
```

**Key Features:**
- Auto-inject JWT token from Supabase session
- Auto-redirect on 401 Unauthorized
- Handle 403 Forbidden (organization_required)
- Handle 503 EMR configuration errors
- Timezone header for all requests

**Usage:**
```typescript
// GET request
const appointments = await apiGet<{ appointments: Appointment[] }>(
  '/appointments?start_date=2025-11-03&end_date=2025-11-03'
);

// POST request
const newAppointment = await apiPost<Appointment>('/appointments', {
  patient_id: '123',
  appointment_datetime: '2025-11-03T09:00:00Z',
});

// PATCH request
await apiPatch(`/appointments/${id}`, { status: 'completed' });

// DELETE request
await apiDelete(`/appointments/${id}`);
```

---

## Custom Hooks

### `use-appointments.ts`

Data fetching and caching for appointments:

#### `useAppointments(date, providerIds, locationIds)`

Fetches appointments for a specific date with caching:

```typescript
const { data, isLoading, error, mutate } = useAppointments(
  new Date(2025, 10, 3),  // Nov 3, 2025
  ['provider-id-1'],
  ['location-id-1']
);

// Cache key format:
// /appointments?start_date=2025-11-03&end_date=2025-11-03&provider_ids=provider-id-1&location_ids=location-id-1
```

**Configuration:**
- **Deduplication**: 5 minutes (prevents duplicate requests)
- **Revalidate on focus**: Disabled (prevents unnecessary refetches)
- **Revalidate on reconnect**: Disabled
- **Keep previous data**: Enabled (smooth transitions)

#### `usePrefetchAppointments(date, providerIds, locationIds, options)`

Prefetches ±2 days for instant calendar navigation:

```typescript
const { isPrefetching } = usePrefetchAppointments(
  currentDate,
  selectedProviderIds,
  selectedLocationIds,
  {
    enabled: true,        // Enable prefetching
    delay: 500,           // Wait 500ms before starting
    maxCacheDays: 10      // Keep max 10 days in cache
  }
);
```

**Features:**
- Smart cache eviction (keeps closest 10 days)
- AbortController support (cancels on date change)
- Only prefetches uncached dates
- 500ms delay between requests (prevents rate limiting)

#### `getAppointmentsKey(date, providerIds, locationIds)`

Generates consistent cache keys:

```typescript
const key = getAppointmentsKey(
  new Date(2025, 10, 3),
  ['provider-1', 'provider-2'],
  ['location-1']
);

// Returns:
// /appointments?start_date=2025-11-03&end_date=2025-11-03&provider_ids=provider-1,provider-2&location_ids=location-1

// Key features:
// - IDs sorted alphabetically (prevents duplicate keys)
// - Date normalized to local midnight (prevents timezone bugs)
// - Matches actual API endpoint format
```

### `use-providers.ts`

Fetches providers and locations with long-term caching:

```typescript
const { data: providers } = useProviders();
const { data: locations } = useLocations();

// Cached for 60 minutes (rarely changes)
```

---

## Best Practices

### ✅ DO: Use SWR for All Data Fetching

```typescript
// ✅ GOOD: Using SWR hook
const { data, error, isLoading } = useAppointments(date, providerIds, locationIds);

// ❌ BAD: Direct fetch in useEffect
useEffect(() => {
  fetch('/api/appointments')
    .then(res => res.json())
    .then(setAppointments);
}, []);
```

### ✅ DO: Generate Consistent Cache Keys

```typescript
// ✅ GOOD: Use helper function, sort IDs
const key = getAppointmentsKey(date, providerIds.sort(), locationIds.sort());

// ❌ BAD: Manual cache key, unsorted IDs
const key = `/appointments?provider_ids=${providerIds.join(',')}&location_ids=${locationIds.join(',')}`;
// Problem: Different order = different cache key = cache miss
```

### ✅ DO: Invalidate Cache After Mutations

```typescript
// ✅ GOOD: Invalidate affected cache entries
await apiPost('/appointments', data);
await invalidateAppointmentsCache(); // Invalidates ±2 days

// ❌ BAD: No cache invalidation
await apiPost('/appointments', data);
// Problem: User navigates to tomorrow, doesn't see new appointment
```

### ✅ DO: Normalize Dates to Local Midnight

```typescript
// ✅ GOOD: Normalize to local midnight
const normalizeDate = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const key = getAppointmentsKey(normalizeDate(date), providerIds, locationIds);

// ❌ BAD: Using date with time component
const date = new Date('2025-11-03T15:30:00Z'); // 3:30 PM UTC
const key = `/appointments?date=${date.toISOString()}`;
// Problem: Timezone shifts create different dates (Nov 2 in PST!)
```

### ✅ DO: Use Prefetching for Predictable Navigation

```typescript
// ✅ GOOD: Prefetch ±2 days for calendar
usePrefetchAppointments(currentDate, providerIds, locationIds);

// ⚠️ CAREFUL: Don't prefetch unbounded data
// ❌ BAD: Prefetch entire month (30+ API calls)
for (let i = 1; i <= 31; i++) {
  useSWR(`/appointments?date=2025-11-${i}`);
}
```

### ✅ DO: Handle Loading and Error States

```typescript
// ✅ GOOD: Proper loading/error handling
const { data, error, isLoading } = useAppointments(date, providerIds, locationIds);

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <AppointmentsList appointments={data} />;

// ❌ BAD: Assuming data is always available
const { data } = useAppointments(date, providerIds, locationIds);
return <AppointmentsList appointments={data} />; // Crashes on error/loading
```

### ✅ DO: Use Optimistic Updates for Mutations

```typescript
// ✅ GOOD: Optimistic update + rollback on error
const { mutate } = useAppointments(date, providerIds, locationIds);

await mutate(
  async (currentData) => {
    // Optimistically update UI
    const newData = [...currentData, newAppointment];

    try {
      await apiPost('/appointments', newAppointment);
      return newData; // Success: keep optimistic update
    } catch (error) {
      return currentData; // Error: rollback to original
    }
  },
  { revalidate: false } // Don't refetch yet
);

// ❌ BAD: Update only after API response
await apiPost('/appointments', newAppointment);
await mutate(); // Slow: waits for API + refetch
```

### ⚠️ DON'T: Disable Cache Unless Necessary

```typescript
// ⚠️ CAREFUL: Only disable cache for real-time data
const { data } = useSWR('/appointments/live-status', fetcher, {
  refreshInterval: 1000, // Poll every second
  dedupingInterval: 0,   // No deduplication
});

// ✅ GOOD: Use cache for normal data
const { data } = useAppointments(date, providerIds, locationIds);
// Default: 5-minute deduplication, background revalidation
```

---

## Debugging

### Inspect SWR Cache (Browser Console)

```javascript
// View all cached entries
const cache = JSON.parse(localStorage.getItem('swr-cache') || '[]');
console.table(cache.map(([key, value]) => ({
  key: key.substring(0, 80),
  dataLength: value?.data?.length,
  timestamp: new Date(value?.timestamp).toLocaleString(),
})));

// Clear cache
localStorage.removeItem('swr-cache');
location.reload();
```

### Enable Debug Logging

SWR persistence logs are controlled by browser console level:

```javascript
// In browser DevTools → Console → Default levels
// Set to "Verbose" to see:
// - [SWR] Cache set: ...
// - [SWR] Cache persisted: X entries
// - [SWR] Restored cache from localStorage: X entries
```

### Common Issues

**Problem: Cache not persisting**
- Check localStorage quota (5-10MB limit)
- Check browser privacy settings (incognito mode blocks localStorage)
- Check console for `[SWR] Failed to persist cache` errors

**Problem: Stale data after CRUD**
- Verify `invalidateAppointmentsCache()` is called after mutations
- Check if ±2 day cache invalidation is working
- Manually call `mutate(key)` to force revalidation

**Problem: Excessive API calls**
- Check deduplication interval (should be 5 minutes for appointments)
- Verify prefetch logic isn't duplicating requests
- Check if `revalidateOnFocus` is accidentally enabled

---

## Further Reading

- [SWR Documentation](https://swr.vercel.app/)
- [SWR Cache Persistence](https://swr.vercel.app/docs/advanced/cache)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [React Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

## File Reference

| File | Purpose |
|------|---------|
| `swr-config.ts` | Global SWR configuration with localStorage persistence |
| `use-appointments.ts` | Appointments data fetching + ±2 day prefetch |
| `use-providers.ts` | Providers/locations data fetching |
| `use-user-profile.ts` | User profile data fetching |
| `use-emr-connections.ts` | EMR connections data fetching |
| `api-client.ts` | Authenticated API client with auto error handling |
| `supabase/client.ts` | Supabase client initialization |

---

## Changelog

### 2025-11-03
- ✅ Fixed localStorage persistence (was not saving on SPA navigation)
- ✅ Fixed cache serialization (now stores only `{data, timestamp}`)
- ✅ Added cache invalidation for ±2 days on CRUD operations
- ✅ Added cleanup for orphaned cache keys from old implementation
- ✅ Added multiple persistence triggers (visibility change, periodic, debounced)

### 2025-10-23
- ✅ Implemented ±2 day prefetch strategy
- ✅ Added 10-day cache eviction policy
- ✅ Migrated from `?date=` to `?start_date=` cache key format
