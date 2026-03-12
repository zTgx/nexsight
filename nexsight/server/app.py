"""FastAPI server for NexSight GPU dashboard."""

import asyncio
import json
from pathlib import Path
from typing import Set
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from ..core.gpu import get_monitor


app = FastAPI(title="NexSight", description="Real-time GPU Intelligence")

# Connected WebSocket clients
connected_clients: Set[WebSocket] = set()

# Static files directory
STATIC_DIR = Path(__file__).parent / "webui" / "static"


@app.get("/")
async def index():
    """Serve the frontend dashboard."""
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {
        "message": "NexSight GPU Dashboard",
        "note": "Frontend not built. Run `npm run build` in frontend/ directory.",
    }


@app.get("/api/gpus")
async def get_gpus():
    """Get all GPU stats."""
    monitor = get_monitor()
    gpus = monitor.get_all_gpus()
    return {"gpus": gpus, "count": len(gpus)}


@app.get("/api/gpus/{gpu_id}")
async def get_gpu(gpu_id: int):
    """Get specific GPU stats."""
    monitor = get_monitor()
    gpu_info = monitor.get_gpu_info(gpu_id)
    return gpu_info


@app.get("/api/gpus/{gpu_id}/processes")
async def get_gpu_processes(gpu_id: int):
    """Get processes running on a GPU."""
    monitor = get_monitor()
    processes = monitor.get_gpu_processes(gpu_id)
    return {"gpu_id": gpu_id, "processes": processes}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time GPU updates."""
    await websocket.accept()
    connected_clients.add(websocket)

    try:
        monitor = get_monitor()

        while True:
            # Gather all data
            gpus = monitor.get_all_gpus()
            gpu_data = []

            for gpu in gpus:
                processes = monitor.get_gpu_processes(gpu["id"])
                gpu_data.append({
                    **gpu,
                    "processes": processes,
                })

            # Send to this client
            await websocket.send_text(json.dumps({
                "type": "gpu_update",
                "data": gpu_data,
            }))

            # Wait before next update
            await asyncio.sleep(1)

    except WebSocketDisconnect:
        connected_clients.remove(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        if websocket in connected_clients:
            connected_clients.remove(websocket)


def run_server(host: str = "127.0.0.1", port: int = 9988):
    """Run the server with uvicorn."""
    import uvicorn
    uvicorn.run(app, host=host, port=port, log_level="info")
