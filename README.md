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

### Technical Highlights
- Real-time flood zone visualization with risk-based coloring
- Dynamic evacuation route calculation avoiding flooded roads
- AI confidence scoring and explainable recommendations
- Responsive design with dark theme emergency aesthetics

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

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
# Navigate to project
cd rescue-twin

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
cd backend
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd rescue-twin/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

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
