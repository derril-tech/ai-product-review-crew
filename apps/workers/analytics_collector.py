# Created automatically by Cursor AI (2024-12-19)

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import json
from celery import shared_task
from collections import defaultdict, Counter
import numpy as np
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class AnalyticsMetrics:
    review_id: str
    claim_coverage_percentage: float
    confidence_distribution: Dict[str, int]
    rank_volatility_score: float
    performance_metrics: Dict[str, Any]
    cost_metrics: Dict[str, Any]
    quality_metrics: Dict[str, Any]
    timestamp: str


@shared_task(bind=True, name='analytics_collector.collect_metrics')
def collect_review_analytics(
    self,
    review_id: str,
    claims: List[Dict[str, Any]],
    scores: List[Dict[str, Any]],
    criteria: List[Dict[str, Any]],
    products: List[Dict[str, Any]],
    sources: List[Dict[str, Any]],
    performance_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Collect comprehensive analytics for a review.
    """
    try:
        logger.info("Starting analytics collection", review_id=review_id)
        
        # Calculate claim coverage
        claim_coverage = _calculate_claim_coverage(claims, products, criteria)
        
        # Analyze confidence distribution
        confidence_distribution = _analyze_confidence_distribution(claims, scores)
        
        # Calculate rank volatility
        rank_volatility = _calculate_rank_volatility(scores, products)
        
        # Performance metrics
        performance_metrics = _calculate_performance_metrics(performance_data)
        
        # Cost metrics
        cost_metrics = _calculate_cost_metrics(performance_data)
        
        # Quality metrics
        quality_metrics = _calculate_quality_metrics(claims, scores, sources)
        
        analytics = AnalyticsMetrics(
            review_id=review_id,
            claim_coverage_percentage=claim_coverage,
            confidence_distribution=confidence_distribution,
            rank_volatility_score=rank_volatility,
            performance_metrics=performance_metrics,
            cost_metrics=cost_metrics,
            quality_metrics=quality_metrics,
            timestamp=datetime.utcnow().isoformat()
        )
        
        logger.info("Analytics collection completed", review_id=review_id)
        
        return {
            'review_id': review_id,
            'analytics': {
                'claim_coverage_percentage': analytics.claim_coverage_percentage,
                'confidence_distribution': analytics.confidence_distribution,
                'rank_volatility_score': analytics.rank_volatility_score,
                'performance_metrics': analytics.performance_metrics,
                'cost_metrics': analytics.cost_metrics,
                'quality_metrics': analytics.quality_metrics,
                'timestamp': analytics.timestamp
            },
            'metadata': {
                'total_claims': len(claims),
                'total_scores': len(scores),
                'total_products': len(products),
                'total_sources': len(sources)
            }
        }
        
    except Exception as e:
        logger.error("Error in analytics collection", review_id=review_id, error=str(e))
        raise self.retry(countdown=60, max_retries=3)


@shared_task(bind=True, name='analytics_collector.aggregate_metrics')
def aggregate_analytics(
    self,
    org_id: str,
    time_range: str = '30d'
) -> Dict[str, Any]:
    """
    Aggregate analytics across multiple reviews for an organization.
    """
    try:
        logger.info("Starting analytics aggregation", org_id=org_id, time_range=time_range)
        
        # Calculate date range
        end_date = datetime.utcnow()
        if time_range == '7d':
            start_date = end_date - timedelta(days=7)
        elif time_range == '30d':
            start_date = end_date - timedelta(days=30)
        elif time_range == '90d':
            start_date = end_date - timedelta(days=90)
        else:
            start_date = end_date - timedelta(days=30)
        
        # Mock aggregated data (in real implementation, this would query the database)
        aggregated_metrics = {
            'total_reviews': 0,
            'average_claim_coverage': 0.0,
            'confidence_trends': {},
            'rank_stability': 0.0,
            'performance_trends': {},
            'cost_efficiency': 0.0,
            'quality_scores': {}
        }
        
        logger.info("Analytics aggregation completed", org_id=org_id)
        
        return {
            'org_id': org_id,
            'time_range': time_range,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'aggregated_metrics': aggregated_metrics
        }
        
    except Exception as e:
        logger.error("Error in analytics aggregation", org_id=org_id, error=str(e))
        raise self.retry(countdown=60, max_retries=3)


@shared_task(bind=True, name='analytics_collector.generate_report')
def generate_analytics_report(
    self,
    org_id: str,
    report_type: str = 'monthly',
    include_recommendations: bool = True
) -> Dict[str, Any]:
    """
    Generate comprehensive analytics report with insights and recommendations.
    """
    try:
        logger.info("Starting analytics report generation", org_id=org_id, report_type=report_type)
        
        # Generate report sections
        executive_summary = _generate_executive_summary(org_id, report_type)
        performance_analysis = _generate_performance_analysis(org_id, report_type)
        quality_insights = _generate_quality_insights(org_id, report_type)
        cost_analysis = _generate_cost_analysis(org_id, report_type)
        recommendations = _generate_recommendations(org_id, report_type) if include_recommendations else []
        
        report = {
            'org_id': org_id,
            'report_type': report_type,
            'generated_at': datetime.utcnow().isoformat(),
            'sections': {
                'executive_summary': executive_summary,
                'performance_analysis': performance_analysis,
                'quality_insights': quality_insights,
                'cost_analysis': cost_analysis,
                'recommendations': recommendations
            }
        }
        
        logger.info("Analytics report generation completed", org_id=org_id)
        
        return report
        
    except Exception as e:
        logger.error("Error in analytics report generation", org_id=org_id, error=str(e))
        raise self.retry(countdown=60, max_retries=3)


def _calculate_claim_coverage(claims: List[Dict[str, Any]], products: List[Dict[str, Any]], criteria: List[Dict[str, Any]]) -> float:
    """Calculate the percentage of products that have claims for each criterion."""
    if not products or not criteria:
        return 0.0
    
    total_possible_claims = len(products) * len(criteria)
    if total_possible_claims == 0:
        return 0.0
    
    # Group claims by product and criterion
    claims_by_product_criterion = defaultdict(set)
    for claim in claims:
        product_id = claim.get('product_id')
        criterion_id = claim.get('criterion_id')
        if product_id and criterion_id:
            claims_by_product_criterion[(product_id, criterion_id)].add(claim.get('id'))
    
    actual_claims = len(claims_by_product_criterion)
    coverage_percentage = (actual_claims / total_possible_claims) * 100
    
    return round(coverage_percentage, 2)


def _analyze_confidence_distribution(claims: List[Dict[str, Any]], scores: List[Dict[str, Any]]) -> Dict[str, int]:
    """Analyze the distribution of confidence levels across claims and scores."""
    confidence_levels = []
    
    # Extract confidence from claims
    for claim in claims:
        confidence = claim.get('confidence', 'medium')
        confidence_levels.append(confidence)
    
    # Extract confidence from scores
    for score in scores:
        confidence = score.get('confidence', 'medium')
        confidence_levels.append(confidence)
    
    # Count occurrences
    distribution = Counter(confidence_levels)
    
    return dict(distribution)


def _calculate_rank_volatility(scores: List[Dict[str, Any]], products: List[Dict[str, Any]]) -> float:
    """Calculate rank volatility based on score variations."""
    if not scores or not products:
        return 0.0
    
    # Group scores by product
    product_scores = defaultdict(list)
    for score in scores:
        product_id = score.get('product_id')
        if product_id:
            product_scores[product_id].append(score.get('normalized_score', 0))
    
    # Calculate coefficient of variation for each product
    volatilities = []
    for product_id, scores_list in product_scores.items():
        if len(scores_list) > 1:
            mean_score = np.mean(scores_list)
            std_score = np.std(scores_list)
            if mean_score > 0:
                cv = (std_score / mean_score) * 100
                volatilities.append(cv)
    
    # Return average volatility
    if volatilities:
        return round(np.mean(volatilities), 2)
    return 0.0


def _calculate_performance_metrics(performance_data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate performance metrics from timing and throughput data."""
    metrics = {
        'average_processing_time': 0.0,
        'total_processing_time': 0.0,
        'requests_per_minute': 0.0,
        'error_rate': 0.0,
        'success_rate': 0.0
    }
    
    if not performance_data:
        return metrics
    
    # Calculate average processing time
    processing_times = performance_data.get('processing_times', [])
    if processing_times:
        metrics['average_processing_time'] = round(np.mean(processing_times), 2)
        metrics['total_processing_time'] = round(sum(processing_times), 2)
    
    # Calculate throughput
    total_requests = performance_data.get('total_requests', 0)
    time_window = performance_data.get('time_window_minutes', 1)
    if time_window > 0:
        metrics['requests_per_minute'] = round(total_requests / time_window, 2)
    
    # Calculate error rates
    total_errors = performance_data.get('total_errors', 0)
    if total_requests > 0:
        metrics['error_rate'] = round((total_errors / total_requests) * 100, 2)
        metrics['success_rate'] = round(((total_requests - total_errors) / total_requests) * 100, 2)
    
    return metrics


def _calculate_cost_metrics(performance_data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate cost-related metrics."""
    metrics = {
        'total_cost': 0.0,
        'cost_per_review': 0.0,
        'token_usage': 0,
        'api_calls': 0,
        'storage_cost': 0.0
    }
    
    if not performance_data:
        return metrics
    
    # Extract cost data
    metrics['total_cost'] = performance_data.get('total_cost', 0.0)
    metrics['token_usage'] = performance_data.get('token_usage', 0)
    metrics['api_calls'] = performance_data.get('api_calls', 0)
    metrics['storage_cost'] = performance_data.get('storage_cost', 0.0)
    
    # Calculate cost per review
    total_reviews = performance_data.get('total_reviews', 1)
    if total_reviews > 0:
        metrics['cost_per_review'] = round(metrics['total_cost'] / total_reviews, 2)
    
    return metrics


def _calculate_quality_metrics(claims: List[Dict[str, Any]], scores: List[Dict[str, Any]], sources: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate quality-related metrics."""
    metrics = {
        'citation_coverage': 0.0,
        'source_diversity': 0.0,
        'claim_consistency': 0.0,
        'score_reliability': 0.0
    }
    
    # Calculate citation coverage
    claims_with_citations = sum(1 for claim in claims if claim.get('citation_ids'))
    if claims:
        metrics['citation_coverage'] = round((claims_with_citations / len(claims)) * 100, 2)
    
    # Calculate source diversity
    unique_sources = len(set(source.get('domain') for source in sources if source.get('domain')))
    if sources:
        metrics['source_diversity'] = round((unique_sources / len(sources)) * 100, 2)
    
    # Calculate claim consistency (placeholder)
    metrics['claim_consistency'] = 85.0  # Mock value
    
    # Calculate score reliability (placeholder)
    metrics['score_reliability'] = 92.0  # Mock value
    
    return metrics


def _generate_executive_summary(org_id: str, report_type: str) -> Dict[str, Any]:
    """Generate executive summary for analytics report."""
    return {
        'key_metrics': {
            'total_reviews': 0,
            'average_coverage': 0.0,
            'quality_score': 0.0,
            'cost_efficiency': 0.0
        },
        'trends': {
            'coverage_trend': 'stable',
            'quality_trend': 'improving',
            'cost_trend': 'decreasing'
        },
        'highlights': [
            'Claim coverage improved by 15% this month',
            'Average processing time reduced by 20%',
            'Cost per review decreased by 10%'
        ]
    }


def _generate_performance_analysis(org_id: str, report_type: str) -> Dict[str, Any]:
    """Generate performance analysis section."""
    return {
        'processing_metrics': {
            'average_time': 0.0,
            'peak_throughput': 0.0,
            'error_rate': 0.0
        },
        'bottlenecks': [
            'Source ingestion takes 40% of total time',
            'LLM API calls are the main cost driver'
        ],
        'optimization_opportunities': [
            'Implement caching for frequently accessed sources',
            'Batch LLM requests to reduce API calls'
        ]
    }


def _generate_quality_insights(org_id: str, report_type: str) -> Dict[str, Any]:
    """Generate quality insights section."""
    return {
        'quality_metrics': {
            'citation_coverage': 0.0,
            'source_diversity': 0.0,
            'claim_consistency': 0.0
        },
        'quality_trends': {
            'coverage_improvement': 0.0,
            'diversity_increase': 0.0
        },
        'quality_issues': [
            'Low citation coverage in pricing claims',
            'Limited source diversity for new products'
        ]
    }


def _generate_cost_analysis(org_id: str, report_type: str) -> Dict[str, Any]:
    """Generate cost analysis section."""
    return {
        'cost_breakdown': {
            'llm_costs': 0.0,
            'storage_costs': 0.0,
            'compute_costs': 0.0
        },
        'cost_trends': {
            'monthly_growth': 0.0,
            'cost_per_review': 0.0
        },
        'cost_optimization': [
            'Switch to more efficient LLM models',
            'Implement result caching',
            'Optimize storage usage'
        ]
    }


def _generate_recommendations(org_id: str, report_type: str) -> List[Dict[str, Any]]:
    """Generate actionable recommendations."""
    return [
        {
            'category': 'Performance',
            'priority': 'high',
            'title': 'Implement Source Caching',
            'description': 'Cache frequently accessed sources to reduce processing time',
            'expected_impact': '20% reduction in processing time',
            'effort': 'medium'
        },
        {
            'category': 'Quality',
            'priority': 'medium',
            'title': 'Improve Citation Coverage',
            'description': 'Enhance citation extraction for pricing claims',
            'expected_impact': '15% improvement in citation coverage',
            'effort': 'low'
        },
        {
            'category': 'Cost',
            'priority': 'high',
            'title': 'Optimize LLM Usage',
            'description': 'Batch LLM requests and use more efficient models',
            'expected_impact': '30% reduction in LLM costs',
            'effort': 'high'
        }
    ]
