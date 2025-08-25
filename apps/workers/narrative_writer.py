import structlog
from celery import shared_task
from typing import List, Dict, Any, Optional
import json
import re

logger = structlog.get_logger()

@shared_task(bind=True, name='narrative_writer.write_review')
def write_review_narrative(
    self,
    review_id: str,
    product_info: Dict[str, Any],
    claims: List[Dict[str, Any]],
    scores: List[Dict[str, Any]],
    criteria: List[Dict[str, Any]],
    pros: List[Dict[str, Any]],
    cons: List[Dict[str, Any]],
    use_cases: List[Dict[str, Any]],
    target_audience: Optional[str] = None,
    writing_style: str = 'professional'
) -> Dict[str, Any]:
    """
    Generate comprehensive review narrative with multiple sections.
    
    Args:
        review_id: Review identifier
        product_info: Product information (name, category, etc.)
        claims: List of extracted claims
        scores: List of scores across criteria
        criteria: List of evaluation criteria
        pros: List of pros
        cons: List of cons
        use_cases: List of recommended use cases
        target_audience: Target audience for the review
        writing_style: Writing style (professional, casual, technical)
    
    Returns:
        Dictionary containing review sections and metadata
    """
    try:
        logger.info("Starting narrative writing", 
                   review_id=review_id, 
                   product_name=product_info.get('name'),
                   writing_style=writing_style)
        
        # Generate executive summary
        executive_summary = _generate_executive_summary(
            product_info, scores, pros, cons, target_audience, writing_style
        )
        
        # Generate overview section
        overview = _generate_overview_section(
            product_info, claims, criteria, writing_style
        )
        
        # Generate detailed analysis
        detailed_analysis = _generate_detailed_analysis(
            product_info, claims, scores, criteria, writing_style
        )
        
        # Generate pros and cons section
        pros_cons_section = _generate_pros_cons_section(
            pros, cons, writing_style
        )
        
        # Generate use cases section
        use_cases_section = _generate_use_cases_section(
            use_cases, product_info, writing_style
        )
        
        # Generate conclusion
        conclusion = _generate_conclusion(
            product_info, scores, pros, cons, use_cases, target_audience, writing_style
        )
        
        # Generate recommendations
        recommendations = _generate_recommendations(
            product_info, scores, pros, cons, use_cases, target_audience
        )
        
        result = {
            'review_id': review_id,
            'product_id': product_info.get('id'),
            'sections': {
                'executive_summary': executive_summary,
                'overview': overview,
                'detailed_analysis': detailed_analysis,
                'pros_cons': pros_cons_section,
                'use_cases': use_cases_section,
                'conclusion': conclusion,
                'recommendations': recommendations
            },
            'metadata': {
                'total_words': _calculate_total_words([
                    executive_summary, overview, detailed_analysis,
                    pros_cons_section, use_cases_section, conclusion, recommendations
                ]),
                'writing_style': writing_style,
                'target_audience': target_audience,
                'sections_count': 7
            }
        }
        
        logger.info("Narrative writing completed", 
                   review_id=review_id,
                   total_words=result['metadata']['total_words'])
        
        return result
        
    except Exception as e:
        logger.error("Error in narrative writing", 
                    review_id=review_id,
                    error=str(e))
        raise self.retry(countdown=60, max_retries=3)

def _generate_executive_summary(
    product_info: Dict[str, Any],
    scores: List[Dict[str, Any]],
    pros: List[Dict[str, Any]],
    cons: List[Dict[str, Any]],
    target_audience: Optional[str],
    writing_style: str
) -> Dict[str, Any]:
    """Generate executive summary section."""
    product_name = product_info.get('name', 'this product')
    category = product_info.get('category', 'software')
    
    # Calculate overall score
    overall_score = sum(s.get('weightedScore', 0) for s in scores) if scores else 0
    
    # Get top pros and cons
    top_pros = sorted(pros, key=lambda x: x.get('score', 0), reverse=True)[:3]
    top_cons = sorted(cons, key=lambda x: x.get('score', 0))[:3]
    
    # Generate summary text
    if writing_style == 'professional':
        summary_text = f"{product_name} is a {category} solution that demonstrates {overall_score:.1%} overall performance across our evaluation criteria. "
    elif writing_style == 'casual':
        summary_text = f"Looking at {product_name}, this {category} tool scores {overall_score:.1%} overall in our testing. "
    else:  # technical
        summary_text = f"Analysis of {product_name} reveals an aggregate performance score of {overall_score:.1%} across evaluated metrics. "
    
    if top_pros:
        pros_text = ", ".join([pro.get('title', '') for pro in top_pros])
        summary_text += f"Key strengths include {pros_text}. "
    
    if top_cons:
        cons_text = ", ".join([con.get('title', '') for con in top_cons])
        summary_text += f"Areas for improvement include {cons_text}. "
    
    if target_audience:
        summary_text += f"This review is particularly relevant for {target_audience} users. "
    
    return {
        'title': 'Executive Summary',
        'content': summary_text,
        'word_count': len(summary_text.split()),
        'key_points': [
            f"Overall Score: {overall_score:.1%}",
            f"Top Strength: {top_pros[0].get('title', 'N/A') if top_pros else 'N/A'}",
            f"Main Concern: {top_cons[0].get('title', 'N/A') if top_cons else 'N/A'}"
        ]
    }

def _generate_overview_section(
    product_info: Dict[str, Any],
    claims: List[Dict[str, Any]],
    criteria: List[Dict[str, Any]],
    writing_style: str
) -> Dict[str, Any]:
    """Generate product overview section."""
    product_name = product_info.get('name', 'this product')
    category = product_info.get('category', 'software')
    description = product_info.get('description', '')
    
    # Extract key features from claims
    feature_claims = [c for c in claims if c.get('type') == 'feature']
    key_features = [c.get('key', '') for c in feature_claims[:5]]
    
    # Extract pricing information
    pricing_claims = [c for c in claims if c.get('type') == 'pricing']
    pricing_info = pricing_claims[0].get('value', 'Pricing varies') if pricing_claims else 'Pricing not specified'
    
    if writing_style == 'professional':
        overview_text = f"{product_name} is a comprehensive {category} platform designed to address modern business needs. "
    elif writing_style == 'casual':
        overview_text = f"{product_name} is a {category} tool that aims to make your work easier. "
    else:  # technical
        overview_text = f"{product_name} represents a {category} solution engineered for contemporary operational requirements. "
    
    if description:
        overview_text += f"{description} "
    
    if key_features:
        features_text = ", ".join(key_features)
        overview_text += f"Key features include {features_text}. "
    
    overview_text += f"Pricing starts at {pricing_info}. "
    
    return {
        'title': 'Product Overview',
        'content': overview_text,
        'word_count': len(overview_text.split()),
        'key_features': key_features,
        'pricing': pricing_info
    }

def _generate_detailed_analysis(
    product_info: Dict[str, Any],
    claims: List[Dict[str, Any]],
    scores: List[Dict[str, Any]],
    criteria: List[Dict[str, Any]],
    writing_style: str
) -> Dict[str, Any]:
    """Generate detailed analysis section."""
    product_name = product_info.get('name', 'this product')
    
    # Group scores by criterion
    criterion_scores = {}
    for score in scores:
        criterion_id = score.get('criterionId')
        criterion = next((c for c in criteria if c['id'] == criterion_id), None)
        if criterion:
            criterion_name = criterion.get('name', 'Unknown')
            criterion_scores[criterion_name] = {
                'score': score.get('normalizedScore', 0),
                'weight': criterion.get('weight', 0),
                'justification': score.get('justification', '')
            }
    
    # Sort criteria by weight
    sorted_criteria = sorted(criterion_scores.items(), key=lambda x: x[1]['weight'], reverse=True)
    
    analysis_text = ""
    if writing_style == 'professional':
        analysis_text = f"Our detailed analysis of {product_name} examines performance across {len(sorted_criteria)} key criteria. "
    elif writing_style == 'casual':
        analysis_text = f"Let's dive deep into how {product_name} performs across {len(sorted_criteria)} important areas. "
    else:  # technical
        analysis_text = f"Comprehensive evaluation of {product_name} across {len(sorted_criteria)} weighted criteria reveals the following performance metrics. "
    
    # Add analysis for each criterion
    for criterion_name, score_data in sorted_criteria:
        score = score_data['score']
        justification = score_data['justification']
        
        if score >= 0.8:
            performance = "excellent" if writing_style != 'technical' else "superior"
        elif score >= 0.6:
            performance = "good" if writing_style != 'technical' else "adequate"
        elif score >= 0.4:
            performance = "fair" if writing_style != 'technical' else "moderate"
        else:
            performance = "poor" if writing_style != 'technical' else "suboptimal"
        
        analysis_text += f"In {criterion_name}, {product_name} demonstrates {performance} performance ({score:.1%}). "
        
        if justification:
            analysis_text += f"{justification} "
    
    return {
        'title': 'Detailed Analysis',
        'content': analysis_text,
        'word_count': len(analysis_text.split()),
        'criterion_scores': criterion_scores,
        'top_performer': max(sorted_criteria, key=lambda x: x[1]['score'])[0] if sorted_criteria else None,
        'needs_improvement': min(sorted_criteria, key=lambda x: x[1]['score'])[0] if sorted_criteria else None
    }

def _generate_pros_cons_section(
    pros: List[Dict[str, Any]],
    cons: List[Dict[str, Any]],
    writing_style: str
) -> Dict[str, Any]:
    """Generate pros and cons section."""
    pros_text = ""
    cons_text = ""
    
    if writing_style == 'professional':
        pros_text = "Key advantages of this solution include: "
        cons_text = "Areas requiring attention include: "
    elif writing_style == 'casual':
        pros_text = "Here's what we really liked: "
        cons_text = "Here's what could be better: "
    else:  # technical
        pros_text = "Performance strengths identified: "
        cons_text = "Performance limitations observed: "
    
    # Add pros
    for i, pro in enumerate(pros[:5], 1):
        pros_text += f"{i}. {pro.get('title', '')} - {pro.get('description', '')} "
    
    # Add cons
    for i, con in enumerate(cons[:5], 1):
        cons_text += f"{i}. {con.get('title', '')} - {con.get('description', '')} "
    
    return {
        'title': 'Pros and Cons',
        'content': f"{pros_text}\n\n{cons_text}",
        'word_count': len(pros_text.split()) + len(cons_text.split()),
        'pros_count': len(pros),
        'cons_count': len(cons),
        'top_pros': [pro.get('title') for pro in pros[:3]],
        'top_cons': [con.get('title') for con in cons[:3]]
    }

def _generate_use_cases_section(
    use_cases: List[Dict[str, Any]],
    product_info: Dict[str, Any],
    writing_style: str
) -> Dict[str, Any]:
    """Generate use cases section."""
    product_name = product_info.get('name', 'this product')
    
    if writing_style == 'professional':
        intro_text = f"{product_name} is well-suited for several business scenarios: "
    elif writing_style == 'casual':
        intro_text = f"Here are some great ways to use {product_name}: "
    else:  # technical
        intro_text = f"Optimal deployment scenarios for {product_name} include: "
    
    use_cases_text = intro_text
    
    for i, use_case in enumerate(use_cases[:3], 1):
        title = use_case.get('title', '')
        description = use_case.get('detailed_description', '')
        complexity = use_case.get('complexity', 'medium')
        time_to_value = use_case.get('time_to_value', '1-2 months')
        
        use_cases_text += f"{i}. {title} - {description} This is a {complexity} complexity implementation with {time_to_value} time to value. "
    
    return {
        'title': 'Use Cases',
        'content': use_cases_text,
        'word_count': len(use_cases_text.split()),
        'use_cases_count': len(use_cases),
        'top_use_cases': [uc.get('title') for uc in use_cases[:3]]
    }

def _generate_conclusion(
    product_info: Dict[str, Any],
    scores: List[Dict[str, Any]],
    pros: List[Dict[str, Any]],
    cons: List[Dict[str, Any]],
    use_cases: List[Dict[str, Any]],
    target_audience: Optional[str],
    writing_style: str
) -> Dict[str, Any]:
    """Generate conclusion section."""
    product_name = product_info.get('name', 'this product')
    overall_score = sum(s.get('weightedScore', 0) for s in scores) if scores else 0
    
    if writing_style == 'professional':
        conclusion_text = f"In conclusion, {product_name} represents a {overall_score:.1%} performing solution that offers significant value for the right use cases. "
    elif writing_style == 'casual':
        conclusion_text = f"Overall, {product_name} is a solid {overall_score:.1%} performer that could be a great fit for your needs. "
    else:  # technical
        conclusion_text = f"Evaluation results indicate {product_name} achieves {overall_score:.1%} aggregate performance across measured criteria. "
    
    if len(pros) > len(cons):
        conclusion_text += "The product's strengths outweigh its limitations, making it a viable option for many organizations. "
    elif len(cons) > len(pros):
        conclusion_text += "While the product has merit, the identified limitations should be carefully considered before adoption. "
    else:
        conclusion_text += "The product offers a balanced set of advantages and challenges that should be evaluated against specific requirements. "
    
    if target_audience:
        conclusion_text += f"This solution is particularly well-suited for {target_audience} users. "
    
    return {
        'title': 'Conclusion',
        'content': conclusion_text,
        'word_count': len(conclusion_text.split()),
        'overall_score': overall_score,
        'recommendation': 'recommended' if overall_score >= 0.7 else ('consider' if overall_score >= 0.5 else 'not recommended')
    }

def _generate_recommendations(
    product_info: Dict[str, Any],
    scores: List[Dict[str, Any]],
    pros: List[Dict[str, Any]],
    cons: List[Dict[str, Any]],
    use_cases: List[Dict[str, Any]],
    target_audience: Optional[str]
) -> Dict[str, Any]:
    """Generate recommendations section."""
    product_name = product_info.get('name', 'this product')
    overall_score = sum(s.get('weightedScore', 0) for s in scores) if scores else 0
    
    recommendations_text = f"Based on our comprehensive analysis, here are our recommendations for {product_name}: "
    
    if overall_score >= 0.8:
        recommendations_text += "Strongly recommend for organizations seeking a high-performing solution. "
    elif overall_score >= 0.6:
        recommendations_text += "Recommend for organizations with moderate requirements and budget flexibility. "
    elif overall_score >= 0.4:
        recommendations_text += "Consider for specific use cases where the product's strengths align with your needs. "
    else:
        recommendations_text += "Not recommended unless specific circumstances require this particular solution. "
    
    # Add specific recommendations
    if pros:
        top_pro = pros[0].get('title', '')
        recommendations_text += f"Leverage the product's {top_pro} capabilities for maximum benefit. "
    
    if cons:
        top_con = cons[0].get('title', '')
        recommendations_text += f"Address the {top_con} limitation through proper planning and implementation. "
    
    if use_cases:
        top_use_case = use_cases[0].get('title', '')
        recommendations_text += f"Focus on the {top_use_case} use case for optimal ROI. "
    
    return {
        'title': 'Recommendations',
        'content': recommendations_text,
        'word_count': len(recommendations_text.split()),
        'recommendation_level': 'strong' if overall_score >= 0.8 else ('moderate' if overall_score >= 0.6 else 'weak'),
        'key_actions': [
            f"Focus on {pros[0].get('title', 'strengths')}" if pros else "Identify key strengths",
            f"Address {cons[0].get('title', 'limitations')}" if cons else "Plan for limitations",
            f"Implement {use_cases[0].get('title', 'use cases')}" if use_cases else "Define use cases"
        ]
    }

def _calculate_total_words(sections: List[Dict[str, Any]]) -> int:
    """Calculate total word count across all sections."""
    total = 0
    for section in sections:
        if isinstance(section, dict) and 'word_count' in section:
            total += section['word_count']
    return total
