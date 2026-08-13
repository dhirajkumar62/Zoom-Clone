from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.ws_manager import ws_manager

router = APIRouter(prefix="/api/ws", tags=["websocket"])


@router.websocket("/meetings/{meeting_id}")
async def websocket_endpoint(websocket: WebSocket, meeting_id: str):
    clean_id = meeting_id.replace("-", "").strip()
    await ws_manager.connect(clean_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            if isinstance(data, dict) and "event" in data:
                await ws_manager.broadcast(clean_id, data)
    except WebSocketDisconnect:
        ws_manager.disconnect(clean_id, websocket)
    except Exception:
        ws_manager.disconnect(clean_id, websocket)
