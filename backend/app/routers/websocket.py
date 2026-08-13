from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.ws_manager import ws_manager
from app.database import SessionLocal
from app.services import meeting_service

router = APIRouter(prefix="/api/ws", tags=["websocket"])


async def _handle_disconnect(clean_id: str, websocket: WebSocket):
    meta = ws_manager.disconnect(clean_id, websocket)
    user_id = meta.get("user_id")
    participant_id = meta.get("participant_id")
    display_name = meta.get("display_name")

    if user_id or participant_id or display_name:
        db = SessionLocal()
        try:
            meeting_service.mark_participant_left_by_ws(
                db,
                clean_id,
                user_id=user_id,
                participant_id=participant_id,
                display_name=display_name
            )
        finally:
            db.close()

        await ws_manager.broadcast(clean_id, {
            "event": "participant_left",
            "user_id": user_id,
            "participant_id": participant_id,
            "display_name": display_name,
            "sender_id": user_id or display_name
        })


@router.websocket("/meetings/{meeting_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    meeting_id: str,
    user_id: Optional[str] = None,
    participant_id: Optional[str] = None,
    display_name: Optional[str] = None
):
    clean_id = meeting_id.replace("-", "").strip()
    init_meta = {
        "user_id": user_id,
        "participant_id": participant_id,
        "display_name": display_name,
    }
    await ws_manager.connect(clean_id, websocket, meta=init_meta)
    try:
        while True:
            data = await websocket.receive_json()
            if isinstance(data, dict):
                # Update connection metadata if user_joined or message contains user credentials
                if data.get("event") == "user_joined":
                    ws_manager.set_metadata(websocket, {
                        "user_id": data.get("user_id") or data.get("sender_id") or user_id,
                        "participant_id": data.get("participant_id") or participant_id,
                        "display_name": data.get("sender_name") or display_name,
                    })
                elif data.get("event") == "user_left":
                    # Instant leave notification from frontend beforeunload
                    await _handle_disconnect(clean_id, websocket)
                    break

                if "event" in data:
                    await ws_manager.broadcast(clean_id, data)
    except WebSocketDisconnect:
        await _handle_disconnect(clean_id, websocket)
    except Exception:
        await _handle_disconnect(clean_id, websocket)
