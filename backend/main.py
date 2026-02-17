"""
Rescue Twin - AI-Powered Disaster Digital Twin
FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS, APP_TITLE, APP_DESCRIPTION, APP_VERSION
from routers import health, simulation, districts, intelligence, resources

app = FastAPI(
    title=APP_TITLE,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(simulation.router)
app.include_router(districts.router)
app.include_router(intelligence.router)
app.include_router(resources.router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
