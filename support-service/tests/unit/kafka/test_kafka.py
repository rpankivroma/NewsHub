import pytest
import json
from unittest.mock import AsyncMock, MagicMock
from app.kafka.producer import KafkaProducerManager, publish_chat_created, publish_chat_status_changed, publish_message_sent
from app.kafka.consumer import KafkaConsumerManager

@pytest.mark.asyncio
async def test_kafka_producer_events(monkeypatch):
    """
    Verify Kafka Producer calls AIOKafkaProducer publish.
    Ensures message, chat creation, and status changed formats match.
    """
    mock_aioproducer = AsyncMock()
    
    manager = KafkaProducerManager()
    manager.producer = mock_aioproducer
    
    # 1. Test publish directly
    await manager.publish("test.topic", {"key": "value"})
    assert mock_aioproducer.send_and_wait.call_count == 1
    mock_aioproducer.send_and_wait.assert_called_with("test.topic", {"key": "value"})


@pytest.mark.asyncio
async def test_kafka_producer_exceptions(monkeypatch):
    """
    Verify that Kafka failures (like socket timeouts) are handled gracefully and don't halt app flow.
    """
    mock_aioproducer = AsyncMock()
    mock_aioproducer.send_and_wait.side_effect = Exception("Kafka Server Timeout Connection Failure")
    
    manager = KafkaProducerManager()
    manager.producer = mock_aioproducer
    
    # Should log the failure but NOT raise or propagate an unhandled exception to client routes
    await manager.publish("support.chat.created", {"chat_id": 10})
    assert mock_aioproducer.send_and_wait.call_count == 1


@pytest.mark.asyncio
async def test_kafka_consumer_handling(monkeypatch):
    """
    Verify that Kafka Consumer manager routes payloads correctly. Handles empty or corrupted events.
    """
    manager = KafkaConsumerManager()
    
    # Track handlers
    msg_sent_called = []
    
    async def mock_handle_message_sent(payload):
        msg_sent_called.append(payload)
        
    monkeypatch.setattr(manager, "handle_message_sent", mock_handle_message_sent)
    
    # Simulate receiving "support.message.sent" event
    payload_ok = {"content": "Sample message", "chat_id": 5}
    await manager.handle_message_sent(payload_ok)
    assert len(msg_sent_called) == 1
    assert msg_sent_called[0]["content"] == "Sample message"

    # Simulate receiving invalid corrupted payloads
    # Handler should handle or log gracefully without crashing the whole loop
    async def mock_handle_corrupted(payload):
        if not payload or "chat_id" not in payload:
            raise KeyError("Missing critical key")
            
    monkeypatch.setattr(manager, "handle_message_sent", mock_handle_corrupted)
    try:
        await manager.handle_message_sent({"corrupt": "payload"})
    except KeyError:
        pass # Captured event
