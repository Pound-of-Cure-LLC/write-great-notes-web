# CI/CD Pipeline Setup

This repository deploys to Google Cloud Run using GitHub Actions.

## Deployment Triggers

- **Push to `master`** → Deploys to **development** environment (`write-great-notes-dev-474317`)
- **GitHub Release** → Deploys to **production** environment (`write-great-notes`)

## Required GitHub Secrets

Copy these secrets from the `write-great-notes` repository (Settings → Secrets and variables → Actions):

### GCP Authentication (already configured)
| Secret | Description |
|--------|-------------|
| `WORKLOAD_IDENTITY_PROVIDER_DEV` | Workload Identity Provider for dev |
| `WORKLOAD_IDENTITY_PROVIDER_PROD` | Workload Identity Provider for prod |
| `SERVICE_ACCOUNT_EMAIL_DEV` | Service account email for dev |
| `SERVICE_ACCOUNT_EMAIL_PROD` | Service account email for prod |

### Application Secrets
| Secret | Description |
|--------|-------------|
| `BACKEND_URL_DEV` | Backend API URL for development |
| `BACKEND_URL_PROD` | Backend API URL for production |
| `SUPABASE_URL_DEV` | Supabase project URL for development |
| `SUPABASE_URL_PROD` | Supabase project URL for production |
| `SUPABASE_ANON_KEY_DEV` | Supabase anonymous key for development |
| `SUPABASE_ANON_KEY_PROD` | Supabase anonymous key for production |

## Creating the Artifact Registry Repository

Before the first deployment, create the Artifact Registry repository:

```bash
# For dev environment
gcloud artifacts repositories create write-great-notes-web \
  --repository-format=docker \
  --location=us-central1 \
  --project=write-great-notes-dev-474317

# For prod environment
gcloud artifacts repositories create write-great-notes-web \
  --repository-format=docker \
  --location=us-central1 \
  --project=write-great-notes
```

## Creating a Release

1. Go to GitHub → Releases → "Create a new release"
2. Create a new tag (e.g., `v1.0.0`)
3. Fill in the release notes
4. Click "Publish release"

The workflow will automatically build and deploy to **production**.
