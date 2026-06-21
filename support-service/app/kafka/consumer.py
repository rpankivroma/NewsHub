import json
import logging
import asyncio
from aiokafka import AIOKafkaConsumer
from ..config import settings

logger = logging.getLogger("kafka_consumer")

class KafkaConsumerManager:
    def __init__(self):
        self.consumer = None
        self._running = False
        self._task = None

    async def start(self):
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._consume_loop())
        logger.info("Kafka Consumer background task initiated.")

    async def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None
        if self.consumer:
            try:
                await self.consumer.stop()
            except Exception as e:
                logger.error(f"Error while stopping AIOKafkaConsumer: {e}")
            finally:
                self.consumer = None
        logger.info("Kafka Consumer stopped.")

    async def _consume_loop(self):
        bootstrap_servers = settings.KAFKA_BOOTSTRAP_SERVERS or "localhost:9092"
        topics = ["support.message.sent", "support.message.read"]
        
        logger.info(f"Starting consumer loop. Listening on {topics} from bootstrap {bootstrap_servers}")
        
        while self._running:
            try:
                self.consumer = AIOKafkaConsumer(
                    *topics,
                    bootstrap_servers=bootstrap_servers,
                    group_id="support-group",
                    value_deserializer=lambda x: json.loads(x.decode('utf-8')),
                    auto_offset_reset="earliest"
                )
                await self.consumer.start()
                logger.info(f"Kafka Consumer connected successfully to {bootstrap_servers}")
                
                async for message in self.consumer:
                    if not self._running:
                        break
                    topic = message.topic
                    payload = message.value
                    logger.info(f"Received message on topic '{topic}': {payload}")
                    
                    if topic == "support.message.sent":
                        await self.handle_message_sent(payload)
                    elif topic == "support.message.read":
                        await self.handle_message_read(payload)
                        
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Kafka Consumer connection error: {e}. Re-attempting connection in 10 seconds...")
                if self.consumer:
                    try:
                        await self.consumer.stop()
                    except Exception:
                        pass
                    self.consumer = None
                await asyncio.sleep(10)

    async def handle_message_sent(self, payload: dict):
        """
        Placeholder logic when support.message.sent event is caught.
        """
        logger.info(f"Processed event support.message.sent: {payload}")

    async def handle_message_read(self, payload: dict):
        """
        Placeholder logic when support.message.read event is caught.
        """
        logger.info(f"Processed event support.message.read: {payload}")

consumer_manager = KafkaConsumerManager()
