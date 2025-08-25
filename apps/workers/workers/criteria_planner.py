# Created automatically by Cursor AI (2024-12-19)

from celery_app import celery_app
import structlog
from typing import Dict, Any, List

logger = structlog.get_logger()


@celery_app.task(bind=True)
def plan_criteria(self, planning_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Plan evaluation criteria based on category and audience
    """
    try:
        review_id = planning_data.get("review_id")
        category = planning_data.get("category")
        audience = planning_data.get("audience")
        
        logger.info("Starting criteria planning", review_id=review_id, category=category, audience=audience)
        
        criteria = _generate_criteria(category, audience)
        
        result = {
            "review_id": review_id,
            "criteria": criteria,
            "status": "completed"
        }
        
        logger.info("Criteria planning completed", review_id=review_id, criteria_count=len(criteria))
        return result
        
    except Exception as e:
        logger.error("Criteria planning failed", review_id=review_id, error=str(e))
        raise


def _generate_criteria(category: str, audience: str) -> List[Dict[str, Any]]:
    """Generate criteria based on category and audience"""
    
    # Base criteria templates by category
    category_templates = {
        "ai_video": [
            {
                "name": "Video Quality",
                "description": "Output video resolution and visual quality",
                "direction": "higher_better",
                "normalization": "minmax",
                "weight": 0.25
            },
            {
                "name": "Generation Speed",
                "description": "Time to generate video content",
                "direction": "lower_better",
                "normalization": "minmax",
                "weight": 0.20
            },
            {
                "name": "AI Model Quality",
                "description": "Sophistication of underlying AI models",
                "direction": "higher_better",
                "normalization": "minmax",
                "weight": 0.20
            },
            {
                "name": "Ease of Use",
                "description": "User interface and workflow simplicity",
                "direction": "higher_better",
                "normalization": "minmax",
                "weight": 0.15
            },
            {
                "name": "Price per Video",
                "description": "Cost per generated video",
                "direction": "lower_better",
                "normalization": "minmax",
                "weight": 0.20
            }
        ],
        "ai_writing": [
            {
                "name": "Content Quality",
                "description": "Writing quality and coherence",
                "direction": "higher_better",
                "normalization": "minmax",
                "weight": 0.30
            },
            {
                "name": "Customization",
                "description": "Ability to customize tone and style",
                "direction": "higher_better",
                "normalization": "minmax",
                "weight": 0.20
            },
            {
                "name": "Speed",
                "description": "Time to generate content",
                "direction": "lower_better",
                "normalization": "minmax",
                "weight": 0.15
            },
            {
                "name": "Plagiarism Check",
                "description": "Built-in plagiarism detection",
                "direction": "higher_better",
                "normalization": "minmax",
                "weight": 0.15
            },
            {
                "name": "Price per Word",
                "description": "Cost per generated word",
                "direction": "lower_better",
                "normalization": "minmax",
                "weight": 0.20
            }
        ],
        "project_management": [
            {
                "name": "Feature Completeness",
                "description": "Comprehensive project management features",
                "direction": "higher_better",
                "normalization": "minmax",
                "weight": 0.25
            },
            {
                "name": "Team Collaboration",
                "description": "Multi-user collaboration capabilities",
                "direction": "higher_better",
                "normalization": "minmax",
                "weight": 0.20
            },
            {
                "name": "Integration Options",
                "description": "Third-party integrations available",
                "direction": "higher_better",
                "normalization": "minmax",
                "weight": 0.15
            },
            {
                "name": "Learning Curve",
                "description": "Ease of getting started",
                "direction": "higher_better",
                "normalization": "minmax",
                "weight": 0.15
            },
            {
                "name": "Price per User",
                "description": "Monthly cost per team member",
                "direction": "lower_better",
                "normalization": "minmax",
                "weight": 0.25
            }
        ]
    }
    
    # Get base criteria for category
    base_criteria = category_templates.get(category.lower(), [
        {
            "name": "Quality",
            "description": "Overall product quality",
            "direction": "higher_better",
            "normalization": "minmax",
            "weight": 0.30
        },
        {
            "name": "Price",
            "description": "Product pricing",
            "direction": "lower_better",
            "normalization": "minmax",
            "weight": 0.30
        },
        {
            "name": "Ease of Use",
            "description": "User experience and simplicity",
            "direction": "higher_better",
            "normalization": "minmax",
            "weight": 0.20
        },
        {
            "name": "Features",
            "description": "Feature completeness",
            "direction": "higher_better",
            "normalization": "minmax",
            "weight": 0.20
        }
    ])
    
    # Adjust weights based on audience
    audience_adjustments = {
        "freelancers": {
            "Price": 0.40,  # Higher weight on price
            "Ease of Use": 0.25,  # Higher weight on simplicity
        },
        "enterprise": {
            "Quality": 0.40,  # Higher weight on quality
            "Features": 0.30,  # Higher weight on features
            "Price": 0.20,  # Lower weight on price
        },
        "startups": {
            "Price": 0.35,  # Moderate weight on price
            "Features": 0.25,  # Moderate weight on features
            "Ease of Use": 0.25,  # Moderate weight on ease
        }
    }
    
    # Apply audience adjustments
    adjustments = audience_adjustments.get(audience.lower(), {})
    for criterion in base_criteria:
        if criterion["name"] in adjustments:
            criterion["weight"] = adjustments[criterion["name"]]
    
    # Normalize weights to sum to 1.0
    total_weight = sum(c["weight"] for c in base_criteria)
    for criterion in base_criteria:
        criterion["weight"] = criterion["weight"] / total_weight
    
    return base_criteria
