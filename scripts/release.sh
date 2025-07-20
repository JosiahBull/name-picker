#!/usr/bin/env bash

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate required environment variables
validate_env_var() {
    local var_name="$1"
    local var_value="${!var_name:-}"
    local var_description="$2"
    
    if [[ -z "$var_value" ]]; then
        print_error "Required environment variable $var_name is not set."
        print_info "Description: $var_description"
        print_info "Set it using: export $var_name=<value>"
        return 1
    fi
    return 0
}

# Function to validate all required secrets
validate_secrets() {
    local all_valid=true
    
    print_info "Validating required environment variables..."
    
    # Supabase secrets
    validate_env_var "SUPABASE_ACCESS_TOKEN" "Personal access token from https://app.supabase.com/account/tokens" || all_valid=false
    validate_env_var "SUPABASE_DB_PASSWORD" "Database password for the Supabase project" || all_valid=false
    validate_env_var "SUPABASE_PROJECT_ID" "Project ID from Supabase dashboard" || all_valid=false
    
    # Cloudflare secrets
    validate_env_var "CLOUDFLARE_API_TOKEN" "API token with Zone:Edit permissions from Cloudflare dashboard" || all_valid=false
    validate_env_var "CLOUDFLARE_ACCOUNT_ID" "Account ID from Cloudflare dashboard" || all_valid=false
    validate_env_var "CLOUDFLARE_PROJECT_NAME" "Name of your Cloudflare Pages project" || all_valid=false
    
    if [[ "$all_valid" == "false" ]]; then
        print_error "Missing required environment variables. Please set them and try again."
        exit 1
    fi
    
    print_success "All required environment variables are set."
}

# Function to check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    local missing_tools=()
    
    # Check for required tools
    command_exists "pnpm" || missing_tools+=("pnpm")
    command_exists "git" || missing_tools+=("git")
    command_exists "docker" || missing_tools+=("docker")
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        print_error "Missing required tools:"
        for tool in "${missing_tools[@]}"; do
            echo "  - $tool"
        done
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    print_success "All prerequisites are satisfied."
}

# Function to get the current version/tag
get_version() {
    echo "$GITHUB_REF_NAME"
}

# Function to build the project
build_project() {
    print_info "Building the project..."
    
    # Install dependencies if needed
    if [[ ! -d "node_modules" ]]; then
        print_info "Installing dependencies..."
        pnpm install --frozen-lockfile
    fi
    
    # Run type checking
    print_info "Running type check..."
    pnpm run typecheck
    
    # Build all packages
    print_info "Building all packages..."
    pnpm run build
    
    print_success "Project built successfully."
}

# Function to deploy to Supabase
deploy_supabase() {
    print_info "Deploying to Supabase..."
    
    # Login to Supabase
    print_info "Logging in to Supabase..."
    export SUPABASE_ACCESS_TOKEN
    
    # Link to the project if not already linked
    if [[ ! -f "supabase/.temp/project-ref" ]]; then
        print_info "Linking to Supabase project..."
        pnpm exec supabase link --project-ref "$SUPABASE_PROJECT_ID" --password "$SUPABASE_DB_PASSWORD"
    fi
    
    # Push database migrations
    print_info "Pushing database migrations..."
    pnpm exec supabase db push --password "$SUPABASE_DB_PASSWORD"
    
    # Deploy Edge Functions if they exist
    if [[ -d "supabase/functions" ]]; then
        print_info "Deploying Edge Functions..."
        pnpm exec supabase functions deploy
    fi
    
    print_success "Supabase deployment completed."
}

# Function to deploy to Cloudflare Pages
deploy_cloudflare() {
    print_info "Deploying to Cloudflare Pages..."
    
    local version=$(get_version)
    local dist_dir="packages/frontend/dist"
    
    # Check if dist directory exists
    if [[ ! -d "$dist_dir" ]]; then
        print_error "Build directory $dist_dir does not exist. Did the build fail?"
        exit 1
    fi
    
    # Trigger Cloudflare Pages deployment
    print_info "Triggering Cloudflare Pages deployment..."
    curl -sS --fail-with-body -o /dev/null -d "" "https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/$CLOUDFLARE_HOOK_ID"

    print_success "Cloudflare Pages deployment completed."
}

# Main deployment function
main() {
    print_info "Starting release process..."
    
    # Change to project root
    cd "$(dirname "$0")/.."
    
    # Validate environment
    check_prerequisites
    validate_secrets
    
    # Build the project
    build_project
    
    # Deploy to services
    deploy_supabase
    deploy_cloudflare
    
    local version=$(get_version)
    print_success "Release $version completed successfully!"
    
    # Print deployment URLs
    print_info "Deployment URLs:"
    print_info "  - Supabase: https://app.supabase.com/project/$SUPABASE_PROJECT_ID"
    print_info "  - Cloudflare: https://${CLOUDFLARE_PROJECT_NAME}.pages.dev"
}

# Run main function
main "$@"
