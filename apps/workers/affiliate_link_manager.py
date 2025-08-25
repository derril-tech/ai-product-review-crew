# Created automatically by Cursor AI (2024-12-19)

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import requests
from celery import shared_task
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

logger = logging.getLogger(__name__)


@shared_task(bind=True, name='affiliate_link_manager.health_check')
def check_link_health(
    self,
    review_id: str,
    affiliate_links: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Check health of affiliate links and update their status.
    """
    try:
        logger.info("Starting affiliate link health check", review_id=review_id)
        
        results = []
        for link in affiliate_links:
            link_id = link.get('id')
            url = link.get('url')
            provider = link.get('provider')
            
            if not url:
                continue
                
            try:
                # Check if link is accessible
                response = requests.head(url, timeout=10, allow_redirects=True)
                is_healthy = response.status_code == 200
                
                # Check for common affiliate link patterns
                parsed_url = urlparse(url)
                has_affiliate_params = any(
                    param in parse_qs(parsed_url.query) 
                    for param in ['ref', 'aff', 'partner', 'tag', 'campaign']
                )
                
                result = {
                    'link_id': link_id,
                    'url': url,
                    'provider': provider,
                    'is_healthy': is_healthy,
                    'status_code': response.status_code,
                    'has_affiliate_params': has_affiliate_params,
                    'checked_at': datetime.utcnow().isoformat(),
                    'response_time': response.elapsed.total_seconds()
                }
                
                if not is_healthy:
                    result['error'] = f"HTTP {response.status_code}"
                    
            except requests.RequestException as e:
                result = {
                    'link_id': link_id,
                    'url': url,
                    'provider': provider,
                    'is_healthy': False,
                    'error': str(e),
                    'checked_at': datetime.utcnow().isoformat()
                }
            
            results.append(result)
            
        healthy_count = sum(1 for r in results if r.get('is_healthy', False))
        total_count = len(results)
        
        logger.info("Affiliate link health check completed", 
                   review_id=review_id, 
                   healthy_count=healthy_count, 
                   total_count=total_count)
        
        return {
            'review_id': review_id,
            'results': results,
            'summary': {
                'healthy_count': healthy_count,
                'total_count': total_count,
                'health_percentage': (healthy_count / total_count * 100) if total_count > 0 else 0
            }
        }
        
    except Exception as e:
        logger.error("Error in affiliate link health check", review_id=review_id, error=str(e))
        raise self.retry(countdown=60, max_retries=3)


@shared_task(bind=True, name='affiliate_link_manager.auto_insert')
def auto_insert_affiliate_links(
    self,
    review_id: str,
    content_sections: Dict[str, Any],
    affiliate_links: List[Dict[str, Any]],
    insertion_rules: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Automatically insert affiliate links into review content based on rules.
    """
    try:
        logger.info("Starting affiliate link auto-insertion", review_id=review_id)
        
        # Group links by product/category
        links_by_product = {}
        for link in affiliate_links:
            product_id = link.get('product_id')
            if product_id:
                if product_id not in links_by_product:
                    links_by_product[product_id] = []
                links_by_product[product_id].append(link)
        
        modified_sections = {}
        insertion_log = []
        
        for section_name, section_content in content_sections.items():
            if not isinstance(section_content, str):
                continue
                
            modified_content = section_content
            section_insertions = []
            
            # Find product mentions and insert links
            for product_id, links in links_by_product.items():
                product_info = next((link.get('product_info', {}) for link in links), {})
                product_name = product_info.get('name', '')
                
                if not product_name:
                    continue
                
                # Find best link for this product
                best_link = _select_best_link(links)
                if not best_link:
                    continue
                
                # Insert link at first mention
                if product_name.lower() in modified_content.lower():
                    # Find the actual case of the product name
                    import re
                    pattern = re.compile(re.escape(product_name), re.IGNORECASE)
                    match = pattern.search(modified_content)
                    
                    if match:
                        start_pos = match.start()
                        end_pos = match.end()
                        
                        # Create affiliate link HTML
                        link_html = _create_affiliate_link_html(best_link, product_name)
                        
                        # Insert the link
                        modified_content = (
                            modified_content[:start_pos] + 
                            link_html + 
                            modified_content[end_pos:]
                        )
                        
                        section_insertions.append({
                            'product_id': product_id,
                            'product_name': product_name,
                            'link_id': best_link.get('id'),
                            'position': start_pos,
                            'link_text': link_html
                        })
            
            modified_sections[section_name] = modified_content
            insertion_log.extend(section_insertions)
        
        logger.info("Affiliate link auto-insertion completed", 
                   review_id=review_id, 
                   insertions_count=len(insertion_log))
        
        return {
            'review_id': review_id,
            'modified_sections': modified_sections,
            'insertion_log': insertion_log,
            'summary': {
                'total_insertions': len(insertion_log),
                'sections_modified': len([s for s in modified_sections.values() if s != content_sections.get(s, '')])
            }
        }
        
    except Exception as e:
        logger.error("Error in affiliate link auto-insertion", review_id=review_id, error=str(e))
        raise self.retry(countdown=60, max_retries=3)


@shared_task(bind=True, name='affiliate_link_manager.generate_disclosure')
def generate_disclosure_blocks(
    self,
    review_id: str,
    affiliate_links: List[Dict[str, Any]],
    review_metadata: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generate disclosure blocks for affiliate links.
    """
    try:
        logger.info("Starting disclosure block generation", review_id=review_id)
        
        # Group links by provider
        links_by_provider = {}
        for link in affiliate_links:
            provider = link.get('provider', 'unknown')
            if provider not in links_by_provider:
                links_by_provider[provider] = []
            links_by_provider[provider].append(link)
        
        disclosure_blocks = []
        
        for provider, links in links_by_provider.items():
            # Generate provider-specific disclosure
            disclosure = _generate_provider_disclosure(provider, links, review_metadata)
            disclosure_blocks.append(disclosure)
        
        # Generate general disclosure
        general_disclosure = _generate_general_disclosure(affiliate_links, review_metadata)
        disclosure_blocks.append(general_disclosure)
        
        logger.info("Disclosure block generation completed", 
                   review_id=review_id, 
                   blocks_count=len(disclosure_blocks))
        
        return {
            'review_id': review_id,
            'disclosure_blocks': disclosure_blocks,
            'metadata': {
                'providers_count': len(links_by_provider),
                'total_links': len(affiliate_links),
                'generated_at': datetime.utcnow().isoformat()
            }
        }
        
    except Exception as e:
        logger.error("Error in disclosure block generation", review_id=review_id, error=str(e))
        raise self.retry(countdown=60, max_retries=3)


def _select_best_link(links: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Select the best affiliate link from a list of options."""
    if not links:
        return None
    
    # Sort by priority: healthy links first, then by commission rate
    healthy_links = [link for link in links if link.get('is_healthy', True)]
    if healthy_links:
        links = healthy_links
    
    # Sort by commission rate (descending)
    return max(links, key=lambda x: x.get('commission_rate', 0))


def _create_affiliate_link_html(link: Dict[str, Any], product_name: str) -> str:
    """Create HTML for an affiliate link."""
    url = link.get('url', '')
    provider = link.get('provider', '')
    
    # Add affiliate parameters if not present
    if not _has_affiliate_params(url):
        url = _add_affiliate_params(url, link)
    
    return f'<a href="{url}" target="_blank" rel="nofollow sponsored" class="affiliate-link" data-provider="{provider}">{product_name}</a>'


def _has_affiliate_params(url: str) -> bool:
    """Check if URL already has affiliate parameters."""
    parsed = urlparse(url)
    query_params = parse_qs(parsed.query)
    
    affiliate_params = ['ref', 'aff', 'partner', 'tag', 'campaign', 'source']
    return any(param in query_params for param in affiliate_params)


def _add_affiliate_params(url: str, link: Dict[str, Any]) -> str:
    """Add affiliate parameters to URL."""
    parsed = urlparse(url)
    query_params = parse_qs(parsed.query)
    
    # Add affiliate parameters
    affiliate_id = link.get('affiliate_id', '')
    if affiliate_id:
        query_params['ref'] = [affiliate_id]
    
    campaign = link.get('campaign', 'product-review-crew')
    if campaign:
        query_params['utm_campaign'] = [campaign]
    
    # Rebuild URL
    new_query = urlencode(query_params, doseq=True)
    return urlunparse((
        parsed.scheme,
        parsed.netloc,
        parsed.path,
        parsed.params,
        new_query,
        parsed.fragment
    ))


def _generate_provider_disclosure(provider: str, links: List[Dict[str, Any]], review_metadata: Dict[str, Any]) -> Dict[str, Any]:
    """Generate disclosure block for a specific provider."""
    products = [link.get('product_info', {}).get('name', '') for link in links]
    products = [p for p in products if p]
    
    disclosure_text = f"This review contains affiliate links for {', '.join(products)}. "
    disclosure_text += f"When you purchase through these links, we may earn a commission at no additional cost to you. "
    disclosure_text += f"This helps support our independent review process."
    
    return {
        'type': 'provider_disclosure',
        'provider': provider,
        'products': products,
        'text': disclosure_text,
        'html': f'<div class="disclosure-block provider-disclosure" data-provider="{provider}"><p>{disclosure_text}</p></div>',
        'position': 'inline'  # or 'footer', 'sidebar'
    }


def _generate_general_disclosure(links: List[Dict[str, Any]], review_metadata: Dict[str, Any]) -> Dict[str, Any]:
    """Generate general disclosure block."""
    providers = list(set(link.get('provider', '') for link in links))
    providers = [p for p in providers if p]
    
    disclosure_text = "This review contains affiliate links. "
    disclosure_text += "We may earn commissions when you purchase products through our links. "
    disclosure_text += "This does not affect our editorial independence or the accuracy of our reviews."
    
    return {
        'type': 'general_disclosure',
        'providers': providers,
        'text': disclosure_text,
        'html': f'<div class="disclosure-block general-disclosure"><p><strong>Disclosure:</strong> {disclosure_text}</p></div>',
        'position': 'footer'
    }
