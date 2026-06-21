import logging
from fastapi import WebSocket

logger = logging.getLogger("websocket_manager")

class ConnectionManager:
    def __init__(self):
        # Maps chat_id (int) -> List[WebSocket]
        self.active_visitors: dict[int, list[WebSocket]] = {}
        # List of admin WebSockets
        self.active_admins: list[WebSocket] = []
        # Explicit dict to track online status
        self.online_status: dict[int, bool] = {}

    async def connect_visitor(self, chat_id: int, websocket: WebSocket):
        await websocket.accept()
        if chat_id not in self.active_visitors:
            self.active_visitors[chat_id] = []
        self.active_visitors[chat_id].append(websocket)
        self.online_status[chat_id] = True
        logger.info(f"Visitor connected to chat {chat_id}. online=true")

    def disconnect_visitor(self, chat_id: int, websocket: WebSocket):
        if chat_id in self.active_visitors:
            if websocket in self.active_visitors[chat_id]:
                self.active_visitors[chat_id].remove(websocket)
            if not self.active_visitors[chat_id]:
                del self.active_visitors[chat_id]
                self.online_status[chat_id] = False
                logger.info(f"All visitors disconnected from chat {chat_id}. online=false")

    async def connect_admin(self, websocket: WebSocket):
        await websocket.accept()
        self.active_admins.append(websocket)
        logger.info(f"Admin connected. Total admins: {len(self.active_admins)}")

    def disconnect_admin(self, websocket: WebSocket):
        if websocket in self.active_admins:
            self.active_admins.remove(websocket)
            logger.info("Admin disconnected.")

    def is_visitor_connected(self, chat_id: int) -> bool:
        return self.online_status.get(chat_id, False)

    async def send_to_chat(self, chat_id: int, message: dict):
        """Send message to a specific chat and broadcast to all admins"""
        targets = self.active_visitors.get(chat_id, [])
        for connection in targets[:]:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to visitor in chat {chat_id}: {e}")
                
        for admin in self.active_admins[:]:
            try:
                await admin.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting message to admin from chat {chat_id}: {e}")

    async def broadcast_to_admins(self, message: dict):
        """Send message to all admins only"""
        for admin in self.active_admins[:]:
            try:
                await admin.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting message to admin: {e}")

manager = ConnectionManager()
