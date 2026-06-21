import pytest
from unittest.mock import AsyncMock, MagicMock
from app.websocket.manager import ConnectionManager

@pytest.mark.asyncio
async def test_ws_manager_visitor_lifecycle():
    """
    Verify connecting and disconnecting visitors, and check is_visitor_connected flags.
    """
    manager = ConnectionManager()
    
    # Create web socket mock
    mock_ws = AsyncMock()
    
    chat_id = 42
    
    # 1. Connect
    await manager.connect_visitor(chat_id, mock_ws)
    assert manager.is_visitor_connected(chat_id) is True
    assert mock_ws in manager.active_visitors[chat_id]
    assert mock_ws.accept.call_count == 1
    
    # 2. Duplicate connection (test multiple WS clients in same chat)
    mock_ws2 = AsyncMock()
    await manager.connect_visitor(chat_id, mock_ws2)
    assert manager.is_visitor_connected(chat_id) is True
    assert len(manager.active_visitors[chat_id]) == 2
    
    # 3. Disconnect one
    manager.disconnect_visitor(chat_id, mock_ws)
    assert manager.is_visitor_connected(chat_id) is True
    assert len(manager.active_visitors[chat_id]) == 1
    
    # 4. Disconnect all
    manager.disconnect_visitor(chat_id, mock_ws2)
    assert manager.is_visitor_connected(chat_id) is False
    assert chat_id not in manager.active_visitors


@pytest.mark.asyncio
async def test_ws_manager_admin_lifecycle():
    """
    Verify connecting and disconnecting admins, and check total active counts.
    """
    manager = ConnectionManager()
    
    mock_ws = AsyncMock()
    
    # 1. Connect Admin
    await manager.connect_admin(mock_ws)
    assert mock_ws in manager.active_admins
    assert len(manager.active_admins) == 1
    assert mock_ws.accept.call_count == 1
    
    # 2. Disconnect Admin
    manager.disconnect_admin(mock_ws)
    assert mock_ws not in manager.active_admins
    assert len(manager.active_admins) == 0


@pytest.mark.asyncio
async def test_ws_manager_broadcast_sends():
    """
    Test broadcast to visitor socket and admins.
    """
    manager = ConnectionManager()
    
    mock_vis = AsyncMock()
    mock_adm = AsyncMock()
    
    await manager.connect_visitor(123, mock_vis)
    await manager.connect_admin(mock_adm)
    
    payload = {"event": "support.message.sent", "data": {"content": "Hello!"}}
    await manager.send_to_chat(123, payload)
    
    # Both visitor and admin should receive the event
    assert mock_vis.send_json.call_count == 1
    assert mock_adm.send_json.call_count == 1
    
    mock_vis.send_json.assert_called_with(payload)
    mock_adm.send_json.assert_called_with(payload)
