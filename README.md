# Name Picker 💕

[![CI](https://github.com/josiahbull/name-picker/actions/workflows/ci.yml/badge.svg)](https://github.com/josiahbull/name-picker/actions/workflows/ci.yml)
[![Security](https://github.com/josiahbull/name-picker/actions/workflows/security.yml/badge.svg)](https://github.com/josiahbull/name-picker/actions/workflows/security.yml)

**The fun way for couples to choose their last name together!**

Like Tinder, but for picking your perfect family name. Swipe through suggestions, find your matches, and discover the name you both love.

## ✨ Features

- 📱 **Swipe Interface** - Fun, intuitive swiping through name options
- 💝 **Couple Matching** - See which names you both liked
- 📊 **Analytics** - Track your preferences and decision patterns
- ⬆️ **Upload Names** - Add your own family names or suggestions
- 💾 **Progress Saved** - Never lose your place in the process

## 🚀 Quick Start

```bash
# 1. Setup development environment (requires Docker)
./scripts/dev-setup.sh

# 2. Start the app
pnpm dev

# 3. Open http://localhost:5173 and start swiping!
```

## 🎯 How It Works

1. **Pick Your Profile** - Choose between partner accounts (Joe/Sam)
2. **Start Swiping** - Swipe right ❤️ to like, left 👎 to pass
3. **Upload Names** - Add your own family or cultural name suggestions
4. **Find Matches** - See names you both loved
5. **Make Your Choice** - Pick your perfect family name together!

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development instructions.

## 🚢 Creating a Release

### For Local Development

1. **Set up environment variables** in your shell or `.env` file:
   ```bash
   # Supabase credentials
   export SUPABASE_ACCESS_TOKEN="your-token"      # Get from https://app.supabase.com/account/tokens
   export SUPABASE_DB_PASSWORD="your-password"    # Your database password
   export SUPABASE_PROJECT_ID="your-project-id"   # From Supabase dashboard
   
   # Cloudflare credentials
   export CLOUDFLARE_API_TOKEN="your-token"       # Create at Cloudflare dashboard with Zone:Edit permissions
   export CLOUDFLARE_ACCOUNT_ID="your-account-id" # From Cloudflare dashboard
   export CLOUDFLARE_PROJECT_NAME="name-picker"   # Your Cloudflare Pages project name
   ```

2. **Run the release script**:
   ```bash
   ./scripts/release.sh
   ```
   
   The script will:
   - Validate all prerequisites and secrets
   - Build and type-check the project
   - Deploy database migrations to Supabase
   - Deploy the frontend to Cloudflare Pages
   - Optionally create and push a new git tag

### For CI/CD (Automated Releases)

1. **Set up GitHub Secrets** in your repository settings:
   - `SUPABASE_ACCESS_TOKEN`
   - `SUPABASE_DB_PASSWORD`
   - `SUPABASE_PROJECT_ID`
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_PROJECT_NAME`

2. **Create a new release**:
   ```bash
   # Create and push a version tag
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```
   
   This will automatically trigger the release workflow that:
   - Builds the project
   - Deploys to Supabase and Cloudflare
   - Creates a GitHub Release with deployment status

3. **Manual trigger** (optional):
   - Go to Actions → Release workflow
   - Click "Run workflow"
   - Enter a version tag (e.g., `v1.0.0`)

### Release Workflow

The release process follows these steps:
1. **Validation** - Checks all required tools and secrets
2. **Build** - Compiles TypeScript and bundles the frontend
3. **Test** - Runs type checking
4. **Deploy Supabase** - Pushes database migrations and Edge Functions
5. **Deploy Cloudflare** - Uploads the frontend to Cloudflare Pages
6. **GitHub Release** - Creates a release with deployment status

### Troubleshooting

- **Missing secrets**: Check that all environment variables are set correctly
- **Docker not running**: Start Docker Desktop before running the script
- **Build failures**: Run `pnpm run typecheck` to identify issues
- **Deployment failures**: Check the GitHub Actions logs for detailed error messages

## 📝 License

MIT - see [LICENSE](LICENSE) for details.
