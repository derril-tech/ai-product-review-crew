# Created automatically by Cursor AI (2024-12-19)

from celery_app import celery_app
import structlog
from typing import Dict, Any, List
import re
import requests

logger = structlog.get_logger()


@celery_app.task(bind=True)
def normalize_pricing(self, pricing_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize pricing data to USD/month with caveats
    """
    try:
        product_id = pricing_data.get("product_id")
        raw_pricing = pricing_data.get("pricing_data")
        
        logger.info("Starting pricing normalization", product_id=product_id)
        
        normalized_pricing = []
        
        for price_item in raw_pricing:
            normalized = _normalize_price_item(price_item)
            normalized_pricing.append(normalized)
        
        result = {
            "product_id": product_id,
            "normalized_pricing": normalized_pricing,
            "status": "completed"
        }
        
        logger.info("Pricing normalization completed", product_id=product_id)
        return result
        
    except Exception as e:
        logger.error("Pricing normalization failed", product_id=product_id, error=str(e))
        raise


def _normalize_price_item(price_item: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize a single price item"""
    original_price = price_item.get("price", "")
    original_currency = price_item.get("currency", "USD")
    billing_period = price_item.get("billing_period", "month")
    
    # Extract numeric value
    numeric_value = _extract_numeric_value(original_price)
    
    # Convert to USD if needed
    usd_value = _convert_to_usd(numeric_value, original_currency)
    
    # Normalize to monthly
    monthly_value = _normalize_to_monthly(usd_value, billing_period)
    
    # Extract caveats
    caveats = _extract_caveats(price_item)
    
    return {
        "original_price": original_price,
        "original_currency": original_currency,
        "billing_period": billing_period,
        "usd_monthly": monthly_value,
        "caveats": caveats,
        "per_seat": "per seat" in original_price.lower() or "per user" in original_price.lower(),
        "per_render": "per render" in original_price.lower() or "per generation" in original_price.lower(),
    }


def _extract_numeric_value(price_string: str) -> float:
    """Extract numeric value from price string"""
    # Remove currency symbols and extract numbers
    numeric_match = re.search(r'[\d,]+\.?\d*', price_string.replace(',', ''))
    if numeric_match:
        return float(numeric_match.group())
    return 0.0


def _convert_to_usd(value: float, currency: str) -> float:
    """Convert value to USD using exchange rates"""
    if currency.upper() == "USD":
        return value
    
    # TODO: Implement real exchange rate API
    # For now, use placeholder rates
    rates = {
        "EUR": 1.1,
        "GBP": 1.3,
        "CAD": 0.75,
        "AUD": 0.65,
        "JPY": 0.007,
    }
    
    rate = rates.get(currency.upper(), 1.0)
    return value * rate


def _normalize_to_monthly(value: float, billing_period: str) -> float:
    """Normalize value to monthly billing"""
    period_multipliers = {
        "month": 1.0,
        "monthly": 1.0,
        "year": 1/12,
        "yearly": 1/12,
        "week": 4.33,
        "weekly": 4.33,
        "day": 30.44,
        "daily": 30.44,
    }
    
    multiplier = period_multipliers.get(billing_period.lower(), 1.0)
    return value * multiplier


def _extract_caveats(price_item: Dict[str, Any]) -> List[str]:
    """Extract pricing caveats"""
    caveats = []
    
    # Check for common caveats
    price_string = price_item.get("price", "").lower()
    description = price_item.get("description", "").lower()
    
    if "annual" in price_string or "annual" in description:
        caveats.append("Annual billing required")
    
    if "setup" in price_string or "setup" in description:
        caveats.append("Setup fee may apply")
    
    if "enterprise" in price_string or "enterprise" in description:
        caveats.append("Enterprise pricing may vary")
    
    if "contact" in price_string or "contact" in description:
        caveats.append("Contact sales for pricing")
    
    return caveats
