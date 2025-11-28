# CI/CD Pipeline Setup

This repository deploys to Google Cloud Run on GitHub releases.

## Deployment Trigger

**GitHub Release** → Deploys to **production** (`write-great-notes`)

## Required GitHub Secrets

Copy these secrets from the `write-great-notes` repository (Settings → Secrets and variables → Actions):

| Secret | Description |
|--------|-------------|
| `WORKLOAD_IDENTITY_PROVIDER_PROD` | Workload Identity Provider for prod |
| `SERVICE_ACCOUNT_EMAIL_PROD` | Service account email for prod |
| `BACKEND_URL_PROD` | Backend API URL for production |
| `SUPABASE_URL_PROD` | Supabase project URL for production |
| `SUPABASE_ANON_KEY_PROD` | Supabase anonymous key for production |

## One-Time Setup: Create Artifact Registry Repository

```powershell
gcloud artifacts repositories create write-great-notes-web --repository-format=docker --location=us-central1 --project=write-great-notes
```

## Creating a Release

1. Go to GitHub → Releases → "Create a new release"
2. Create a new tag (e.g., `v1.0.0`)
3. Fill in the release notes
4. Click "Publish release"
