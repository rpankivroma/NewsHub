from sqlalchemy.orm import Session
from ..repositories.donation_repository import DonationRepository
from .. import schemas

class DonationService:
    @staticmethod
    def get_all_donations(db: Session):
        return DonationRepository.get_all(db)

    @staticmethod
    def get_donation_settings(db: Session):
        return DonationRepository.get_settings(db)

    @staticmethod
    def update_donation_settings(db: Session, data: schemas.DonationSettingsCreate):
        return DonationRepository.update_settings(db, data)

    @staticmethod
    def create_donation(db: Session, donation: schemas.DonationCreate):
        return DonationRepository.create(db, donation)

    @staticmethod
    def init_liqpay_payment(db: Session, amount: float, currency: str, email: str = None, name: str = None, result_url: str = None):
        import uuid
        order_id = str(uuid.uuid4())
        
        # Create pending donation record
        donation_data = schemas.DonationCreate(
            amount=amount,
            currency=currency,
            method="card",
            donor_email=email,
            donor_name=name,
            order_id=order_id
        )
        DonationRepository.create(db, donation_data)
        
        # Get LiqPay params
        from .liqpay_service import LiqPayService
        description = f"Donation for {amount} {currency}"
        return LiqPayService.get_checkout_params(amount, currency, description, order_id, result_url)

    @staticmethod
    def handle_liqpay_callback(db: Session, data: str, signature: str):
        from .liqpay_service import LiqPayService
        if not LiqPayService.verify_signature(data, signature):
            return False, "Invalid signature"
            
        payload = LiqPayService.decode_data(data)
        order_id = payload.get("order_id")
        status = payload.get("status")
        transaction_id = str(payload.get("transaction_id", ""))
        
        donation = DonationRepository.get_by_order_id(db, order_id)
        if not donation:
            return False, "Donation not found"
            
        # Map LiqPay status to our status
        our_status = "pending"
        if status in ["success", "wait_accept"]:
            our_status = "success"
        elif status in ["reversed", "refunded"]:
            our_status = "reversed"
        elif status in ["failure", "error"]:
            our_status = "failure"
            
        donation_update = schemas.DonationUpdate(
            status=our_status,
            liqpay_transaction_id=transaction_id
        )
        DonationRepository.update(db, donation.id, donation_update)
        
        return True, "Status updated"
