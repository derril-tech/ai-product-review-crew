import structlog
from celery import shared_task
from typing import List, Dict, Any, Optional
import json
import re

logger = structlog.get_logger()

@shared_task(bind=True, name='pros_cons_synthesizer.synthesize')
def synthesize_pros_cons(
    self,
    review_id: str,
    product_id: str,
    claims: List[Dict[str, Any]],
    scores: List[Dict[str, Any]],
    criteria: List[Dict[str, Any]],
    product_info: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Synthesize pros and cons for a product based on claims, scores, and criteria.
    
    Args:
        review_id: Review identifier
        product_id: Product identifier
        claims: List of extracted claims for the product
        scores: List of scores for the product across criteria
        criteria: List of evaluation criteria
        product_info: Basic product information (name, category, etc.)
    
    Returns:
        Dictionary containing pros, cons, and metadata
    """
    try:
        logger.info("Starting pros/cons synthesis", 
                   review_id=review_id, 
                   product_id=product_id,
                   claims_count=len(claims),
                   scores_count=len(scores))
        
        # Group claims by type
        feature_claims = [c for c in claims if c.get('type') == 'feature']
        pricing_claims = [c for c in claims if c.get('type') == 'pricing']
        limit_claims = [c for c in claims if c.get('type') == 'limit']
        
        # Analyze scores to identify strengths and weaknesses
        strengths = []
        weaknesses = []
        
        for score in scores:
            criterion = next((c for c in criteria if c['id'] == score['criterionId']), None)
            if not criterion:
                continue
                
            normalized_score = score.get('normalizedScore', 0)
            criterion_name = criterion.get('name', 'Unknown')
            
            if normalized_score >= 0.7:
                strengths.append({
                    'criterion': criterion_name,
                    'score': normalized_score,
                    'justification': score.get('justification', ''),
                    'evidence': _find_supporting_claims(criterion_name, claims)
                })
            elif normalized_score <= 0.3:
                weaknesses.append({
                    'criterion': criterion_name,
                    'score': normalized_score,
                    'justification': score.get('justification', ''),
                    'evidence': _find_supporting_claims(criterion_name, claims)
                })
        
        # Generate pros from strengths and positive claims
        pros = _generate_pros(strengths, feature_claims, product_info)
        
        # Generate cons from weaknesses and negative claims
        cons = _generate_cons(weaknesses, limit_claims, pricing_claims, product_info)
        
        # Identify red flags
        red_flags = _identify_red_flags(claims, scores, product_info)
        
        # Calculate confidence scores
        pros_confidence = _calculate_confidence(pros, claims)
        cons_confidence = _calculate_confidence(cons, claims)
        
        result = {
            'review_id': review_id,
            'product_id': product_id,
            'pros': pros,
            'cons': cons,
            'red_flags': red_flags,
            'metadata': {
                'pros_confidence': pros_confidence,
                'cons_confidence': cons_confidence,
                'strengths_count': len(strengths),
                'weaknesses_count': len(weaknesses),
                'claims_analyzed': len(claims),
                'criteria_covered': len(set(s['criterionId'] for s in scores))
            }
        }
        
        logger.info("Pros/cons synthesis completed", 
                   review_id=review_id,
                   product_id=product_id,
                   pros_count=len(pros),
                   cons_count=len(cons),
                   red_flags_count=len(red_flags))
        
        return result
        
    except Exception as e:
        logger.error("Error in pros/cons synthesis", 
                    review_id=review_id,
                    product_id=product_id,
                    error=str(e))
        raise self.retry(countdown=60, max_retries=3)

def _find_supporting_claims(criterion_name: str, claims: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Find claims that support a given criterion."""
    supporting_claims = []
    
    # Map criterion names to relevant claim patterns
    criterion_patterns = {
        'price': ['price', 'cost', 'pricing', 'subscription', 'monthly', 'annual'],
        'performance': ['speed', 'performance', 'fast', 'slow', 'efficient'],
        'quality': ['quality', 'resolution', 'accuracy', 'precision'],
        'ease of use': ['easy', 'simple', 'intuitive', 'user-friendly', 'interface'],
        'features': ['feature', 'functionality', 'capability', 'tool'],
        'support': ['support', 'help', 'documentation', 'tutorial'],
        'reliability': ['reliable', 'stable', 'robust', 'dependable'],
        'scalability': ['scale', 'scalable', 'growth', 'enterprise']
    }
    
    # Find relevant patterns for the criterion
    relevant_patterns = []
    criterion_lower = criterion_name.lower()
    for pattern_key, patterns in criterion_patterns.items():
        if any(pattern in criterion_lower for pattern in patterns):
            relevant_patterns.extend(patterns)
    
    # Find claims that match the patterns
    for claim in claims:
        claim_text = f"{claim.get('key', '')} {claim.get('value', '')}".lower()
        if any(pattern in claim_text for pattern in relevant_patterns):
            supporting_claims.append(claim)
    
    return supporting_claims

def _generate_pros(strengths: List[Dict], feature_claims: List[Dict], product_info: Dict) -> List[Dict]:
    """Generate pros based on strengths and positive claims."""
    pros = []
    
    # Add pros from strengths
    for strength in strengths:
        pros.append({
            'id': f"pro_{len(pros)}",
            'title': f"Strong {strength['criterion']}",
            'description': strength['justification'] or f"Excellent performance in {strength['criterion']}",
            'score': strength['score'],
            'evidence': strength['evidence'],
            'category': 'performance',
            'confidence': 'high' if strength['score'] >= 0.8 else 'medium'
        })
    
    # Add pros from positive feature claims
    for claim in feature_claims:
        if _is_positive_claim(claim):
            pros.append({
                'id': f"pro_{len(pros)}",
                'title': f"Feature: {claim.get('key', 'Unknown feature')}",
                'description': claim.get('value', ''),
                'score': 0.7,  # Default positive score
                'evidence': [claim],
                'category': 'feature',
                'confidence': 'medium'
            })
    
    # Add category-specific pros
    category = product_info.get('category', '').lower()
    if 'ai' in category or 'artificial intelligence' in category:
        pros.append({
            'id': f"pro_{len(pros)}",
            'title': "AI-Powered Capabilities",
            'description': "Leverages artificial intelligence for enhanced functionality",
            'score': 0.8,
            'evidence': [],
            'category': 'ai',
            'confidence': 'high'
        })
    
    return pros[:10]  # Limit to top 10 pros

def _generate_cons(weaknesses: List[Dict], limit_claims: List[Dict], pricing_claims: List[Dict], product_info: Dict) -> List[Dict]:
    """Generate cons based on weaknesses and negative claims."""
    cons = []
    
    # Add cons from weaknesses
    for weakness in weaknesses:
        cons.append({
            'id': f"con_{len(cons)}",
            'title': f"Weak {weakness['criterion']}",
            'description': weakness['justification'] or f"Poor performance in {weakness['criterion']}",
            'score': weakness['score'],
            'evidence': weakness['evidence'],
            'category': 'performance',
            'confidence': 'high' if weakness['score'] <= 0.2 else 'medium'
        })
    
    # Add cons from limit claims
    for claim in limit_claims:
        cons.append({
            'id': f"con_{len(cons)}",
            'title': f"Limitation: {claim.get('key', 'Unknown limitation')}",
            'description': claim.get('value', ''),
            'score': 0.3,  # Default negative score
            'evidence': [claim],
            'category': 'limitation',
            'confidence': 'medium'
        })
    
    # Add cons from pricing issues
    for claim in pricing_claims:
        if _is_expensive_claim(claim):
            cons.append({
                'id': f"con_{len(cons)}",
                'title': "High Cost",
                'description': f"Expensive pricing: {claim.get('value', '')}",
                'score': 0.4,
                'evidence': [claim],
                'category': 'pricing',
                'confidence': 'high'
            })
    
    return cons[:10]  # Limit to top 10 cons

def _identify_red_flags(claims: List[Dict], scores: List[Dict], product_info: Dict) -> List[Dict]:
    """Identify potential red flags."""
    red_flags = []
    
    # Check for missing critical information
    critical_criteria = ['price', 'performance', 'quality', 'support']
    covered_criteria = set(s.get('criterionId') for s in scores)
    
    for criterion in critical_criteria:
        if not any(criterion in c.get('name', '').lower() for c in covered_criteria):
            red_flags.append({
                'id': f"red_flag_{len(red_flags)}",
                'title': f"Missing {criterion.title()} Information",
                'description': f"No {criterion} data available for evaluation",
                'severity': 'medium',
                'category': 'missing_data',
                'resolution': 'Request additional information from sources'
            })
    
    # Check for contradictory claims
    contradictions = _find_contradictions(claims)
    for contradiction in contradictions:
        red_flags.append({
            'id': f"red_flag_{len(red_flags)}",
            'title': "Contradictory Claims Detected",
            'description': f"Conflicting information about {contradiction['topic']}",
            'severity': 'high',
            'category': 'contradiction',
            'resolution': 'Verify claims with additional sources',
            'details': contradiction
        })
    
    # Check for hidden costs
    hidden_costs = _identify_hidden_costs(claims)
    for cost in hidden_costs:
        red_flags.append({
            'id': f"red_flag_{len(red_flags)}",
            'title': "Potential Hidden Costs",
            'description': f"Additional costs may apply: {cost['description']}",
            'severity': 'medium',
            'category': 'pricing',
            'resolution': 'Clarify total cost of ownership',
            'details': cost
        })
    
    return red_flags

def _is_positive_claim(claim: Dict) -> bool:
    """Determine if a claim is positive."""
    positive_words = ['excellent', 'great', 'good', 'best', 'top', 'leading', 'advanced', 'powerful']
    claim_text = f"{claim.get('key', '')} {claim.get('value', '')}".lower()
    return any(word in claim_text for word in positive_words)

def _is_expensive_claim(claim: Dict) -> bool:
    """Determine if a pricing claim indicates high cost."""
    expensive_words = ['expensive', 'high', 'premium', 'costly', 'overpriced']
    claim_text = f"{claim.get('key', '')} {claim.get('value', '')}".lower()
    return any(word in claim_text for word in expensive_words)

def _find_contradictions(claims: List[Dict]) -> List[Dict]:
    """Find contradictory claims."""
    contradictions = []
    
    # Group claims by topic
    topic_groups = {}
    for claim in claims:
        topic = _extract_topic(claim)
        if topic not in topic_groups:
            topic_groups[topic] = []
        topic_groups[topic].append(claim)
    
    # Check for contradictions within topics
    for topic, topic_claims in topic_groups.items():
        if len(topic_claims) > 1:
            # Simple contradiction detection based on value differences
            values = [c.get('value', '') for c in topic_claims]
            if len(set(values)) > 1:
                contradictions.append({
                    'topic': topic,
                    'claims': topic_claims,
                    'values': values
                })
    
    return contradictions

def _extract_topic(claim: Dict) -> str:
    """Extract the main topic from a claim."""
    key = claim.get('key', '').lower()
    
    # Map claim keys to topics
    topic_mapping = {
        'price': 'pricing',
        'cost': 'pricing',
        'subscription': 'pricing',
        'speed': 'performance',
        'performance': 'performance',
        'quality': 'quality',
        'resolution': 'quality',
        'feature': 'features',
        'functionality': 'features'
    }
    
    for pattern, topic in topic_mapping.items():
        if pattern in key:
            return topic
    
    return 'general'

def _identify_hidden_costs(claims: List[Dict]) -> List[Dict]:
    """Identify potential hidden costs."""
    hidden_costs = []
    
    hidden_cost_patterns = [
        'setup fee', 'installation', 'training', 'consulting',
        'add-on', 'plugin', 'extension', 'premium feature',
        'enterprise', 'pro plan', 'advanced tier'
    ]
    
    for claim in claims:
        claim_text = f"{claim.get('key', '')} {claim.get('value', '')}".lower()
        for pattern in hidden_cost_patterns:
            if pattern in claim_text:
                hidden_costs.append({
                    'type': pattern,
                    'description': claim.get('value', ''),
                    'claim': claim
                })
    
    return hidden_costs

def _calculate_confidence(pros_cons: List[Dict], claims: List[Dict]) -> float:
    """Calculate confidence score for pros/cons based on evidence."""
    if not pros_cons:
        return 0.0
    
    total_confidence = 0.0
    for item in pros_cons:
        evidence_count = len(item.get('evidence', []))
        base_confidence = 0.5  # Base confidence without evidence
        
        # Increase confidence based on evidence
        evidence_boost = min(evidence_count * 0.1, 0.4)  # Max 0.4 boost from evidence
        item_confidence = base_confidence + evidence_boost
        
        total_confidence += item_confidence
    
    return total_confidence / len(pros_cons)
