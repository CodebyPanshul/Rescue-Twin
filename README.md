# 🌊 Rescue Twin - AI-Powered Disaster Digital Twin

An intelligent disaster simulation and response planning system that models flood scenarios, calculates risk zones, and recommends evacuation routes using AI-driven analysis.

![Rescue Twin](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-green.svg)
![React](https://img.shields.io/badge/react-18.2-61DAFB.svg)
![FastAPI](https://img.shields.io/badge/fastapi-0.109+-009688.svg)

## 🎯 Features

### Core Capabilities
- **Interactive Map Dashboard** - OpenStreetMap-based visualization with toggleable layers
- **Flood Simulation Engine** - Physics-based risk calculation with weighted scoring
- **Evacuation Routing** - Dijkstra's algorithm for optimal escape routes
- **Decision Intelligence Panel** - Real-time metrics and AI recommendations
- **What-If Scenario Tool** - Adjust parameters and compare outcomes
- **Ethical AI Layer** - Transparent methodology with human override

### Mobile & smartphone
- **Responsive layout** – Simulation page stacks map and controls on small screens; map stays on top with scrollable controls below.
- **Touch-friendly** – Large tap targets (48px), no hover-only actions.
- **Mobile menu** – Hamburger menu in the header for Home / Simulation / About on phones.
- **Add to Home Screen** – Use your browser’s “Add to Home Screen” (or “Install app”) so you can open Rescue Twin like an app. A web app manifest is included.

### Technical Highlights
- Real-time flood zone visualization with risk-based coloring
- Dynamic evacuation route calculation avoiding flooded roads
- AI confidence scoring and explainable recommendations
- Responsive design with dark theme emergency aesthetics
- **Copy report** – Copy simulation summary to clipboard for sharing
- **Print report** – Open a print-friendly report in a new window
- **Fullscreen map** – Toggle sidebar to expand the map (toolbar button)
- **Keyboard shortcut** – `Ctrl+Enter` (or `Cmd+Enter`) to run simulation
- **Last run on home** – Home page shows your most recent simulation with a quick link back

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ MapComponent│  │ ControlPanel │  │  DecisionPanel    │  │
│  │  (Leaflet)  │  │  (Controls)  │  │  (AI Insights)    │  │
│  └──────┬──────┘  └──────┬───────┘  └─────────┬─────────┘  │
│         └────────────────┼────────────────────┘            │
│                          │ Axios                            │
└──────────────────────────┼──────────────────────────────────┘
                           │ REST API
┌──────────────────────────┼──────────────────────────────────┐
│                        Backend                               │
│  ┌─────────────┐  ┌──────┴───────┐  ┌───────────────────┐  │
│  │ simulation  │  │   main.py    │  │    routing.py     │  │
│  │    .py      │◄─┤  (FastAPI)   │──►│   (NetworkX)      │  │
│  │ (Risk Calc) │  │              │  │   (Dijkstra)      │  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
│                          │                                   │
│                    ┌─────┴─────┐                            │
│                    │ districts │                            │
│                    │   .json   │                            │
│                    └───────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

## 🔬 Flood Risk Model

The simulation uses a weighted scoring formula:

```
Flood Risk Score = (0.5 × Rainfall Factor) + (0.3 × Elevation Factor) + (0.2 × Drainage Factor)
```

Where:
- **Rainfall Factor** = Normalized rainfall intensity (0-1)
- **Elevation Factor** = Inverse of terrain elevation (lower = higher risk)
- **Drainage Factor** = Inverse of drainage capacity (poor drainage = higher risk)

### Risk Classification
| Score | Level | Color |
|-------|-------|-------|
| ≥ 0.7 | High | Red |
| 0.4-0.7 | Medium | Orange |
| 0.2-0.4 | Low | Yellow |
| < 0.2 | Safe | Green |

## 📤 Sharing this folder with someone else

If you **zip the folder** or **copy it** for another person (or they clone the repo):

- **Don’t include** `node_modules`, `venv`, or `frontend\out` — they’re large and machine-specific. If you use Git, they’re already ignored.
- **The other person needs to run setup once**, then they can start the app like you.

**On their machine (one-time):**

1. Install **Python 3.9+** and **Node.js 18+** first (from python.org and nodejs.org).  
   SETUP.bat does not install these — it only installs the project’s dependencies.
2. Open the project folder and **double-click `SETUP.bat`** (Windows).  
   Or in a terminal: run the commands in “First-time setup” below.
3. After setup finishes, **double-click `start.bat`** or run **`npm start`** to start the app.

Then open **http://localhost:3000** in the browser. It will work the same as on your machine.

---

## 🌐 Share with others – use on any phone (no PC, no same network)

To let **other people** use the app **only on their phones** (no PC, any network):

1. **Put the app on the internet:** deploy the **frontend** to GitHub Pages and the **backend** to a free host (e.g. Render).
2. **Connect them** by setting the backend URL in GitHub (one variable).
3. **Share one link** (your GitHub Pages URL). Anyone opens it on their phone and can run simulations.

**Step-by-step:** see **[DEPLOY_BACKEND.md](DEPLOY_BACKEND.md)**. Summary:

| Step | What to do |
|------|------------|
| 1 | Push the project to GitHub and turn on GitHub Pages (Actions). |
| 2 | Deploy the backend on [Render](https://render.com) (free): Web Service, Python, start command `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`, add env `ALLOW_ANY_ORIGIN=1`. |
| 3 | In the repo: **Settings** → **Actions** → **Variables** → add `NEXT_PUBLIC_API_URL` = your Render URL. Re-run the “Deploy to GitHub Pages” workflow. |
| 4 | Share **https://YOUR_USERNAME.github.io/rescue-twin/** with anyone. They open it on their phone and use the app. |

No PC and no same Wi‑Fi needed for them.

---

## 📱 Use on your phone (same Wi‑Fi as your PC)

You can use Rescue Twin on your phone while it runs on your PC—no need to deploy to GitHub.

1. **Start the app on your PC**  
   Double-click **`start.bat`** (or run **`npm start`**). Keep the window open.

2. **Same Wi‑Fi**  
   Connect your **phone and PC to the same Wi‑Fi network**.

3. **Find your PC’s IP address**  
   - On the PC, open a **new** Command Prompt or PowerShell.
   - Run: **`ipconfig`**
   - Under your **Wi‑Fi adapter** (e.g. “Wireless LAN adapter Wi-Fi”), find **IPv4 Address** (e.g. `192.168.1.5`).

4. **Open the app on your phone**  
   In your phone’s browser, go to:  
   **`http://YOUR_PC_IP:3000`**  
   Example: **`http://192.168.1.5:3000`**

5. Use the app as usual (simulations, map, etc.). The backend runs on your PC, so everything works.

**Tip:** When you run `start.bat`, the frontend may also print a **“Network”** URL (e.g. `http://192.168.1.5:3000`). You can use that same address on your phone.

**If the phone can’t connect:** Windows Firewall may be blocking port 3000. When prompted, allow Node.js or “Private networks” access, or add an inbound rule for TCP port 3000.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### One-step start (easiest)

**First-time setup** (once per machine):

| Windows (easiest) | Or manually (any OS) |
|-------------------|----------------------|
| Double-click **`SETUP.bat`** | See commands below |

```bash
# Install Python dependencies (backend)
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt

# Install Node dependencies (frontend + root helper)
cd rescue-twin
npm run install:all
```

**Start the whole app in one step:**

| Option | Command |
|--------|--------|
| **Windows (double-click)** | Double-click **`start.bat`** in the project folder |
| **Any OS (one terminal)** | From project root: **`npm start`** |

- Backend API: `http://localhost:8000`
- Website: **`http://localhost:3000`** — open this in your browser

---

### Manual start (two terminals)

If you prefer to run backend and frontend separately:

**Terminal 1 – Backend:**
```bash
cd rescue-twin
venv\Scripts\activate
cd backend && python main.py
```

**Terminal 2 – Frontend:**
```bash
cd rescue-twin/frontend
npm run dev
```

## 📡 API Endpoints

### Health Check
```
GET /health
```
Returns server status and readiness.

### Run Flood Simulation
```
GET /simulate-flood?intensity=high&rainfall=100
```
Parameters:
- `intensity`: low | medium | high (default: medium)
- `rainfall`: Optional override in mm/hour

Response includes:
- Flood zones with risk scores
- Affected population estimates
- Evacuation routes
- Emergency resource requirements
- AI explanation and confidence score

### Get Districts
```
GET /districts
```
Returns all district and shelter data without simulation.

## 🎮 Usage Guide

1. **Start the Application**
   - Ensure both backend and frontend are running
   - Open `http://localhost:5173` in your browser

2. **Run a Simulation**
   - Select severity level (Low/Medium/High)
   - Optionally set custom rainfall for "What-If" analysis
   - Click "Run Simulation"

3. **Explore Results**
   - Click on flood zones to see detailed risk breakdown
   - Toggle layers (Flood Zones, Routes, Shelters)
   - Review Decision Intelligence panel for recommendations

4. **Demo Mode**
   - Click "Demo: High Severity Flood" for an instant demonstration

## 🗂 Project Structure

```
rescue-twin/
├── backend/
│   ├── main.py           # FastAPI application
│   ├── simulation.py     # Flood risk calculation engine
│   ├── routing.py        # Evacuation pathfinding
│   ├── models.py         # Pydantic data models
│   └── data/
│       └── districts.json # Synthetic city data
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Main application component
│   │   ├── components/
│   │   │   ├── MapComponent.jsx    # Leaflet map
│   │   │   ├── ControlPanel.jsx    # Simulation controls
│   │   │   └── DecisionPanel.jsx   # AI insights
│   │   └── services/
│   │       └── api.js    # Backend API client
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── requirements.txt
└── README.md
```

## 🔧 Configuration

### Environment Variables

**Frontend** (`.env.local` or env in CI):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BASE_PATH=              # Leave empty for root; use /repo-name for GitHub Pages project site
```

**Backend**: Configure CORS origins in `main.py` for production.

## 🚢 Deployment

### GitHub Pages (Live site)

The frontend is set up for **static export** and can be deployed to GitHub Pages with one click:

1. **Push the repo to GitHub** (if not already).
2. **Enable GitHub Pages**: Repo → **Settings** → **Pages** → under **Build and deployment**, set **Source** to **GitHub Actions**.
3. **Trigger deploy**: Push to `main` (or run the workflow manually: **Actions** → **Deploy to GitHub Pages** → **Run workflow**).

Your site will be live at:
`https://<your-username>.github.io/<repo-name>/`

**Optional – use a live backend:**  
If you host the FastAPI backend somewhere (e.g. Railway, Render), set the API URL in the workflow or in repo **Settings** → **Secrets and variables** → **Actions**:
- Add a repository variable: `NEXT_PUBLIC_API_URL` = `https://your-api.example.com`  
Then in `.github/workflows/deploy-pages.yml`, add under the "Build for GitHub Pages" step:
```yaml
NEXT_PUBLIC_API_URL: ${{ vars.NEXT_PUBLIC_API_URL }}
```
(If unset, the app still works; it will show "Backend Offline" until you point it to an API.)

### Production Build (local / other hosts)

**Frontend:**
```bash
cd frontend
npm run build
# Static output in frontend/out/ (ready for any static host)
```

**Backend:**
```bash
# Use Gunicorn for production
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Docker (Optional)

Create a `Dockerfile` for containerized deployment:

```dockerfile
# Backend
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🔮 Future Improvements

- [ ] **Fire Simulation** - Add wildfire spread modeling
- [ ] **Real-time Data** - Integration with weather APIs
- [ ] **Multi-city Support** - Load different city configurations
- [ ] **Simulation Playback** - Animate flood progression over time
- [ ] **Mobile App** - React Native version for field use
- [ ] **Real DEM Data** - Import actual elevation models
- [ ] **Historical Analysis** - Compare with past disasters

## 🤝 Ethical AI Principles

This system implements responsible AI practices:

1. **Transparency** - All calculations are explainable
2. **Confidence Scoring** - AI acknowledges uncertainty
3. **Human Override** - Decision-makers retain final authority
4. **No Personal Data** - System operates on aggregate data only
5. **Limitations Disclosed** - Known constraints are documented

## 📄 License

MIT License - See LICENSE file for details.

## 🙏 Acknowledgments

- OpenStreetMap for map tiles
- Leaflet.js for mapping
- NetworkX for graph algorithms
- FastAPI for the backend framework

---

**Built for hackathon demonstration purposes. Not intended for actual emergency response without proper validation and certification.**
