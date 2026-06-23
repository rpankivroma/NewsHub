import os
import json
import logging
import asyncio
from typing import Optional
from aiokafka import AIOKafkaProducer
from ..config import settings
from .ssl_helper import get_kafka_ssl_context

logger = logging.getLogger("kafka_producer")

class KafkaProducerManager:
    def __init__(self):
        self.producer = None
        self._temp_files = []
        self._lock = asyncio.Lock()

    async def start(self):
        async with self._lock:
            if self.producer is not None:
                return
            bootstrap_servers = settings.KAFKA_BOOTSTRAP_SERVERS or "localhost:9092"
            logger.info(f"Initializing Kafka Producer with bootstrap servers: {bootstrap_servers}")
            try:
                ssl_context, temp_files = get_kafka_ssl_context()
                self._temp_files = temp_files
                
                kwargs = {
                    "bootstrap_servers": bootstrap_servers,
                    "value_serializer": lambda v: json.dumps(v).encode('utf-8')
                }
                
                if ssl_context:
                    kwargs["security_protocol"] = "SSL"
                    kwargs["ssl_context"] = ssl_context
                    logger.info("Kafka Producer SSL context applied.")

                self.producer = AIOKafkaProducer(**kwargs)
                await self.producer.start()
                logger.info("Kafka Producer started successfully.")
            except Exception as e:
                logger.error(f"Failed to start Kafka Producer: {e}")
                self.producer = None
                self._cleanup_temp_files()

    def _cleanup_temp_files(self):
        for path in self._temp_files:
            try:
                if os.path.exists(path):
                    os.remove(path)
                    logger.info(f"Cleaned up temporary cert file: {path}")
            except Exception as ex:
                logger.warning(f"Failed to clean up temporary cert file {path}: {ex}")
        self._temp_files = []

    async def stop(self):
        async with self._lock:
            if self.producer:
                try:
                    await self.producer.stop()
                    logger.info("Kafka Producer stopped.")
                except Exception as e:
                    logger.error(f"Error stopping Kafka Producer: {e}")
                finally:
                    self.producer = None
            self._cleanup_temp_files()

    async def publish(self, topic: str, data: dict):
        if self.producer is None:
            await self.start()
        if self.producer is None:
            logger.warning(f"Kafka Producer is not active. Event to {topic} omitted: {data}")
            return
        try:
            await self.producer.send_and_wait(topic, data)
            logger.info(f"Published event to '{topic}' successfully: {data}")
        except Exception as e:
            logger.error(f"Failed to publish event to '{topic}': {e}")

producer_manager = KafkaProducerManager()

async def publish_event(topic: str, data: dict):
    """
    Generic event publisher.
    """
    await producer_manager.publish(topic, data)

async def publish_chat_created(
    chat_id: int, 
    user_id: Optional[int], 
    guest_email: Optional[str], 
    guest_name: Optional[str], 
    status: str, 
    created_at: Optional[str]
):
    """
    Publish support.chat.created event.
    """
    await publish_event("support.chat.created", {
        "chat_id": chat_id,
        "user_id": user_id,
        "guest_email": guest_email,
        "guest_name": guest_name,
        "status": status,
        "created_at": created_at
    })

async def publish_chat_status_changed(
    chat_id: int, 
    old_status: str, 
    new_status: str, 
    updated_at: Optional[str]
):
    """
    Publish support.chat.status.changed event.
    """
    await publish_event("support.chat.status.changed", {
        "chat_id": chat_id,
        "old_status": old_status,
        "new_status": new_status,
        "updated_at": updated_at
    })

async def publish_message_sent(
    message_id: int, 
    chat_id: int, 
    sender_type: str, 
    sender_id: Optional[int], 
    content: str, 
    created_at: Optional[str]
):
    """
    Publish support.message.sent event.
    """
    await publish_event("support.message.sent", {
        "message_id": message_id,
        "chat_id": chat_id,
        "sender_type": sender_type,
        "sender_id": sender_id,
        "content": content,
        "created_at": created_at
    })
