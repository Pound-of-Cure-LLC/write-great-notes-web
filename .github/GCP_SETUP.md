# CI/CD Pipeline Setup

This repository deploys to Google Cloud Run on GitHub releases. This is a **marketing-only site** that redirects to `app.writegreatnotes.ai` for all authentication and app functionality.

## Deployment Trigger

**GitHub Release** → Deploys to **production** (`write-great-notes`)

## Required GitHub Secrets

These secrets should be configured in GitHub (Settings → Secrets and variables → Actions):

| Secret | Description |
|--------|-------------|
| `WORKLOAD_IDENTITY_PROVIDER_PROD` | `projects/458634709431/locations/global/workloadIdentityPools/github-pool/providers/github-provider` |
| `SERVICE_ACCOUNT_EMAIL_PROD` | `github-actions@write-great-notes.iam.gserviceaccount.com` |

That's it! No application secrets needed - this is a static marketing site.

## One-Time Setup: Create Artifact Registry Repository

```bash
gcloud artifacts repositories create write-great-notes-web --repository-format=docker --location=us-central1 --project=write-great-notes
```

## One-Time Setup: Add IAM Binding for This Repo

```bash
gcloud iam service-accounts add-iam-policy-binding "github-actions@write-great-notes.iam.gserviceaccount.com" \
  --project="write-great-notes" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/458634709431/locations/global/workloadIdentityPools/github-pool/attribute.repository/Pound-of-Cure-LLC/write-great-notes-web"
```

## Creating a Release

1. Go to GitHub → Releases → "Create a new release"
2. Create a new tag (e.g., `v1.0.0`)
3. Fill in the release notes
4. Click "Publish release"
