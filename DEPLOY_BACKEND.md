# Deploy the backend so others can use the app on their phones

The **frontend** can be hosted on GitHub Pages for free. The **backend** (simulations, API) must run on a server. This guide uses **Render** (free tier) so you get a public API URL. Then anyone can open your GitHub Pages link on their phone and run simulations.

---

## 1. Push your project to GitHub

If you haven’t already:

1. Create a new repo at https://github.com/new (e.g. name: `rescue-twin`).
2. In your project folder:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/rescue-twin.git
   git push -u origin main
   ```
3. In the repo: **Settings** → **Pages** → set **Source** to **GitHub Actions**.  
   Your site will be at: **https://YOUR_USERNAME.github.io/rescue-twin/**

---

## 2. Deploy the backend on Render (free)

1. Go to **https://render.com** and sign up (GitHub login is fine).

2. **New** → **Web Service**.

3. Connect your **rescue-twin** repo (or paste the repo URL).

4. Configure the service:
   - **Name:** `rescue-twin-api` (or any name).
   - **Region:** choose the closest to you.
   - **Root Directory:** leave empty (Render uses repo root).
   - **Runtime:** **Python 3**.
   - **Build Command:**
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command:**
     ```bash
     cd backend && python start_render.py
     ```
     (Uses `backend/start_render.py`, which reads `PORT` from the environment so `--port` always gets a value. Render sets `PORT` automatically.)

5. **Advanced** → **Add Environment Variable**:
   - Key: `ALLOW_ANY_ORIGIN`  
   - Value: `1`  
   (So the frontend on GitHub Pages can call this API from any browser/phone.)

6. Click **Create Web Service**. Wait for the first deploy (a few minutes).

7. Copy your service URL, e.g. **https://rescue-twin-api.onrender.com** (no trailing slash).  
   This is your **backend / API URL**.

---

## 3. Tell the frontend where the API is

1. In your GitHub repo: **Settings** → **Secrets and variables** → **Actions**.
2. Under **Variables** → **New repository variable**:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** your Render URL, e.g. `https://rescue-twin-api.onrender.com` (no trailing slash).
3. Save.

4. Trigger a new deploy of the frontend: **Actions** → **Deploy to GitHub Pages** → **Run workflow**.  
   When it finishes, the site will use your deployed API.

---

## 4. Share the link with others

Your app is now:

- **Frontend (website):** https://YOUR_USERNAME.github.io/rescue-twin/
- **Backend (API):** https://your-app.onrender.com (they don’t need to open this)

**Share this link with anyone:**  
**https://YOUR_USERNAME.github.io/rescue-twin/**

They can open it on their **phone** (or any device), no PC and no same network needed. Simulations will work because the backend runs on Render.

---

## Notes

- **Render free tier:** The service may spin down after 15 minutes of no use; the first request after that can take 30–60 seconds to wake it. After that it’s fast.
- **CORS:** `ALLOW_ANY_ORIGIN=1` lets any website call your API. For a public demo that’s fine. To restrict to your GitHub Pages only, remove that variable and set `CORS_ORIGINS` to `https://YOUR_USERNAME.github.io` instead (and adjust backend code to read it if needed).

---

## Other hosts (optional)

You can deploy the backend elsewhere and use that URL as `NEXT_PUBLIC_API_URL`:

- **Railway:** New project → Deploy from GitHub → set root to repo, add `requirements.txt`, start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`. Add env `ALLOW_ANY_ORIGIN=1`.
- **Fly.io:** Use `fly launch` in the repo and point the start command to run `uvicorn backend.main:app --host 0.0.0.0 --port 8080` (or the port Fly gives you).

The important part is: the app must be reachable at a public URL and accept requests from your GitHub Pages origin (we use `ALLOW_ANY_ORIGIN=1` for simplicity).
