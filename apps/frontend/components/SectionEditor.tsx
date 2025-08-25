'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Save, X, FileText, Eye, EyeOff } from 'lucide-react';

interface ReviewSection {
  title: string;
  content: string;
  word_count: number;
  key_points?: string[];
  metadata?: Record<string, any>;
}

interface SectionEditorProps {
  sections: Record<string, ReviewSection>;
  onSectionUpdate: (sectionKey: string, section: ReviewSection) => void;
  onSave: () => void;
  writingStyle: string;
  onWritingStyleChange: (style: string) => void;
}

export function SectionEditor({
  sections,
  onSectionUpdate,
  onSave,
  writingStyle,
  onWritingStyleChange
}: SectionEditorProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [editedContent, setEditedContent] = useState<Record<string, ReviewSection>>(sections);

  const sectionOrder = [
    'executive_summary',
    'overview',
    'detailed_analysis',
    'pros_cons',
    'use_cases',
    'conclusion',
    'recommendations'
  ];

  const startEditing = (sectionKey: string) => {
    setEditingSection(sectionKey);
    setEditedContent(sections);
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditedContent(sections);
  };

  const saveSection = (sectionKey: string) => {
    if (editedContent[sectionKey]) {
      onSectionUpdate(sectionKey, editedContent[sectionKey]);
    }
    setEditingSection(null);
  };

  const updateSectionContent = (sectionKey: string, field: keyof ReviewSection, value: any) => {
    setEditedContent(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value
      }
    }));
  };

  const getSectionIcon = (sectionKey: string) => {
    const icons: Record<string, string> = {
      executive_summary: '📊',
      overview: '🔍',
      detailed_analysis: '📈',
      pros_cons: '⚖️',
      use_cases: '🎯',
      conclusion: '🏁',
      recommendations: '💡'
    };
    return icons[sectionKey] || '📄';
  };

  const getSectionColor = (sectionKey: string) => {
    const colors: Record<string, string> = {
      executive_summary: 'bg-blue-50 border-blue-200',
      overview: 'bg-green-50 border-green-200',
      detailed_analysis: 'bg-purple-50 border-purple-200',
      pros_cons: 'bg-orange-50 border-orange-200',
      use_cases: 'bg-pink-50 border-pink-200',
      conclusion: 'bg-gray-50 border-gray-200',
      recommendations: 'bg-yellow-50 border-yellow-200'
    };
    return colors[sectionKey] || 'bg-gray-50 border-gray-200';
  };

  const renderSection = (sectionKey: string, section: ReviewSection) => {
    const isEditing = editingSection === sectionKey;
    const sectionColor = getSectionColor(sectionKey);

    if (isEditing) {
      return (
        <Card key={sectionKey} className={`${sectionColor} border-2`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getSectionIcon(sectionKey)}</span>
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => saveSection(sectionKey)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={cancelEditing}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor={`title-${sectionKey}`}>Section Title</Label>
              <Input
                id={`title-${sectionKey}`}
                value={editedContent[sectionKey]?.title || ''}
                onChange={(e) => updateSectionContent(sectionKey, 'title', e.target.value)}
                placeholder="Enter section title..."
              />
            </div>
            
            <div>
              <Label htmlFor={`content-${sectionKey}`}>Content</Label>
              <Textarea
                id={`content-${sectionKey}`}
                value={editedContent[sectionKey]?.content || ''}
                onChange={(e) => {
                  const content = e.target.value;
                  updateSectionContent(sectionKey, 'content', content);
                  updateSectionContent(sectionKey, 'word_count', content.split(' ').length);
                }}
                placeholder="Enter section content..."
                rows={8}
                className="font-mono text-sm"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {editedContent[sectionKey]?.word_count || 0} words
              </div>
            </div>

            {section.key_points && (
              <div>
                <Label>Key Points</Label>
                <div className="space-y-2">
                  {section.key_points.map((point, index) => (
                    <Input
                      key={index}
                      value={point}
                      onChange={(e) => {
                        const newKeyPoints = [...(section.key_points || [])];
                        newKeyPoints[index] = e.target.value;
                        updateSectionContent(sectionKey, 'key_points', newKeyPoints);
                      }}
                      placeholder={`Key point ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <Card key={sectionKey} className={`${sectionColor} hover:shadow-md transition-shadow`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getSectionIcon(sectionKey)}</span>
              <CardTitle className="text-lg">{section.title}</CardTitle>
              <Badge variant="outline">{section.word_count} words</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => startEditing(sectionKey)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {previewMode ? (
            <div className="prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br/>') }} />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {section.content.length > 200 
                ? `${section.content.substring(0, 200)}...` 
                : section.content}
            </div>
          )}
          
          {section.key_points && section.key_points.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Key Points:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {section.key_points.map((point, index) => (
                  <li key={index}>• {point}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const totalWords = Object.values(sections).reduce((sum, section) => sum + section.word_count, 0);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={writingStyle} onValueChange={onWritingStyleChange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Preview
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Total: {totalWords} words
          </div>
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save All Sections
          </Button>
        </div>
      </div>

      {/* Sections */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Sections</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {sectionOrder.map(sectionKey => {
            const section = sections[sectionKey];
            if (!section) return null;
            return renderSection(sectionKey, section);
          })}
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          {sectionOrder
            .filter(key => ['executive_summary', 'overview', 'conclusion'].includes(key))
            .map(sectionKey => {
              const section = sections[sectionKey];
              if (!section) return null;
              return renderSection(sectionKey, section);
            })}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {sectionOrder
            .filter(key => ['detailed_analysis', 'pros_cons', 'use_cases', 'recommendations'].includes(key))
            .map(sectionKey => {
              const section = sections[sectionKey];
              if (!section) return null;
              return renderSection(sectionKey, section);
            })}
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalWords}</div>
              <div className="text-sm text-muted-foreground">Total Words</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{Object.keys(sections).length}</div>
              <div className="text-sm text-muted-foreground">Sections</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(totalWords / Object.keys(sections).length)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Words/Section</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {totalWords >= 1000 ? '✅' : '⚠️'}
              </div>
              <div className="text-sm text-muted-foreground">SEO Ready</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
