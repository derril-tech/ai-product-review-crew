import structlog
from celery import shared_task
from typing import List, Dict, Any, Optional
import json
import re

logger = structlog.get_logger()

@shared_task(bind=True, name='usecase_recommender.recommend')
def recommend_use_cases(
    self,
    review_id: str,
    product_id: str,
    claims: List[Dict[str, Any]],
    scores: List[Dict[str, Any]],
    product_info: Dict[str, Any],
    target_audience: Optional[str] = None
) -> Dict[str, Any]:
    """
    Recommend use cases for a product based on its features, claims, and scores.
    
    Args:
        review_id: Review identifier
        product_id: Product identifier
        claims: List of extracted claims for the product
        scores: List of scores for the product across criteria
        product_info: Basic product information (name, category, etc.)
        target_audience: Optional target audience (e.g., 'small-business', 'enterprise', 'individual')
    
    Returns:
        Dictionary containing recommended use cases and metadata
    """
    try:
        logger.info("Starting use case recommendation", 
                   review_id=review_id, 
                   product_id=product_id,
                   claims_count=len(claims),
                   target_audience=target_audience)
        
        # Extract product features and capabilities
        features = _extract_features(claims)
        capabilities = _analyze_capabilities(claims, scores)
        
        # Generate use cases based on product category
        category = product_info.get('category', '').lower()
        base_use_cases = _get_category_use_cases(category, features, capabilities)
        
        # Filter and rank use cases based on target audience
        if target_audience:
            use_cases = _filter_by_audience(base_use_cases, target_audience, product_info)
        else:
            use_cases = base_use_cases
        
        # Score use cases based on product fit
        scored_use_cases = _score_use_cases(use_cases, claims, scores, product_info)
        
        # Generate detailed use case descriptions
        detailed_use_cases = _generate_detailed_use_cases(scored_use_cases, claims, product_info)
        
        # Identify ideal customer profiles
        ideal_customers = _identify_ideal_customers(detailed_use_cases, product_info)
        
        result = {
            'review_id': review_id,
            'product_id': product_id,
            'use_cases': detailed_use_cases,
            'ideal_customers': ideal_customers,
            'metadata': {
                'features_analyzed': len(features),
                'capabilities_identified': len(capabilities),
                'use_cases_generated': len(detailed_use_cases),
                'target_audience': target_audience,
                'category': category
            }
        }
        
        logger.info("Use case recommendation completed", 
                   review_id=review_id,
                   product_id=product_id,
                   use_cases_count=len(detailed_use_cases),
                   ideal_customers_count=len(ideal_customers))
        
        return result
        
    except Exception as e:
        logger.error("Error in use case recommendation", 
                    review_id=review_id,
                    product_id=product_id,
                    error=str(e))
        raise self.retry(countdown=60, max_retries=3)

def _extract_features(claims: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Extract product features from claims."""
    features = []
    
    for claim in claims:
        if claim.get('type') == 'feature':
            features.append({
                'name': claim.get('key', ''),
                'description': claim.get('value', ''),
                'confidence': claim.get('confidence', 'medium'),
                'source': claim.get('source', '')
            })
    
    return features

def _analyze_capabilities(claims: List[Dict[str, Any]], scores: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Analyze product capabilities based on claims and scores."""
    capabilities = []
    
    # Analyze performance capabilities
    performance_score = next((s.get('normalizedScore', 0) for s in scores if 'performance' in s.get('criterionId', '').lower()), 0)
    if performance_score > 0.6:
        capabilities.append({
            'type': 'performance',
            'level': 'high' if performance_score > 0.8 else 'medium',
            'description': 'High-performance processing capabilities',
            'score': performance_score
        })
    
    # Analyze scalability capabilities
    scalability_claims = [c for c in claims if any(word in c.get('key', '').lower() for word in ['scale', 'enterprise', 'large', 'volume'])]
    if scalability_claims:
        capabilities.append({
            'type': 'scalability',
            'level': 'high',
            'description': 'Scalable for enterprise use',
            'evidence': scalability_claims
        })
    
    # Analyze ease of use
    usability_score = next((s.get('normalizedScore', 0) for s in scores if 'ease' in s.get('criterionId', '').lower() or 'usability' in s.get('criterionId', '').lower()), 0)
    if usability_score > 0.6:
        capabilities.append({
            'type': 'usability',
            'level': 'high' if usability_score > 0.8 else 'medium',
            'description': 'User-friendly interface and workflow',
            'score': usability_score
        })
    
    return capabilities

def _get_category_use_cases(category: str, features: List[Dict], capabilities: List[Dict]) -> List[Dict[str, Any]]:
    """Get use cases based on product category."""
    use_cases = []
    
    # AI/ML Tools
    if 'ai' in category or 'artificial intelligence' in category or 'machine learning' in category:
        use_cases.extend([
            {
                'id': 'ai_content_generation',
                'title': 'AI Content Generation',
                'description': 'Generate high-quality content using artificial intelligence',
                'audience': ['content-creators', 'marketers', 'businesses'],
                'complexity': 'medium',
                'requirements': ['ai-capabilities', 'content-tools'],
                'benefits': ['time-savings', 'quality-improvement', 'scalability']
            },
            {
                'id': 'data_analysis',
                'title': 'Data Analysis & Insights',
                'description': 'Analyze large datasets and extract meaningful insights',
                'audience': ['data-scientists', 'analysts', 'enterprise'],
                'complexity': 'high',
                'requirements': ['ai-capabilities', 'data-processing'],
                'benefits': ['insights', 'automation', 'accuracy']
            },
            {
                'id': 'automation',
                'title': 'Process Automation',
                'description': 'Automate repetitive tasks and workflows',
                'audience': ['businesses', 'enterprise', 'developers'],
                'complexity': 'medium',
                'requirements': ['automation-capabilities', 'integration'],
                'benefits': ['efficiency', 'cost-reduction', 'accuracy']
            }
        ])
    
    # Video Editing
    elif 'video' in category or 'editing' in category:
        use_cases.extend([
            {
                'id': 'video_editing',
                'title': 'Professional Video Editing',
                'description': 'Create and edit professional-quality videos',
                'audience': ['content-creators', 'filmmakers', 'marketers'],
                'complexity': 'medium',
                'requirements': ['video-tools', 'performance'],
                'benefits': ['quality', 'efficiency', 'professional-results']
            },
            {
                'id': 'social_media_content',
                'title': 'Social Media Content Creation',
                'description': 'Create engaging content for social media platforms',
                'audience': ['content-creators', 'marketers', 'small-business'],
                'complexity': 'low',
                'requirements': ['video-tools', 'templates'],
                'benefits': ['engagement', 'brand-awareness', 'time-savings']
            },
            {
                'id': 'educational_content',
                'title': 'Educational Content Production',
                'description': 'Create educational videos and tutorials',
                'audience': ['educators', 'trainers', 'businesses'],
                'complexity': 'medium',
                'requirements': ['video-tools', 'usability'],
                'benefits': ['learning', 'engagement', 'accessibility']
            }
        ])
    
    # Business Software
    elif 'business' in category or 'enterprise' in category or 'saas' in category:
        use_cases.extend([
            {
                'id': 'project_management',
                'title': 'Project Management',
                'description': 'Manage projects, tasks, and team collaboration',
                'audience': ['project-managers', 'teams', 'businesses'],
                'complexity': 'medium',
                'requirements': ['collaboration-tools', 'usability'],
                'benefits': ['organization', 'collaboration', 'efficiency']
            },
            {
                'id': 'customer_relationship',
                'title': 'Customer Relationship Management',
                'description': 'Manage customer interactions and relationships',
                'audience': ['sales-teams', 'businesses', 'enterprise'],
                'complexity': 'medium',
                'requirements': ['crm-capabilities', 'integration'],
                'benefits': ['customer-retention', 'sales-growth', 'insights']
            },
            {
                'id': 'business_analytics',
                'title': 'Business Analytics',
                'description': 'Analyze business data and generate reports',
                'audience': ['businesses', 'enterprise', 'analysts'],
                'complexity': 'high',
                'requirements': ['analytics-capabilities', 'data-processing'],
                'benefits': ['insights', 'decision-making', 'optimization']
            }
        ])
    
    # Development Tools
    elif 'development' in category or 'programming' in category or 'code' in category:
        use_cases.extend([
            {
                'id': 'code_development',
                'title': 'Software Development',
                'description': 'Develop and maintain software applications',
                'audience': ['developers', 'teams', 'enterprise'],
                'complexity': 'high',
                'requirements': ['development-tools', 'performance'],
                'benefits': ['productivity', 'quality', 'collaboration']
            },
            {
                'id': 'code_review',
                'title': 'Code Review & Quality Assurance',
                'description': 'Review code and ensure quality standards',
                'audience': ['developers', 'teams', 'enterprise'],
                'complexity': 'medium',
                'requirements': ['review-tools', 'integration'],
                'benefits': ['quality', 'learning', 'consistency']
            },
            {
                'id': 'testing_automation',
                'title': 'Testing & Automation',
                'description': 'Automate testing processes and quality assurance',
                'audience': ['developers', 'qa-teams', 'enterprise'],
                'complexity': 'medium',
                'requirements': ['testing-tools', 'automation'],
                'benefits': ['reliability', 'efficiency', 'coverage']
            }
        ])
    
    # Default use cases for any category
    else:
        use_cases.extend([
            {
                'id': 'productivity_improvement',
                'title': 'Productivity Improvement',
                'description': 'Improve overall productivity and efficiency',
                'audience': ['individuals', 'small-business', 'enterprise'],
                'complexity': 'low',
                'requirements': ['usability', 'integration'],
                'benefits': ['efficiency', 'time-savings', 'organization']
            },
            {
                'id': 'cost_reduction',
                'title': 'Cost Reduction',
                'description': 'Reduce operational costs and improve ROI',
                'audience': ['businesses', 'enterprise'],
                'complexity': 'medium',
                'requirements': ['analytics', 'automation'],
                'benefits': ['cost-savings', 'efficiency', 'roi']
            }
        ])
    
    return use_cases

def _filter_by_audience(use_cases: List[Dict], target_audience: str, product_info: Dict) -> List[Dict]:
    """Filter use cases based on target audience."""
    audience_mapping = {
        'individual': ['individuals', 'content-creators', 'developers'],
        'small-business': ['small-business', 'content-creators', 'marketers'],
        'enterprise': ['enterprise', 'businesses', 'teams'],
        'developers': ['developers', 'teams'],
        'marketers': ['marketers', 'content-creators', 'small-business']
    }
    
    target_audiences = audience_mapping.get(target_audience, [target_audience])
    
    filtered_cases = []
    for use_case in use_cases:
        if any(audience in use_case.get('audience', []) for audience in target_audiences):
            filtered_cases.append(use_case)
    
    return filtered_cases

def _score_use_cases(use_cases: List[Dict], claims: List[Dict], scores: List[Dict], product_info: Dict) -> List[Dict]:
    """Score use cases based on product fit."""
    scored_cases = []
    
    for use_case in use_cases:
        score = 0.0
        requirements = use_case.get('requirements', [])
        
        # Score based on feature match
        feature_match_score = _calculate_feature_match(requirements, claims)
        score += feature_match_score * 0.4
        
        # Score based on performance capabilities
        performance_score = _calculate_performance_score(requirements, scores)
        score += performance_score * 0.3
        
        # Score based on usability
        usability_score = _calculate_usability_score(use_case, scores)
        score += usability_score * 0.2
        
        # Score based on pricing fit
        pricing_score = _calculate_pricing_score(use_case, claims, product_info)
        score += pricing_score * 0.1
        
        scored_cases.append({
            **use_case,
            'fit_score': score,
            'feature_match': feature_match_score,
            'performance_score': performance_score,
            'usability_score': usability_score,
            'pricing_score': pricing_score
        })
    
    # Sort by fit score
    scored_cases.sort(key=lambda x: x['fit_score'], reverse=True)
    return scored_cases

def _calculate_feature_match(requirements: List[str], claims: List[Dict]) -> float:
    """Calculate feature match score."""
    if not requirements:
        return 0.5
    
    matches = 0
    for requirement in requirements:
        for claim in claims:
            if requirement.lower() in claim.get('key', '').lower() or requirement.lower() in claim.get('value', '').lower():
                matches += 1
                break
    
    return matches / len(requirements)

def _calculate_performance_score(requirements: List[str], scores: List[Dict]) -> float:
    """Calculate performance score."""
    performance_requirements = [r for r in requirements if 'performance' in r or 'speed' in r]
    if not performance_requirements:
        return 0.5
    
    performance_scores = [s.get('normalizedScore', 0) for s in scores if 'performance' in s.get('criterionId', '').lower()]
    return sum(performance_scores) / len(performance_scores) if performance_scores else 0.5

def _calculate_usability_score(use_case: Dict, scores: List[Dict]) -> float:
    """Calculate usability score."""
    complexity = use_case.get('complexity', 'medium')
    complexity_weights = {'low': 0.8, 'medium': 0.6, 'high': 0.4}
    
    usability_scores = [s.get('normalizedScore', 0) for s in scores if 'ease' in s.get('criterionId', '').lower() or 'usability' in s.get('criterionId', '').lower()]
    base_score = sum(usability_scores) / len(usability_scores) if usability_scores else 0.5
    
    return base_score * complexity_weights.get(complexity, 0.6)

def _calculate_pricing_score(use_case: Dict, claims: List[Dict], product_info: Dict) -> float:
    """Calculate pricing fit score."""
    # This is a simplified scoring - in practice, you'd want more sophisticated pricing analysis
    pricing_claims = [c for c in claims if c.get('type') == 'pricing']
    
    if not pricing_claims:
        return 0.5
    
    # Assume moderate pricing is good for most use cases
    return 0.7

def _generate_detailed_use_cases(scored_use_cases: List[Dict], claims: List[Dict], product_info: Dict) -> List[Dict]:
    """Generate detailed use case descriptions."""
    detailed_cases = []
    
    for use_case in scored_use_cases[:5]:  # Top 5 use cases
        # Find supporting evidence
        supporting_claims = _find_supporting_claims_for_use_case(use_case, claims)
        
        # Generate detailed description
        detailed_description = _generate_use_case_description(use_case, supporting_claims, product_info)
        
        # Generate implementation steps
        implementation_steps = _generate_implementation_steps(use_case, supporting_claims)
        
        detailed_cases.append({
            **use_case,
            'detailed_description': detailed_description,
            'implementation_steps': implementation_steps,
            'supporting_evidence': supporting_claims,
            'estimated_roi': _estimate_roi(use_case, supporting_claims),
            'time_to_value': _estimate_time_to_value(use_case)
        })
    
    return detailed_cases

def _find_supporting_claims_for_use_case(use_case: Dict, claims: List[Dict]) -> List[Dict]:
    """Find claims that support a specific use case."""
    supporting_claims = []
    requirements = use_case.get('requirements', [])
    
    for claim in claims:
        claim_text = f"{claim.get('key', '')} {claim.get('value', '')}".lower()
        for requirement in requirements:
            if requirement.lower() in claim_text:
                supporting_claims.append(claim)
                break
    
    return supporting_claims

def _generate_use_case_description(use_case: Dict, supporting_claims: List[Dict], product_info: Dict) -> str:
    """Generate a detailed description for a use case."""
    title = use_case.get('title', '')
    base_description = use_case.get('description', '')
    
    # Add product-specific details
    product_name = product_info.get('name', 'this product')
    
    description = f"{base_description} using {product_name}. "
    
    if supporting_claims:
        key_features = [claim.get('key', '') for claim in supporting_claims[:3]]
        description += f"Key features include: {', '.join(key_features)}. "
    
    benefits = use_case.get('benefits', [])
    if benefits:
        description += f"Benefits include: {', '.join(benefits)}."
    
    return description

def _generate_implementation_steps(use_case: Dict, supporting_claims: List[Dict]) -> List[str]:
    """Generate implementation steps for a use case."""
    complexity = use_case.get('complexity', 'medium')
    
    if complexity == 'low':
        return [
            "Sign up for the product",
            "Complete basic setup and configuration",
            "Start using core features immediately",
            "Explore advanced features as needed"
        ]
    elif complexity == 'medium':
        return [
            "Sign up for the product",
            "Complete initial setup and configuration",
            "Import or create your first project",
            "Configure integrations and workflows",
            "Train team members on key features",
            "Begin regular usage and optimization"
        ]
    else:  # high complexity
        return [
            "Sign up for enterprise plan",
            "Complete comprehensive setup and configuration",
            "Configure enterprise integrations and security",
            "Train administrators and power users",
            "Implement custom workflows and processes",
            "Establish monitoring and optimization procedures",
            "Scale usage across organization"
        ]

def _estimate_roi(use_case: Dict, supporting_claims: List[Dict]) -> Dict[str, Any]:
    """Estimate ROI for a use case."""
    complexity = use_case.get('complexity', 'medium')
    benefits = use_case.get('benefits', [])
    
    # Simplified ROI estimation
    roi_multipliers = {
        'low': {'time_savings': 0.2, 'cost_reduction': 0.15, 'productivity': 0.25},
        'medium': {'time_savings': 0.35, 'cost_reduction': 0.25, 'productivity': 0.4},
        'high': {'time_savings': 0.5, 'cost_reduction': 0.4, 'productivity': 0.6}
    }
    
    multipliers = roi_multipliers.get(complexity, roi_multipliers['medium'])
    
    estimated_roi = {
        'time_savings_percentage': multipliers['time_savings'] * 100,
        'cost_reduction_percentage': multipliers['cost_reduction'] * 100,
        'productivity_increase_percentage': multipliers['productivity'] * 100,
        'payback_period_months': 6 if complexity == 'low' else (12 if complexity == 'medium' else 18),
        'confidence': 'medium'
    }
    
    return estimated_roi

def _estimate_time_to_value(use_case: Dict) -> str:
    """Estimate time to value for a use case."""
    complexity = use_case.get('complexity', 'medium')
    
    time_estimates = {
        'low': '1-2 weeks',
        'medium': '1-2 months',
        'high': '3-6 months'
    }
    
    return time_estimates.get(complexity, '1-2 months')

def _identify_ideal_customers(detailed_use_cases: List[Dict], product_info: Dict) -> List[Dict]:
    """Identify ideal customer profiles."""
    ideal_customers = []
    
    # Analyze use cases to identify customer segments
    customer_segments = set()
    for use_case in detailed_use_cases:
        customer_segments.update(use_case.get('audience', []))
    
    for segment in customer_segments:
        customer_profile = _generate_customer_profile(segment, detailed_use_cases, product_info)
        ideal_customers.append(customer_profile)
    
    return ideal_customers

def _generate_customer_profile(segment: str, use_cases: List[Dict], product_info: Dict) -> Dict[str, Any]:
    """Generate a customer profile for a segment."""
    segment_profiles = {
        'individuals': {
            'title': 'Individual Users',
            'description': 'Individual professionals and creators',
            'company_size': '1-10',
            'budget_range': '$10-100/month',
            'pain_points': ['time constraints', 'limited resources', 'need for efficiency'],
            'success_metrics': ['time savings', 'quality improvement', 'cost reduction']
        },
        'small-business': {
            'title': 'Small Businesses',
            'description': 'Small to medium-sized businesses',
            'company_size': '10-100',
            'budget_range': '$100-1000/month',
            'pain_points': ['limited budget', 'resource constraints', 'need for growth'],
            'success_metrics': ['cost reduction', 'efficiency gains', 'revenue growth']
        },
        'enterprise': {
            'title': 'Enterprise Organizations',
            'description': 'Large enterprise organizations',
            'company_size': '100+',
            'budget_range': '$1000+/month',
            'pain_points': ['complexity', 'integration needs', 'scalability requirements'],
            'success_metrics': ['ROI', 'scalability', 'compliance']
        },
        'developers': {
            'title': 'Development Teams',
            'description': 'Software development teams and organizations',
            'company_size': '5-500',
            'budget_range': '$50-5000/month',
            'pain_points': ['development speed', 'code quality', 'team collaboration'],
            'success_metrics': ['productivity', 'code quality', 'deployment speed']
        },
        'marketers': {
            'title': 'Marketing Teams',
            'description': 'Marketing professionals and teams',
            'company_size': '1-100',
            'budget_range': '$50-2000/month',
            'pain_points': ['content creation', 'campaign management', 'ROI measurement'],
            'success_metrics': ['engagement', 'conversion rates', 'brand awareness']
        }
    }
    
    base_profile = segment_profiles.get(segment, {
        'title': segment.title(),
        'description': f'{segment.title()} users',
        'company_size': 'Unknown',
        'budget_range': 'Variable',
        'pain_points': [],
        'success_metrics': []
    })
    
    # Find relevant use cases for this segment
    relevant_use_cases = [uc for uc in use_cases if segment in uc.get('audience', [])]
    
    return {
        **base_profile,
        'segment': segment,
        'relevant_use_cases': [uc['id'] for uc in relevant_use_cases],
        'fit_score': sum(uc['fit_score'] for uc in relevant_use_cases) / len(relevant_use_cases) if relevant_use_cases else 0
    }
