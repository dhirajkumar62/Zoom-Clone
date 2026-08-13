from typing import Dict, List, Any
from fastapi import WebSocket


class ConnectionManager:
    """Manages active WebSocket connections grouped by meeting_id."""

    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, meeting_id: str, websocket: WebSocket):
        await websocket.accept()
        if meeting_id not in self.active_connections:
            self.active_connections[meeting_id] = []
        self.active_connections[meeting_id].append(websocket)

    def disconnect(self, meeting_id: str, websocket: WebSocket):
        if meeting_id in self.active_connections:
            if websocket in self.active_connections[meeting_id]:
                self.active_connections[meeting_id].remove(websocket)
            if not self.active_connections[meeting_id]:
                del self.active_connections[meeting_id]

    async def broadcast(self, meeting_id: str, message: Dict[str, Any]):
        """Broadcasts a JSON message to all WebSocket connections in a meeting room."""
        if meeting_id in self.active_connections:
            disconnected = []
            for connection in list(self.active_connections[meeting_id]):
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.append(connection)
            for conn in disconnected:
                self.disconnect(meeting_id, conn)


ws_manager = ConnectionManager()
