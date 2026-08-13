from typing import Dict, List, Any
from fastapi import WebSocket


class ConnectionManager:
    """Manages active WebSocket connections grouped by meeting_id."""

    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.metadata: Dict[WebSocket, Dict[str, Any]] = {}

    async def connect(self, meeting_id: str, websocket: WebSocket, meta: Dict[str, Any] = None):
        await websocket.accept()
        if meeting_id not in self.active_connections:
            self.active_connections[meeting_id] = []
        self.active_connections[meeting_id].append(websocket)
        if meta:
            self.metadata[websocket] = meta
        else:
            self.metadata[websocket] = {}

    def set_metadata(self, websocket: WebSocket, meta: Dict[str, Any]):
        if websocket in self.metadata:
            self.metadata[websocket].update(meta)
        else:
            self.metadata[websocket] = meta

    def disconnect(self, meeting_id: str, websocket: WebSocket) -> Dict[str, Any]:
        meta = self.metadata.pop(websocket, {})
        if meeting_id in self.active_connections:
            if websocket in self.active_connections[meeting_id]:
                self.active_connections[meeting_id].remove(websocket)
            if not self.active_connections[meeting_id]:
                del self.active_connections[meeting_id]
        return meta

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
