import os
import ssl
import tempfile
import logging
from typing import Tuple, List, Optional
from ..config import settings

logger = logging.getLogger("kafka_ssl_helper")

def get_kafka_ssl_context() -> Tuple[Optional[ssl.SSLContext], List[str]]:
    """
    Creates an SSLContext for AIOKafka clients if KAFKA_SECURITY_PROTOCOL is 'SSL'.
    If raw credentials strings (KAFKA_CA_CERT, etc.) are supplied in the configuration instead 
    of file paths, this helper writes them to temporary files and returns their file paths 
    for cleanup reference.
    """
    if not settings.KAFKA_SECURITY_PROTOCOL or settings.KAFKA_SECURITY_PROTOCOL.upper() != "SSL":
        return None, []

    ca_path = settings.KAFKA_CA_CERT_PATH
    cert_path = settings.KAFKA_ACCESS_CERT_PATH
    key_path = settings.KAFKA_ACCESS_KEY_PATH

    temp_files: List[str] = []

    try:
        # Check and write KAFKA_CA_CERT if provided
        if settings.KAFKA_CA_CERT and not ca_path:
            fd, path = tempfile.mkstemp(suffix="-ca.pem")
            with os.fdopen(fd, 'w') as f:
                f.write(settings.KAFKA_CA_CERT.strip())
            ca_path = path
            temp_files.append(path)
            logger.info("Created temporary file for KAFKA_CA_CERT.")

        # Check and write KAFKA_ACCESS_CERT if provided
        if settings.KAFKA_ACCESS_CERT and not cert_path:
            fd, path = tempfile.mkstemp(suffix="-cert.pem")
            with os.fdopen(fd, 'w') as f:
                f.write(settings.KAFKA_ACCESS_CERT.strip())
            cert_path = path
            temp_files.append(path)
            logger.info("Created temporary file for KAFKA_ACCESS_CERT.")

        # Check and write KAFKA_ACCESS_KEY if provided
        if settings.KAFKA_ACCESS_KEY and not key_path:
            fd, path = tempfile.mkstemp(suffix="-key.pem")
            with os.fdopen(fd, 'w') as f:
                f.write(settings.KAFKA_ACCESS_KEY.strip())
            key_path = path
            temp_files.append(path)
            logger.info("Created temporary file for KAFKA_ACCESS_KEY.")

        if not ca_path or not cert_path or not key_path:
            logger.warning("Kafka SSL protocol specified, but CA cert, access cert, or access key is missing.")
            return None, temp_files

        # Create and structure standard SSLContext
        context = ssl.create_default_context(
            purpose=ssl.Purpose.SERVER_AUTH,
            cafile=ca_path
        )
        context.load_cert_chain(certfile=cert_path, keyfile=key_path)
        
        # Aiven server hostname needs to verify, but sometimes if in-memory test databases or other setups 
        # use custom ports/certs, this is configured. Default settings for secure connection:
        context.check_hostname = True
        context.verify_mode = ssl.CERT_REQUIRED

        return context, temp_files

    except Exception as e:
        logger.error(f"Failed to generate SSL Context for Kafka: {e}")
        return None, temp_files
