"""
Start script for Render (and other hosts that set PORT).
Reads PORT from the environment and runs uvicorn so --port always has a value.
"""
import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "10000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
