import base64
import json
import hashlib
import os
from typing import Dict, Any

class LiqPayService:
    @staticmethod
    def get_credentials() -> Dict[str, str]:
        return {
            "public_key": os.getenv("LIQPAY_PUBLIC_KEY", "").strip(),
            "private_key": os.getenv("LIQPAY_PRIVATE_KEY", "").strip()
        }

    @staticmethod
    def generate_signature(data: str) -> str:
        credentials = LiqPayService.get_credentials()
        private_key = credentials["private_key"]
        
        sign_str = private_key + data + private_key
        return base64.b64encode(hashlib.sha1(sign_str.encode('utf-8')).digest()).decode('utf-8')

    @staticmethod
    def encode_data(params: Dict[str, Any]) -> str:
        json_data = json.dumps(params)
        return base64.b64encode(json_data.encode('utf-8')).decode('utf-8')

    @staticmethod
    def verify_signature(data: str, signature: str) -> bool:
        expected_signature = LiqPayService.generate_signature(data)
        return expected_signature == signature

    @staticmethod
    def decode_data(data: str) -> Dict[str, Any]:
        json_data = base64.b64decode(data).decode('utf-8')
        return json.loads(json_data)

    @classmethod
    def get_checkout_params(cls, amount: float, currency: str, description: str, order_id: str) -> Dict[str, str]:
        credentials = cls.get_credentials()
        public_key = credentials["public_key"]
        private_key = credentials["private_key"]

        if not public_key or public_key == "your_public_key" or not private_key or private_key == "your_private_key":
            print("WARNING: LiqPay keys are not configured correctly. Using placeholders.")
            
        result_url = os.getenv("LIQPAY_RESULT_URL", "")
        # Append amount to result_url if possible
        if result_url and "?" in result_url:
            result_url += f"&amount={amount}"
        elif result_url:
            result_url += f"?amount={amount}"
            
        server_url = os.getenv("LIQPAY_SERVER_URL", "")

        params = {
            "version": 3,
            "public_key": public_key,
            "action": "pay",
            "amount": amount,
            "currency": currency,
            "description": description,
            "order_id": order_id,
            "result_url": result_url,
            "server_url": server_url,
            "language": "en"
        }

        data = cls.encode_data(params)
        signature = cls.generate_signature(data)

        return {
            "data": data,
            "signature": signature
        }
