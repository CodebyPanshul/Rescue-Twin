# Deploy Rescue Twin to GitHub Pages

Follow these steps to get your live link.

## 1. Set your Git identity (one-time, optional)

If you want your name and email on commits:

```powershell
cd c:\Users\om\rescue-twin
git config user.name "Your Full Name"
git config user.email "your-email@example.com"
```

## 2. Create the repo on GitHub

1. Go to **https://github.com/new**
2. **Repository name:** `rescue-twin` (or any name you like)
3. Leave it **empty** (no README, no .gitignore)
4. Click **Create repository**

## 3. Push your code

GitHub will show you commands. Use these (replace `YOUR_USERNAME` with your GitHub username):

```powershell
cd c:\Users\om\rescue-twin
git remote add origin https://github.com/YOUR_USERNAME/rescue-twin.git
git push -u origin main
```

If you used a different repo name, use that instead of `rescue-twin` in the URL.

## 4. Enable GitHub Pages

1. In your repo, go to **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Save

## 5. Wait for the first deploy

1. Go to the **Actions** tab
2. The workflow **Deploy to GitHub Pages** will run (triggered by your push)
3. When it finishes (green check), your site is live

## Your live URL

- If the repo is **rescue-twin**:  
  **https://YOUR_USERNAME.github.io/rescue-twin/**
- If you used another repo name, replace `rescue-twin` in the URL with that name.

## Optional: Connect the backend for simulations

Right now the live site shows the UI and map, but "Run Simulation" will fail because there’s no backend. To make simulations work:

1. Deploy the **backend** (FastAPI) somewhere, e.g.:
   - [Railway](https://railway.app)
   - [Render](https://render.com)
   - [Fly.io](https://fly.io)
2. In your GitHub repo: **Settings** → **Secrets and variables** → **Actions**
3. Under **Variables**, add:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-deployed-api-url.com` (no trailing slash)
4. Re-run the workflow: **Actions** → **Deploy to GitHub Pages** → **Run workflow**

The next deploy will use this URL and simulations will work.
