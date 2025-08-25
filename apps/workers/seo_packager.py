import structlog
from celery import shared_task
from typing import List, Dict, Any, Optional
import json
import re
from datetime import datetime

logger = structlog.get_logger()

@shared_task(bind=True, name='seo_packager.package')
def package_seo_content(
    self,
    review_id: str,
    product_info: Dict[str, Any],
    review_sections: Dict[str, Any],
    claims: List[Dict[str, Any]],
    scores: List[Dict[str, Any]],
    pros: List[Dict[str, Any]],
    cons: List[Dict[str, Any]],
    target_keywords: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Package review content with comprehensive SEO optimization.
    
    Args:
        review_id: Review identifier
        product_info: Product information
        review_sections: Generated review sections
        claims: List of extracted claims
        scores: List of scores across criteria
        pros: List of pros
        cons: List of cons
        target_keywords: Optional list of target keywords
    
    Returns:
        Dictionary containing SEO metadata and structured data
    """
    try:
        logger.info("Starting SEO packaging", 
                   review_id=review_id, 
                   product_name=product_info.get('name'))
        
        # Generate meta title and description
        meta_data = _generate_meta_data(product_info, review_sections, target_keywords)
        
        # Generate structured data (JSON-LD)
        structured_data = _generate_structured_data(
            product_info, review_sections, claims, scores, pros, cons
        )
        
        # Generate Open Graph tags
        open_graph = _generate_open_graph(product_info, review_sections, meta_data)
        
        # Generate Twitter Card tags
        twitter_card = _generate_twitter_card(product_info, review_sections, meta_data)
        
        # Generate schema markup
        schema_markup = _generate_schema_markup(
            product_info, review_sections, claims, scores
        )
        
        # Generate internal linking suggestions
        internal_links = _generate_internal_links(review_sections, product_info)
        
        # Generate keyword optimization suggestions
        keyword_suggestions = _generate_keyword_suggestions(
            review_sections, target_keywords, product_info
        )
        
        result = {
            'review_id': review_id,
            'product_id': product_info.get('id'),
            'seo_package': {
                'meta_data': meta_data,
                'structured_data': structured_data,
                'open_graph': open_graph,
                'twitter_card': twitter_card,
                'schema_markup': schema_markup,
                'internal_links': internal_links,
                'keyword_suggestions': keyword_suggestions
            },
            'metadata': {
                'generated_at': datetime.utcnow().isoformat(),
                'seo_score': _calculate_seo_score(meta_data, structured_data, keyword_suggestions),
                'target_keywords': target_keywords or []
            }
        }
        
        logger.info("SEO packaging completed", 
                   review_id=review_id,
                   seo_score=result['metadata']['seo_score'])
        
        return result
        
    except Exception as e:
        logger.error("Error in SEO packaging", 
                    review_id=review_id,
                    error=str(e))
        raise self.retry(countdown=60, max_retries=3)

def _generate_meta_data(
    product_info: Dict[str, Any],
    review_sections: Dict[str, Any],
    target_keywords: Optional[List[str]]
) -> Dict[str, Any]:
    """Generate meta title and description."""
    product_name = product_info.get('name', 'Product')
    category = product_info.get('category', 'software')
    
    # Extract key information from review
    executive_summary = review_sections.get('executive_summary', {})
    conclusion = review_sections.get('conclusion', {})
    
    # Generate meta title
    if target_keywords:
        primary_keyword = target_keywords[0]
        meta_title = f"{product_name} Review ({primary_keyword}) - {category} Analysis"
    else:
        meta_title = f"{product_name} Review - Complete {category} Analysis & Comparison"
    
    # Ensure title length is optimal (50-60 characters)
    if len(meta_title) > 60:
        meta_title = meta_title[:57] + "..."
    
    # Generate meta description
    if executive_summary.get('content'):
        # Use executive summary content
        summary_text = executive_summary['content']
        # Clean and truncate
        summary_text = re.sub(r'\s+', ' ', summary_text).strip()
        if len(summary_text) > 155:
            summary_text = summary_text[:152] + "..."
    else:
        # Generate from product info
        summary_text = f"Comprehensive {product_name} review covering features, pricing, pros & cons, and real-world performance analysis."
    
    return {
        'title': meta_title,
        'description': summary_text,
        'keywords': target_keywords or [f"{product_name} review", f"{category} review", "software review"],
        'canonical_url': f"/reviews/{product_info.get('slug', product_name.lower().replace(' ', '-'))}",
        'robots': 'index, follow'
    }

def _generate_structured_data(
    product_info: Dict[str, Any],
    review_sections: Dict[str, Any],
    claims: List[Dict[str, Any]],
    scores: List[Dict[str, Any]],
    pros: List[Dict[str, Any]],
    cons: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Generate JSON-LD structured data."""
    product_name = product_info.get('name', 'Product')
    category = product_info.get('category', 'software')
    
    # Calculate overall rating
    overall_score = sum(s.get('weightedScore', 0) for s in scores) if scores else 0
    rating_value = overall_score * 5  # Convert to 5-star scale
    
    # Extract pricing information
    pricing_claims = [c for c in claims if c.get('type') == 'pricing']
    price = pricing_claims[0].get('value', 'Contact for pricing') if pricing_claims else 'Contact for pricing'
    
    # Generate review structured data
    review_structured_data = {
        "@context": "https://schema.org",
        "@type": "Review",
        "itemReviewed": {
            "@type": "SoftwareApplication",
            "name": product_name,
            "applicationCategory": category,
            "offers": {
                "@type": "Offer",
                "price": price,
                "priceCurrency": "USD"
            }
        },
        "reviewRating": {
            "@type": "Rating",
            "ratingValue": round(rating_value, 1),
            "bestRating": 5,
            "worstRating": 1
        },
        "author": {
            "@type": "Organization",
            "name": "Product Review Crew"
        },
        "reviewBody": review_sections.get('executive_summary', {}).get('content', ''),
        "datePublished": datetime.utcnow().isoformat(),
        "publisher": {
            "@type": "Organization",
            "name": "Product Review Crew",
            "url": "https://productreviewcrew.com"
        }
    }
    
    # Add pros and cons if available
    if pros or cons:
        review_structured_data["reviewAspect"] = []
        for pro in pros[:3]:
            review_structured_data["reviewAspect"].append({
                "@type": "Review",
                "reviewAspect": "Pros",
                "reviewBody": pro.get('title', '')
            })
        for con in cons[:3]:
            review_structured_data["reviewAspect"].append({
                "@type": "Review",
                "reviewAspect": "Cons",
                "reviewBody": con.get('title', '')
            })
    
    return {
        'review': review_structured_data,
        'product': {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": product_name,
            "applicationCategory": category,
            "description": product_info.get('description', ''),
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": round(rating_value, 1),
                "bestRating": 5,
                "worstRating": 1,
                "ratingCount": 1
            }
        }
    }

def _generate_open_graph(
    product_info: Dict[str, Any],
    review_sections: Dict[str, Any],
    meta_data: Dict[str, Any]
) -> Dict[str, Any]:
    """Generate Open Graph tags."""
    product_name = product_info.get('name', 'Product')
    category = product_info.get('category', 'software')
    
    # Extract image URL (placeholder for now)
    image_url = product_info.get('image_url', 'https://productreviewcrew.com/images/default-review.jpg')
    
    return {
        'og:title': meta_data['title'],
        'og:description': meta_data['description'],
        'og:type': 'article',
        'og:url': meta_data['canonical_url'],
        'og:image': image_url,
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:site_name': 'Product Review Crew',
        'og:locale': 'en_US',
        'article:published_time': datetime.utcnow().isoformat(),
        'article:section': category,
        'article:tag': meta_data['keywords']
    }

def _generate_twitter_card(
    product_info: Dict[str, Any],
    review_sections: Dict[str, Any],
    meta_data: Dict[str, Any]
) -> Dict[str, Any]:
    """Generate Twitter Card tags."""
    product_name = product_info.get('name', 'Product')
    
    # Extract image URL (placeholder for now)
    image_url = product_info.get('image_url', 'https://productreviewcrew.com/images/default-review.jpg')
    
    return {
        'twitter:card': 'summary_large_image',
        'twitter:site': '@productreviewcrew',
        'twitter:title': meta_data['title'],
        'twitter:description': meta_data['description'],
        'twitter:image': image_url,
        'twitter:image:alt': f"{product_name} review screenshot"
    }

def _generate_schema_markup(
    product_info: Dict[str, Any],
    review_sections: Dict[str, Any],
    claims: List[Dict[str, Any]],
    scores: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Generate additional schema markup."""
    product_name = product_info.get('name', 'Product')
    category = product_info.get('category', 'software')
    
    # Generate FAQ schema if we have pros/cons
    faq_schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": []
    }
    
    # Add common FAQ questions
    faq_questions = [
        f"Is {product_name} worth it?",
        f"What are the main features of {product_name}?",
        f"How much does {product_name} cost?",
        f"What are the alternatives to {product_name}?"
    ]
    
    for question in faq_questions:
        faq_schema["mainEntity"].append({
            "@type": "Question",
            "name": question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": f"Find detailed answers in our comprehensive {product_name} review."
            }
        })
    
    # Generate BreadcrumbList schema
    breadcrumb_schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://productreviewcrew.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Reviews",
                "item": "https://productreviewcrew.com/reviews"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": category.title(),
                "item": f"https://productreviewcrew.com/reviews/{category.lower()}"
            },
            {
                "@type": "ListItem",
                "position": 4,
                "name": product_name,
                "item": f"https://productreviewcrew.com/reviews/{product_info.get('slug', product_name.lower().replace(' ', '-'))}"
            }
        ]
    }
    
    return {
        'faq': faq_schema,
        'breadcrumb': breadcrumb_schema
    }

def _generate_internal_links(
    review_sections: Dict[str, Any],
    product_info: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """Generate internal linking suggestions."""
    product_name = product_info.get('name', 'Product')
    category = product_info.get('category', 'software')
    
    internal_links = []
    
    # Suggest links to category pages
    internal_links.append({
        'text': f"Best {category} tools",
        'url': f"/reviews/{category.lower()}",
        'context': 'category overview',
        'priority': 'high'
    })
    
    # Suggest links to comparison pages
    internal_links.append({
        'text': f"{product_name} alternatives",
        'url': f"/reviews/{category.lower()}/alternatives",
        'context': 'alternatives section',
        'priority': 'medium'
    })
    
    # Suggest links to related reviews
    internal_links.append({
        'text': f"Similar {category} reviews",
        'url': f"/reviews/{category.lower()}/similar",
        'context': 'related content',
        'priority': 'low'
    })
    
    return internal_links

def _generate_keyword_suggestions(
    review_sections: Dict[str, Any],
    target_keywords: Optional[List[str]],
    product_info: Dict[str, Any]
) -> Dict[str, Any]:
    """Generate keyword optimization suggestions."""
    product_name = product_info.get('name', 'Product')
    category = product_info.get('category', 'software')
    
    # Extract text content for keyword analysis
    all_content = ""
    for section in review_sections.values():
        if isinstance(section, dict) and 'content' in section:
            all_content += section['content'] + " "
    
    # Generate keyword suggestions
    primary_keywords = target_keywords or [
        f"{product_name} review",
        f"{product_name} {category}",
        f"best {category} tools",
        f"{product_name} pros and cons"
    ]
    
    # Generate long-tail keywords
    long_tail_keywords = [
        f"{product_name} review {category} 2024",
        f"is {product_name} worth it",
        f"{product_name} pricing {category}",
        f"{product_name} alternatives {category}",
        f"{product_name} vs competitors {category}"
    ]
    
    # Generate semantic keywords
    semantic_keywords = [
        f"{category} software review",
        f"{category} tool comparison",
        f"best {category} for business",
        f"{category} pricing comparison",
        f"{category} features comparison"
    ]
    
    # Keyword density analysis
    keyword_density = {}
    for keyword in primary_keywords:
        keyword_lower = keyword.lower()
        content_lower = all_content.lower()
        count = content_lower.count(keyword_lower)
        density = (count * len(keyword_lower.split())) / len(all_content.split()) * 100
        keyword_density[keyword] = {
            'count': count,
            'density': round(density, 2),
            'optimal': 0.5 <= density <= 2.0
        }
    
    return {
        'primary_keywords': primary_keywords,
        'long_tail_keywords': long_tail_keywords,
        'semantic_keywords': semantic_keywords,
        'keyword_density': keyword_density,
        'suggestions': _generate_keyword_optimization_suggestions(keyword_density, all_content)
    }

def _generate_keyword_optimization_suggestions(
    keyword_density: Dict[str, Any],
    content: str
) -> List[str]:
    """Generate specific keyword optimization suggestions."""
    suggestions = []
    
    for keyword, data in keyword_density.items():
        if data['density'] < 0.5:
            suggestions.append(f"Increase usage of '{keyword}' - current density: {data['density']}%")
        elif data['density'] > 2.0:
            suggestions.append(f"Reduce overuse of '{keyword}' - current density: {data['density']}%")
    
    # Content length suggestions
    word_count = len(content.split())
    if word_count < 1000:
        suggestions.append("Consider expanding content to at least 1000 words for better SEO")
    elif word_count > 3000:
        suggestions.append("Content is quite long - consider breaking into multiple pages")
    
    # Heading structure suggestions
    if 'h1' not in content.lower() and 'h2' not in content.lower():
        suggestions.append("Add proper heading structure (H1, H2, H3) for better SEO")
    
    return suggestions

def _calculate_seo_score(
    meta_data: Dict[str, Any],
    structured_data: Dict[str, Any],
    keyword_suggestions: Dict[str, Any]
) -> float:
    """Calculate overall SEO score."""
    score = 0.0
    
    # Meta data score (30%)
    if meta_data.get('title') and len(meta_data['title']) <= 60:
        score += 0.15
    if meta_data.get('description') and len(meta_data['description']) <= 155:
        score += 0.15
    
    # Structured data score (25%)
    if structured_data.get('review') and structured_data.get('product'):
        score += 0.25
    
    # Keyword optimization score (25%)
    keyword_density = keyword_suggestions.get('keyword_density', {})
    optimal_keywords = sum(1 for data in keyword_density.values() if data.get('optimal', False))
    total_keywords = len(keyword_density)
    if total_keywords > 0:
        score += 0.25 * (optimal_keywords / total_keywords)
    
    # Content quality score (20%)
    suggestions = keyword_suggestions.get('suggestions', [])
    if len(suggestions) <= 3:  # Fewer suggestions = better optimization
        score += 0.20
    
    return round(score, 2)
