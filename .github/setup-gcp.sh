#!/bin/bash

# GCP Setup Script for Write Great Notes Web CI/CD
# Run this script to set up all required GCP resources

set -e

# Configuration
PROJECT_ID="write-great-notes"
REGION="us-central1"
POOL_NAME="github-actions-pool"
PROVIDER_NAME="github-provider"
SERVICE_ACCOUNT_NAME="github-actions-deployer"
REPOSITORY_NAME="write-great-notes-web"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}GCP Setup for Write Great Notes Web${NC}"
echo -e "${YELLOW}========================================${NC}"

# Check if GITHUB_REPO is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide your GitHub repository path${NC}"
    echo "Usage: ./setup-gcp.sh YOUR_GITHUB_ORG/YOUR_REPO_NAME"
    echo "Example: ./setup-gcp.sh myorg/write-great-notes-web"
    exit 1
fi

GITHUB_REPO="$1"
echo -e "\n${GREEN}Setting up CI/CD for repository: ${GITHUB_REPO}${NC}\n"

# Set project
echo -e "${YELLOW}[1/8] Setting GCP project...${NC}"
gcloud config set project ${PROJECT_ID}

# Enable APIs
echo -e "${YELLOW}[2/8] Enabling required APIs...${NC}"
gcloud services enable \
    artifactregistry.googleapis.com \
    run.googleapis.com \
    iam.googleapis.com \
    cloudresourcemanager.googleapis.com \
    iamcredentials.googleapis.com

# Create Artifact Registry repository
echo -e "${YELLOW}[3/8] Creating Artifact Registry repository...${NC}"
if gcloud artifacts repositories describe ${REPOSITORY_NAME} --location=${REGION} &>/dev/null; then
    echo "Repository already exists, skipping..."
else
    gcloud artifacts repositories create ${REPOSITORY_NAME} \
        --repository-format=docker \
        --location=${REGION} \
        --description="Docker images for Write Great Notes Web"
fi

# Create Workload Identity Pool
echo -e "${YELLOW}[4/8] Creating Workload Identity Pool...${NC}"
if gcloud iam workload-identity-pools describe ${POOL_NAME} --location=global &>/dev/null; then
    echo "Pool already exists, skipping..."
else
    gcloud iam workload-identity-pools create ${POOL_NAME} \
        --project="${PROJECT_ID}" \
        --location="global" \
        --display-name="GitHub Actions Pool"
fi

# Create Workload Identity Provider
echo -e "${YELLOW}[5/8] Creating Workload Identity Provider...${NC}"
if gcloud iam workload-identity-pools providers describe ${PROVIDER_NAME} --location=global --workload-identity-pool=${POOL_NAME} &>/dev/null; then
    echo "Provider already exists, skipping..."
else
    gcloud iam workload-identity-pools providers create-oidc ${PROVIDER_NAME} \
        --project="${PROJECT_ID}" \
        --location="global" \
        --workload-identity-pool="${POOL_NAME}" \
        --display-name="GitHub Provider" \
        --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
        --issuer-uri="https://token.actions.githubusercontent.com"
fi

# Create Service Account
echo -e "${YELLOW}[6/8] Creating Service Account...${NC}"
SERVICE_ACCOUNT="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
if gcloud iam service-accounts describe ${SERVICE_ACCOUNT} &>/dev/null; then
    echo "Service account already exists, skipping..."
else
    gcloud iam service-accounts create ${SERVICE_ACCOUNT_NAME} \
        --display-name="GitHub Actions Deployer" \
        --description="Service account for GitHub Actions CI/CD"
fi

# Grant permissions
echo -e "${YELLOW}[7/8] Granting IAM permissions...${NC}"
for ROLE in "roles/artifactregistry.writer" "roles/run.admin" "roles/iam.serviceAccountUser"; do
    echo "  Granting ${ROLE}..."
    gcloud projects add-iam-policy-binding ${PROJECT_ID} \
        --member="serviceAccount:${SERVICE_ACCOUNT}" \
        --role="${ROLE}" \
        --quiet
done

# Allow GitHub to impersonate the service account
echo -e "${YELLOW}[8/8] Configuring Workload Identity Federation...${NC}"
PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)')
gcloud iam service-accounts add-iam-policy-binding ${SERVICE_ACCOUNT} \
    --project="${PROJECT_ID}" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/attribute.repository/${GITHUB_REPO}" \
    --quiet

# Get the provider name
WIF_PROVIDER=$(gcloud iam workload-identity-pools providers describe ${PROVIDER_NAME} \
    --project="${PROJECT_ID}" \
    --location="global" \
    --workload-identity-pool="${POOL_NAME}" \
    --format="value(name)")

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nAdd these secrets to your GitHub repository:"
echo -e "(Settings → Secrets and variables → Actions → New repository secret)"
echo -e "\n${YELLOW}WIF_PROVIDER:${NC}"
echo "${WIF_PROVIDER}"
echo -e "\n${YELLOW}WIF_SERVICE_ACCOUNT:${NC}"
echo "${SERVICE_ACCOUNT}"
echo -e "\n${YELLOW}Also add these application secrets:${NC}"
echo "- NEXT_PUBLIC_API_URL"
echo "- NEXT_PUBLIC_SUPABASE_URL"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"

