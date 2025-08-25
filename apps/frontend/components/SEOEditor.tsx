'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Code, 
  Share2, 
  Twitter, 
  Globe, 
  Target, 
  CheckCircle, 
  AlertTriangle,
  Copy,
  RefreshCw
} from 'lucide-react';

interface MetaData {
  title: string;
  description: string;
  keywords: string[];
  canonical_url: string;
  robots: string;
}

interface StructuredData {
  review: any;
  product: any;
}

interface OpenGraph {
  'og:title': string;
  'og:description': string;
  'og:type': string;
  'og:url': string;
  'og:image': string;
  'og:image:width': string;
  'og:image:height': string;
  'og:site_name': string;
  'og:locale': string;
  'article:published_time': string;
  'article:section': string;
  'article:tag': string[];
}

interface TwitterCard {
  'twitter:card': string;
  'twitter:site': string;
  'twitter:title': string;
  'twitter:description': string;
  'twitter:image': string;
  'twitter:image:alt': string;
}

interface KeywordSuggestion {
  primary_keywords: string[];
  long_tail_keywords: string[];
  semantic_keywords: string[];
  keyword_density: Record<string, any>;
  suggestions: string[];
}

interface SEOEditorProps {
  metaData: MetaData;
  structuredData: StructuredData;
  openGraph: OpenGraph;
  twitterCard: TwitterCard;
  keywordSuggestions: KeywordSuggestion;
  seoScore: number;
  onMetaDataUpdate: (metaData: MetaData) => void;
  onStructuredDataUpdate: (structuredData: StructuredData) => void;
  onOpenGraphUpdate: (openGraph: OpenGraph) => void;
  onTwitterCardUpdate: (twitterCard: TwitterCard) => void;
  onRefreshSEO: () => void;
}

export function SEOEditor({
  metaData,
  structuredData,
  openGraph,
  twitterCard,
  keywordSuggestions,
  seoScore,
  onMetaDataUpdate,
  onStructuredDataUpdate,
  onOpenGraphUpdate,
  onTwitterCardUpdate,
  onRefreshSEO
}: SEOEditorProps) {
  const [editingMetaData, setEditingMetaData] = useState<MetaData>(metaData);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const saveMetaData = () => {
    onMetaDataUpdate(editingMetaData);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Poor';
  };

  const renderMetaDataEditor = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Meta Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="meta-title">Meta Title</Label>
          <div className="flex gap-2">
            <Input
              id="meta-title"
              value={editingMetaData.title}
              onChange={(e) => setEditingMetaData({ ...editingMetaData, title: e.target.value })}
              placeholder="Enter meta title..."
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(editingMetaData.title, 'title')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {editingMetaData.title.length}/60 characters
            {editingMetaData.title.length > 60 && (
              <span className="text-red-500 ml-2">Too long!</span>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="meta-description">Meta Description</Label>
          <div className="flex gap-2">
            <Textarea
              id="meta-description"
              value={editingMetaData.description}
              onChange={(e) => setEditingMetaData({ ...editingMetaData, description: e.target.value })}
              placeholder="Enter meta description..."
              rows={3}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(editingMetaData.description, 'description')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {editingMetaData.description.length}/155 characters
            {editingMetaData.description.length > 155 && (
              <span className="text-red-500 ml-2">Too long!</span>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="meta-keywords">Keywords</Label>
          <Input
            id="meta-keywords"
            value={editingMetaData.keywords.join(', ')}
            onChange={(e) => setEditingMetaData({ 
              ...editingMetaData, 
              keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
            })}
            placeholder="Enter keywords separated by commas..."
          />
        </div>

        <div>
          <Label htmlFor="canonical-url">Canonical URL</Label>
          <Input
            id="canonical-url"
            value={editingMetaData.canonical_url}
            onChange={(e) => setEditingMetaData({ ...editingMetaData, canonical_url: e.target.value })}
            placeholder="Enter canonical URL..."
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={saveMetaData}>
            Save Meta Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderStructuredData = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Structured Data (JSON-LD)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="review" className="w-full">
          <TabsList>
            <TabsTrigger value="review">Review Schema</TabsTrigger>
            <TabsTrigger value="product">Product Schema</TabsTrigger>
          </TabsList>

          <TabsContent value="review">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Review Structured Data</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(JSON.stringify(structuredData.review, null, 2), 'review-schema')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={JSON.stringify(structuredData.review, null, 2)}
                readOnly
                rows={15}
                className="font-mono text-xs"
              />
            </div>
          </TabsContent>

          <TabsContent value="product">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Product Structured Data</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(JSON.stringify(structuredData.product, null, 2), 'product-schema')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <Textarea
                value={JSON.stringify(structuredData.product, null, 2)}
                readOnly
                rows={15}
                className="font-mono text-xs"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  const renderSocialMedia = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Social Media Tags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="og" className="w-full">
          <TabsList>
            <TabsTrigger value="og">Open Graph</TabsTrigger>
            <TabsTrigger value="twitter">Twitter Card</TabsTrigger>
          </TabsList>

          <TabsContent value="og">
            <div className="space-y-4">
              <div>
                <Label>og:title</Label>
                <Input value={openGraph['og:title']} readOnly />
              </div>
              <div>
                <Label>og:description</Label>
                <Textarea value={openGraph['og:description']} readOnly rows={3} />
              </div>
              <div>
                <Label>og:image</Label>
                <Input value={openGraph['og:image']} readOnly />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>og:image:width</Label>
                  <Input value={openGraph['og:image:width']} readOnly />
                </div>
                <div>
                  <Label>og:image:height</Label>
                  <Input value={openGraph['og:image:height']} readOnly />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="twitter">
            <div className="space-y-4">
              <div>
                <Label>twitter:title</Label>
                <Input value={twitterCard['twitter:title']} readOnly />
              </div>
              <div>
                <Label>twitter:description</Label>
                <Textarea value={twitterCard['twitter:description']} readOnly rows={3} />
              </div>
              <div>
                <Label>twitter:image</Label>
                <Input value={twitterCard['twitter:image']} readOnly />
              </div>
              <div>
                <Label>twitter:card</Label>
                <Input value={twitterCard['twitter:card']} readOnly />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  const renderKeywordAnalysis = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Keyword Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Primary Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {keywordSuggestions.primary_keywords.map((keyword, index) => (
              <Badge key={index} variant="default">{keyword}</Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Long-tail Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {keywordSuggestions.long_tail_keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary">{keyword}</Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Keyword Density</h4>
          <div className="space-y-2">
            {Object.entries(keywordSuggestions.keyword_density).map(([keyword, data]) => (
              <div key={keyword} className="flex items-center justify-between">
                <span className="text-sm">{keyword}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {data.density}% ({data.count} times)
                  </span>
                  {data.optimal ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Optimization Suggestions</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {keywordSuggestions.suggestions.map((suggestion, index) => (
              <li key={index}>• {suggestion}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* SEO Score */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">SEO Score</h3>
              <p className="text-sm text-muted-foreground">
                Overall optimization quality
              </p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(seoScore)}`}>
                {Math.round(seoScore * 100)}
              </div>
              <div className="text-sm text-muted-foreground">
                {getScoreLabel(seoScore)}
              </div>
            </div>
          </div>
          <Progress value={seoScore * 100} className="mt-4" />
        </CardContent>
      </Card>

      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">SEO Editor</h2>
        <Button onClick={onRefreshSEO} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh SEO
        </Button>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="meta" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="meta">Meta Data</TabsTrigger>
          <TabsTrigger value="structured">Structured Data</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
        </TabsList>

        <TabsContent value="meta" className="space-y-4">
          {renderMetaDataEditor()}
        </TabsContent>

        <TabsContent value="structured" className="space-y-4">
          {renderStructuredData()}
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          {renderSocialMedia()}
        </TabsContent>

        <TabsContent value="keywords" className="space-y-4">
          {renderKeywordAnalysis()}
        </TabsContent>
      </Tabs>

      {/* Copy Success Indicator */}
      {copiedField && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
          Copied {copiedField} to clipboard!
        </div>
      )}
    </div>
  );
}
