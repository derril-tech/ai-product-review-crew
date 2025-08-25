# Created automatically by Cursor AI (2024-12-19)

import unittest
import pytest
from unittest.mock import Mock, patch, MagicMock
from typing import Dict, List, Any
import json
import time
from datetime import datetime, timedelta

# Import the worker functions to test
from source_ingest import ingest_source
from claim_extractor import extract_claims
from pricing_normalizer import normalize_pricing
from criteria_planner import plan_criteria
from scoring_engine import compute_scores
from pros_cons_synthesizer import synthesize_pros_cons
from usecase_recommender import recommend_use_cases
from narrative_writer import write_review_narrative
from seo_packager import package_seo_content
from affiliate_link_manager import check_link_health, auto_insert_affiliate_links
from exporter import export_review_pdf, export_review_word, export_review_html, export_review_json
from analytics_collector import collect_review_analytics


class TestSourceIngest(unittest.TestCase):
    """Test cases for source ingestion functionality."""
    
    def setUp(self):
        self.sample_source_data = {
            'url': 'https://example.com/product-review',
            'content_type': 'html',
            'content': '<html><body><h1>Product Review</h1><p>This is a great product.</p></body></html>'
        }
    
    @patch('source_ingest.requests.get')
    def test_ingest_source_success(self, mock_get):
        """Test successful source ingestion."""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.text = self.sample_source_data['content']
        mock_get.return_value = mock_response
        
        result = ingest_source.apply(args=('test_review_id', self.sample_source_data['url']))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')
    
    @patch('source_ingest.requests.get')
    def test_ingest_source_failure(self, mock_get):
        """Test source ingestion failure handling."""
        mock_get.side_effect = Exception("Network error")
        
        result = ingest_source.apply(args=('test_review_id', 'https://invalid-url.com'))
        
        self.assertEqual(result.status, 'FAILURE')


class TestClaimExtractor(unittest.TestCase):
    """Test cases for claim extraction functionality."""
    
    def setUp(self):
        self.sample_claims_data = {
            'source_id': 'test_source_id',
            'content': 'This product costs $99 per month and supports up to 10 users.',
            'product_name': 'Test Product'
        }
    
    def test_extract_claims_basic(self):
        """Test basic claim extraction."""
        result = extract_claims.apply(args=('test_review_id', self.sample_claims_data))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')
    
    def test_extract_claims_empty_content(self):
        """Test claim extraction with empty content."""
        result = extract_claims.apply(args=('test_review_id', {'source_id': 'test', 'content': '', 'product_name': 'Test'}))
        
        self.assertEqual(result.status, 'SUCCESS')


class TestPricingNormalizer(unittest.TestCase):
    """Test cases for pricing normalization functionality."""
    
    def test_normalize_pricing_usd_monthly(self):
        """Test USD monthly pricing normalization."""
        pricing_data = {
            'raw_price': '$99/month',
            'currency': 'USD',
            'billing_cycle': 'monthly'
        }
        
        result = normalize_pricing.apply(args=('test_review_id', pricing_data))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')
    
    def test_normalize_pricing_annual_to_monthly(self):
        """Test annual to monthly conversion."""
        pricing_data = {
            'raw_price': '$999/year',
            'currency': 'USD',
            'billing_cycle': 'annual'
        }
        
        result = normalize_pricing.apply(args=('test_review_id', pricing_data))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')


class TestCriteriaPlanner(unittest.TestCase):
    """Test cases for criteria planning functionality."""
    
    def test_plan_criteria_basic(self):
        """Test basic criteria planning."""
        criteria_data = {
            'category': 'software',
            'audience': 'enterprise',
            'products': ['Product A', 'Product B']
        }
        
        result = plan_criteria.apply(args=('test_review_id', criteria_data))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')
    
    def test_plan_criteria_template(self):
        """Test criteria planning with template."""
        criteria_data = {
            'category': 'ai_video',
            'audience': 'small_business',
            'use_template': True
        }
        
        result = plan_criteria.apply(args=('test_review_id', criteria_data))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')


class TestScoringEngine(unittest.TestCase):
    """Test cases for scoring engine functionality."""
    
    def setUp(self):
        self.sample_scoring_data = {
            'criteria': [
                {'id': 'c1', 'name': 'Price', 'weight': 0.3, 'direction': 'lower_better'},
                {'id': 'c2', 'name': 'Features', 'weight': 0.7, 'direction': 'higher_better'}
            ],
            'scores': [
                {'product_id': 'p1', 'criterion_id': 'c1', 'raw_score': 50},
                {'product_id': 'p1', 'criterion_id': 'c2', 'raw_score': 80},
                {'product_id': 'p2', 'criterion_id': 'c1', 'raw_score': 30},
                {'product_id': 'p2', 'criterion_id': 'c2', 'raw_score': 90}
            ]
        }
    
    def test_compute_scores_weighted_sum(self):
        """Test weighted sum scoring method."""
        result = compute_scores.apply(args=('test_review_id', self.sample_scoring_data, 'weighted_sum'))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')
    
    def test_compute_scores_topsis(self):
        """Test TOPSIS scoring method."""
        result = compute_scores.apply(args=('test_review_id', self.sample_scoring_data, 'topsis'))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')


class TestProsConsSynthesizer(unittest.TestCase):
    """Test cases for pros/cons synthesis functionality."""
    
    def setUp(self):
        self.sample_synthesis_data = {
            'claims': [
                {'type': 'feature', 'content': 'Great user interface', 'confidence': 'high'},
                {'type': 'pricing', 'content': 'Expensive for small teams', 'confidence': 'medium'}
            ],
            'scores': [
                {'criterion': 'usability', 'score': 8.5},
                {'criterion': 'pricing', 'score': 6.0}
            ]
        }
    
    def test_synthesize_pros_cons_basic(self):
        """Test basic pros/cons synthesis."""
        result = synthesize_pros_cons.apply(args=('test_review_id', 'test_product_id', self.sample_synthesis_data))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')
    
    def test_synthesize_pros_cons_empty_data(self):
        """Test pros/cons synthesis with empty data."""
        result = synthesize_pros_cons.apply(args=('test_review_id', 'test_product_id', {'claims': [], 'scores': []}))
        
        self.assertEqual(result.status, 'SUCCESS')


class TestUseCaseRecommender(unittest.TestCase):
    """Test cases for use case recommendation functionality."""
    
    def setUp(self):
        self.sample_recommendation_data = {
            'claims': [
                {'type': 'feature', 'content': 'AI-powered automation'},
                {'type': 'integration', 'content': 'Works with popular tools'}
            ],
            'product_info': {
                'name': 'Test Product',
                'category': 'automation',
                'target_audience': 'business'
            }
        }
    
    def test_recommend_use_cases_basic(self):
        """Test basic use case recommendation."""
        result = recommend_use_cases.apply(args=('test_review_id', 'test_product_id', self.sample_recommendation_data))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')
    
    def test_recommend_use_cases_with_audience(self):
        """Test use case recommendation with specific audience."""
        result = recommend_use_cases.apply(args=('test_review_id', 'test_product_id', self.sample_recommendation_data, 'enterprise'))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')


class TestNarrativeWriter(unittest.TestCase):
    """Test cases for narrative writing functionality."""
    
    def setUp(self):
        self.sample_narrative_data = {
            'product_info': {'name': 'Test Product', 'category': 'software'},
            'claims': [{'content': 'Feature A is excellent', 'type': 'feature'}],
            'scores': [{'criterion': 'quality', 'score': 8.5}],
            'pros': [{'title': 'Great features', 'description': 'Excellent functionality'}],
            'cons': [{'title': 'High price', 'description': 'Expensive for small teams'}]
        }
    
    def test_write_narrative_basic(self):
        """Test basic narrative writing."""
        result = write_review_narrative.apply(args=('test_review_id', self.sample_narrative_data))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')
    
    def test_write_narrative_with_style(self):
        """Test narrative writing with specific style."""
        result = write_review_narrative.apply(args=('test_review_id', self.sample_narrative_data, 'casual'))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')


class TestSEOPackager(unittest.TestCase):
    """Test cases for SEO packaging functionality."""
    
    def setUp(self):
        self.sample_seo_data = {
            'product_info': {'name': 'Test Product', 'description': 'A great product'},
            'review_sections': {
                'executive_summary': {'content': 'This is a summary'},
                'conclusion': {'content': 'This is the conclusion'}
            },
            'claims': [{'content': 'Feature A is great'}],
            'target_keywords': ['test', 'product', 'review']
        }
    
    def test_package_seo_basic(self):
        """Test basic SEO packaging."""
        result = package_seo_content.apply(args=('test_review_id', self.sample_seo_data))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')
    
    def test_package_seo_with_keywords(self):
        """Test SEO packaging with target keywords."""
        result = package_seo_content.apply(args=('test_review_id', self.sample_seo_data, ['keyword1', 'keyword2']))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')


class TestAffiliateLinkManager(unittest.TestCase):
    """Test cases for affiliate link management functionality."""
    
    def setUp(self):
        self.sample_links = [
            {'id': 'link1', 'url': 'https://example.com/product1', 'provider': 'amazon'},
            {'id': 'link2', 'url': 'https://example.com/product2', 'provider': 'clickbank'}
        ]
    
    @patch('affiliate_link_manager.requests.head')
    def test_check_link_health(self, mock_head):
        """Test affiliate link health checking."""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.elapsed.total_seconds.return_value = 0.5
        mock_head.return_value = mock_response
        
        result = check_link_health.apply(args=('test_review_id', self.sample_links))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')
    
    def test_auto_insert_affiliate_links(self):
        """Test automatic affiliate link insertion."""
        content_sections = {
            'overview': 'Product A is great and Product B is also good.',
            'conclusion': 'I recommend Product A.'
        }
        
        result = auto_insert_affiliate_links.apply(args=('test_review_id', content_sections, self.sample_links, {}))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')


class TestExporter(unittest.TestCase):
    """Test cases for export functionality."""
    
    def setUp(self):
        self.sample_review_data = {
            'title': 'Test Review',
            'sections': {
                'executive_summary': {'content': 'This is a summary'},
                'conclusion': {'content': 'This is the conclusion'}
            },
            'products': [
                {'name': 'Product A', 'score': 8.5, 'price': 99, 'rank': 1},
                {'name': 'Product B', 'score': 7.5, 'price': 79, 'rank': 2}
            ]
        }
        self.export_config = {'include_images': True, 'custom_styling': True}
    
    def test_export_pdf(self):
        """Test PDF export functionality."""
        result = export_review_pdf.apply(args=('test_review_id', self.sample_review_data, self.export_config))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')
    
    def test_export_word(self):
        """Test Word document export functionality."""
        result = export_review_word.apply(args=('test_review_id', self.sample_review_data, self.export_config))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')
    
    def test_export_html(self):
        """Test HTML export functionality."""
        result = export_review_html.apply(args=('test_review_id', self.sample_review_data, self.export_config))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')
    
    def test_export_json(self):
        """Test JSON export functionality."""
        result = export_review_json.apply(args=('test_review_id', self.sample_review_data, self.export_config))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')


class TestAnalyticsCollector(unittest.TestCase):
    """Test cases for analytics collection functionality."""
    
    def setUp(self):
        self.sample_analytics_data = {
            'claims': [
                {'product_id': 'p1', 'criterion_id': 'c1', 'confidence': 'high'},
                {'product_id': 'p1', 'criterion_id': 'c2', 'confidence': 'medium'}
            ],
            'scores': [
                {'product_id': 'p1', 'criterion_id': 'c1', 'normalized_score': 0.8},
                {'product_id': 'p1', 'criterion_id': 'c2', 'normalized_score': 0.6}
            ],
            'criteria': [
                {'id': 'c1', 'name': 'Price', 'weight': 0.5},
                {'id': 'c2', 'name': 'Features', 'weight': 0.5}
            ],
            'products': [
                {'id': 'p1', 'name': 'Product A'},
                {'id': 'p2', 'name': 'Product B'}
            ],
            'sources': [
                {'domain': 'example.com', 'url': 'https://example.com/review1'},
                {'domain': 'test.com', 'url': 'https://test.com/review2'}
            ],
            'performance_data': {
                'processing_times': [1.2, 1.5, 1.1],
                'total_requests': 100,
                'total_errors': 5,
                'time_window_minutes': 60,
                'total_cost': 25.50,
                'token_usage': 50000,
                'api_calls': 150,
                'storage_cost': 2.50,
                'total_reviews': 10
            }
        }
    
    def test_collect_analytics_basic(self):
        """Test basic analytics collection."""
        result = collect_review_analytics.apply(args=('test_review_id', self.sample_analytics_data))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')
    
    def test_aggregate_analytics(self):
        """Test analytics aggregation."""
        result = collect_review_analytics.aggregate_analytics.apply(args=('test_org_id', '30d'))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')
    
    def test_generate_analytics_report(self):
        """Test analytics report generation."""
        result = collect_review_analytics.generate_analytics_report.apply(args=('test_org_id', 'monthly', True))
        
        self.assertIsNotNone(result)
        self.assertEqual(result.status, 'SUCCESS')


class TestPerformanceTests(unittest.TestCase):
    """Performance test cases."""
    
    def test_source_ingest_performance(self):
        """Test source ingestion performance."""
        start_time = time.time()
        
        # Simulate multiple source ingestions
        for i in range(10):
            ingest_source.apply(args=(f'test_review_{i}', f'https://example{i}.com'))
        
        end_time = time.time()
        execution_time = end_time - start_time
        
        # Assert that 10 ingestions complete within reasonable time (e.g., 30 seconds)
        self.assertLess(execution_time, 30.0)
    
    def test_scoring_engine_performance(self):
        """Test scoring engine performance with large datasets."""
        # Create large dataset
        large_scoring_data = {
            'criteria': [{'id': f'c{i}', 'name': f'Criterion {i}', 'weight': 0.1} for i in range(10)],
            'scores': [
                {'product_id': f'p{j}', 'criterion_id': f'c{i}', 'raw_score': i * j}
                for i in range(10) for j in range(5)
            ]
        }
        
        start_time = time.time()
        result = compute_scores.apply(args=('test_review_id', large_scoring_data, 'weighted_sum'))
        end_time = time.time()
        
        execution_time = end_time - start_time
        
        # Assert that large dataset processing completes within reasonable time
        self.assertLess(execution_time, 10.0)
        self.assertEqual(result.status, 'SUCCESS')


class TestIntegrationTests(unittest.TestCase):
    """Integration test cases."""
    
    def test_full_review_pipeline(self):
        """Test the complete review generation pipeline."""
        # Step 1: Source ingestion
        source_result = ingest_source.apply(args=('test_review_id', 'https://example.com/review'))
        self.assertEqual(source_result.status, 'SUCCESS')
        
        # Step 2: Claim extraction
        claim_result = extract_claims.apply(args=('test_review_id', {'source_id': 'test_source', 'content': 'Test content'}))
        self.assertEqual(claim_result.status, 'SUCCESS')
        
        # Step 3: Criteria planning
        criteria_result = plan_criteria.apply(args=('test_review_id', {'category': 'software', 'audience': 'business'}))
        self.assertEqual(criteria_result.status, 'SUCCESS')
        
        # Step 4: Scoring
        scoring_result = compute_scores.apply(args=('test_review_id', {'criteria': [], 'scores': []}, 'weighted_sum'))
        self.assertEqual(scoring_result.status, 'SUCCESS')
        
        # Step 5: Narrative writing
        narrative_result = write_review_narrative.apply(args=('test_review_id', {'product_info': {'name': 'Test'}}))
        self.assertEqual(narrative_result.status, 'SUCCESS')
    
    def test_export_pipeline(self):
        """Test the complete export pipeline."""
        # Generate review data
        review_data = {
            'title': 'Integration Test Review',
            'sections': {'summary': {'content': 'Test content'}},
            'products': [{'name': 'Test Product', 'score': 8.0}]
        }
        
        # Test all export formats
        export_formats = [
            export_review_pdf,
            export_review_word,
            export_review_html,
            export_review_json
        ]
        
        for export_func in export_formats:
            result = export_func.apply(args=('test_review_id', review_data, {}))
            self.assertEqual(result.status, 'SUCCESS')


if __name__ == '__main__':
    # Run all tests
    unittest.main(verbosity=2)
