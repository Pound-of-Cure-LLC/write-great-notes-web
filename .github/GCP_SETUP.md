# GCP Setup for CI/CD Pipeline

This guide walks you through setting up the Google Cloud resources needed for the GitHub Actions CI/CD pipeline.

## Prerequisites

- Google Cloud CLI (`gcloud`) installed and authenticated
- Owner or Editor access to the `write-great-notes` GCP project
- GitHub repository admin access

## 1. Enable Required APIs

```bash
gcloud config set project write-great-notes

gcloud services enable \
  artifactregistry.googleapis.com \
  run.googleapis.com \
  iam.googleapis.com \
  cloudresourcemanager.googleapis.com \
  iamcredentials.googleapis.com
```

## 2. Create Artifact Registry Repository

```bash
gcloud artifacts repositories create write-great-notes-web \
  --repository-format=docker \
  --location=us-central1 \
  --description="Docker images for Write Great Notes Web"
```

## 3. Set Up Workload Identity Federation

Workload Identity Federation allows GitHub Actions to authenticate with GCP without using service account keys.

### Create a Workload Identity Pool

```bash
gcloud iam workload-identity-pools create "github-actions-pool" \
  --project="write-great-notes" \
  --location="global" \
  --display-name="GitHub Actions Pool"
```

### Create a Workload Identity Provider

Replace `YOUR_GITHUB_ORG` and `YOUR_REPO_NAME` with your GitHub organization/username and repository name:

```bash
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="write-great-notes" \
  --location="global" \
  --workload-identity-pool="github-actions-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --issuer-uri="https://token.actions.githubusercontent.com"
```

### Create a Service Account

```bash
gcloud iam service-accounts create github-actions-deployer \
  --display-name="GitHub Actions Deployer" \
  --description="Service account for GitHub Actions CI/CD"
```

### Grant Required Permissions to the Service Account

```bash
PROJECT_ID="write-great-notes"
SERVICE_ACCOUNT="github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com"

# Artifact Registry Writer (to push images)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/artifactregistry.writer"

# Cloud Run Admin (to deploy services)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/run.admin"

# Service Account User (to act as service accounts)
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/iam.serviceAccountUser"
```

### Allow GitHub Actions to Impersonate the Service Account

Replace `YOUR_GITHUB_ORG/YOUR_REPO_NAME` with your actual GitHub repository path:

```bash
PROJECT_ID="write-great-notes"
SERVICE_ACCOUNT="github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com"
GITHUB_REPO="YOUR_GITHUB_ORG/YOUR_REPO_NAME"

gcloud iam service-accounts add-iam-policy-binding ${SERVICE_ACCOUNT} \
  --project="${PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/${GITHUB_REPO}"
```

## 4. Get the Workload Identity Provider Resource Name

```bash
gcloud iam workload-identity-pools providers describe github-provider \
  --project="write-great-notes" \
  --location="global" \
  --workload-identity-pool="github-actions-pool" \
  --format="value(name)"
```

This will output something like:
```
projects/123456789/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider
```

## 5. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

| Secret Name | Value |
|-------------|-------|
| `WIF_PROVIDER` | The full provider name from step 4 (e.g., `projects/123456789/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider`) |
| `WIF_SERVICE_ACCOUNT` | `github-actions-deployer@write-great-notes.iam.gserviceaccount.com` |
| `NEXT_PUBLIC_API_URL` | Your API URL (e.g., `https://api.writegreatnotes.com`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## 6. Create Your First Release

Once all secrets are configured, create a release on GitHub:

1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Create a new tag (e.g., `v1.0.0`)
4. Fill in the release title and description
5. Click "Publish release"

The GitHub Action will automatically:
1. Build the Docker image with the release tag
2. Push it to Artifact Registry
3. Deploy to Cloud Run

## Troubleshooting

### Permission Denied Errors

Make sure all IAM bindings are correctly set:
```bash
gcloud projects get-iam-policy write-great-notes \
  --format='table(bindings.role,bindings.members)' \
  --filter="bindings.members:github-actions-deployer"
```

### Workload Identity Issues

Verify the workload identity pool is correctly configured:
```bash
gcloud iam workload-identity-pools describe github-actions-pool \
  --project="write-great-notes" \
  --location="global"
```

### Check Cloud Run Logs

```bash
gcloud run services logs read write-great-notes-web --region=us-central1 --limit=50
```

