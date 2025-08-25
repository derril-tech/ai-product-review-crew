# Created automatically by Cursor AI (2024-12-19)

from celery_app import celery_app
import structlog
from typing import Dict, Any, List
import numpy as np
from sklearn.preprocessing import MinMaxScaler, StandardScaler

logger = structlog.get_logger()


@celery_app.task(bind=True)
def compute_scores(self, scoring_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compute scores and rankings for products
    """
    try:
        review_id = scoring_data.get("review_id")
        products_data = scoring_data.get("products_data")
        criteria_data = scoring_data.get("criteria_data")
        method = scoring_data.get("method", "weighted")
        
        logger.info("Starting score computation", review_id=review_id, method=method)
        
        # Normalize raw scores
        normalized_scores = _normalize_scores(products_data, criteria_data)
        
        # Compute weighted scores
        weighted_scores = _compute_weighted_scores(normalized_scores, criteria_data)
        
        # Generate rankings
        rankings = _generate_rankings(weighted_scores, method)
        
        # Compute sensitivity analysis
        sensitivity = _compute_sensitivity(weighted_scores, criteria_data)
        
        result = {
            "review_id": review_id,
            "normalized_scores": normalized_scores,
            "weighted_scores": weighted_scores,
            "rankings": rankings,
            "sensitivity": sensitivity,
            "status": "completed"
        }
        
        logger.info("Score computation completed", review_id=review_id)
        return result
        
    except Exception as e:
        logger.error("Score computation failed", review_id=review_id, error=str(e))
        raise


def _normalize_scores(products_data: List[Dict], criteria_data: List[Dict]) -> Dict[str, Dict]:
    """Normalize raw scores based on criteria normalization method"""
    normalized = {}
    
    for product in products_data:
        product_id = product["id"]
        normalized[product_id] = {}
        
        for criterion in criteria_data:
            criterion_id = criterion["id"]
            raw_score = product.get("scores", {}).get(criterion_id, 0)
            normalization = criterion.get("normalization", "minmax")
            
            if normalization == "minmax":
                # Min-max normalization
                all_scores = [p.get("scores", {}).get(criterion_id, 0) for p in products_data]
                min_score = min(all_scores)
                max_score = max(all_scores)
                if max_score > min_score:
                    normalized_score = (raw_score - min_score) / (max_score - min_score)
                else:
                    normalized_score = 0.5
            elif normalization == "zscore":
                # Z-score normalization
                all_scores = [p.get("scores", {}).get(criterion_id, 0) for p in products_data]
                mean_score = np.mean(all_scores)
                std_score = np.std(all_scores)
                if std_score > 0:
                    normalized_score = (raw_score - mean_score) / std_score
                    # Convert to 0-1 scale
                    normalized_score = (normalized_score + 3) / 6  # Assuming 3 standard deviations
                    normalized_score = max(0, min(1, normalized_score))
                else:
                    normalized_score = 0.5
            else:
                # No normalization
                normalized_score = raw_score
            
            normalized[product_id][criterion_id] = normalized_score
    
    return normalized


def _compute_weighted_scores(normalized_scores: Dict, criteria_data: List[Dict]) -> Dict[str, float]:
    """Compute weighted scores for each product"""
    weighted_scores = {}
    
    for product_id, scores in normalized_scores.items():
        total_score = 0
        total_weight = 0
        
        for criterion in criteria_data:
            criterion_id = criterion["id"]
            weight = criterion.get("weight", 0)
            direction = criterion.get("direction", "higher_better")
            
            score = scores.get(criterion_id, 0)
            
            # Adjust for direction
            if direction == "lower_better":
                score = 1 - score
            
            total_score += score * weight
            total_weight += weight
        
        # Normalize by total weight
        if total_weight > 0:
            weighted_scores[product_id] = total_score / total_weight
        else:
            weighted_scores[product_id] = 0
    
    return weighted_scores


def _generate_rankings(weighted_scores: Dict[str, float], method: str) -> List[Dict]:
    """Generate rankings based on weighted scores"""
    if method == "topsis":
        return _topsis_ranking(weighted_scores)
    else:
        # Default weighted sum ranking
        sorted_products = sorted(weighted_scores.items(), key=lambda x: x[1], reverse=True)
        
        rankings = []
        for rank, (product_id, score) in enumerate(sorted_products, 1):
            rankings.append({
                "product_id": product_id,
                "rank": rank,
                "score": score,
                "method": "weighted"
            })
        
        return rankings


def _topsis_ranking(weighted_scores: Dict[str, float]) -> List[Dict]:
    """TOPSIS ranking method"""
    # For simplicity, implementing basic TOPSIS
    # In a real implementation, this would use the full decision matrix
    
    sorted_products = sorted(weighted_scores.items(), key=lambda x: x[1], reverse=True)
    
    rankings = []
    for rank, (product_id, score) in enumerate(sorted_products, 1):
        rankings.append({
            "product_id": product_id,
            "rank": rank,
            "score": score,
            "method": "topsis"
        })
    
    return rankings


def _compute_sensitivity(weighted_scores: Dict[str, float], criteria_data: List[Dict]) -> Dict[str, Dict]:
    """Compute sensitivity analysis for weight changes"""
    sensitivity = {}
    
    for product_id in weighted_scores.keys():
        sensitivity[product_id] = {
            "delta_10": 0,
            "delta_20": 0,
            "delta_50": 0
        }
    
    # TODO: Implement full sensitivity analysis
    # This would involve recomputing scores with perturbed weights
    # and measuring rank changes
    
    return sensitivity
