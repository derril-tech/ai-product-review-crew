'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Users, Clock, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

interface UseCase {
  id: string;
  title: string;
  description: string;
  detailed_description: string;
  audience: string[];
  complexity: 'low' | 'medium' | 'high';
  requirements: string[];
  benefits: string[];
  fit_score: number;
  implementation_steps: string[];
  estimated_roi: {
    time_savings_percentage: number;
    cost_reduction_percentage: number;
    productivity_increase_percentage: number;
    payback_period_months: number;
    confidence: string;
  };
  time_to_value: string;
  supporting_evidence: any[];
}

interface IdealCustomer {
  title: string;
  description: string;
  company_size: string;
  budget_range: string;
  pain_points: string[];
  success_metrics: string[];
  segment: string;
  relevant_use_cases: string[];
  fit_score: number;
}

interface UseCasePickerProps {
  useCases: UseCase[];
  idealCustomers: IdealCustomer[];
  selectedUseCases: string[];
  onUseCaseToggle: (useCaseId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  targetAudience?: string;
  onTargetAudienceChange: (audience: string) => void;
}

export function UseCasePicker({
  useCases,
  idealCustomers,
  selectedUseCases,
  onUseCaseToggle,
  onSelectAll,
  onClearAll,
  targetAudience,
  onTargetAudienceChange
}: UseCasePickerProps) {
  const [activeTab, setActiveTab] = useState('use-cases');
  const [sortBy, setSortBy] = useState<'fit' | 'complexity' | 'roi'>('fit');

  const sortedUseCases = [...useCases].sort((a, b) => {
    switch (sortBy) {
      case 'fit':
        return b.fit_score - a.fit_score;
      case 'complexity':
        const complexityOrder = { 'low': 1, 'medium': 2, 'high': 3 };
        return complexityOrder[a.complexity] - complexityOrder[b.complexity];
      case 'roi':
        return b.estimated_roi.productivity_increase_percentage - a.estimated_roi.productivity_increase_percentage;
      default:
        return 0;
    }
  });

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFitScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const renderUseCaseCard = (useCase: UseCase) => {
    const isSelected = selectedUseCases.includes(useCase.id);

    return (
      <Card key={useCase.id} className={`transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium">{useCase.title}</h3>
                <Badge className={getComplexityColor(useCase.complexity)}>
                  {useCase.complexity}
                </Badge>
                <Badge className={getFitScoreColor(useCase.fit_score)}>
                  {useCase.fit_score.toFixed(2)} fit
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{useCase.detailed_description}</p>
            </div>
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onUseCaseToggle(useCase.id)}
              className="ml-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Benefits</h4>
              <div className="flex flex-wrap gap-1">
                {useCase.benefits.map((benefit, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Requirements</h4>
              <div className="flex flex-wrap gap-1">
                {useCase.requirements.map((req, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {req}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{useCase.time_to_value}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>{useCase.estimated_roi.productivity_increase_percentage}% productivity</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>{useCase.estimated_roi.payback_period_months}mo payback</span>
            </div>
          </div>

          {isSelected && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium mb-2">Implementation Steps</h4>
              <ol className="text-sm text-muted-foreground space-y-1">
                {useCase.implementation_steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 font-medium">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderIdealCustomerCard = (customer: IdealCustomer) => {
    return (
      <Card key={customer.segment} className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-medium mb-1">{customer.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{customer.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <span className="font-medium">Company Size:</span> {customer.company_size}
              </div>
              <div>
                <span className="font-medium">Budget:</span> {customer.budget_range}
              </div>
            </div>
          </div>
          <Badge className={getFitScoreColor(customer.fit_score)}>
            {customer.fit_score.toFixed(2)} fit
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Pain Points</h4>
            <div className="flex flex-wrap gap-1">
              {customer.pain_points.map((point, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {point}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Success Metrics</h4>
            <div className="flex flex-wrap gap-1">
              {customer.success_metrics.map((metric, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {metric}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={targetAudience || ''} onValueChange={onTargetAudienceChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select target audience..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Audiences</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="small-business">Small Business</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
              <SelectItem value="developers">Developers</SelectItem>
              <SelectItem value="marketers">Marketers</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fit">Fit Score</SelectItem>
              <SelectItem value="complexity">Complexity</SelectItem>
              <SelectItem value="roi">ROI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onSelectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={onClearAll}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Use Cases</p>
              <p className="text-lg font-semibold">{useCases.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Selected</p>
              <p className="text-lg font-semibold">{selectedUseCases.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Ideal Customers</p>
              <p className="text-lg font-semibold">{idealCustomers.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Avg ROI</p>
              <p className="text-lg font-semibold">
                {useCases.length > 0 
                  ? Math.round(useCases.reduce((sum, uc) => sum + uc.estimated_roi.productivity_increase_percentage, 0) / useCases.length)
                  : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="use-cases">Use Cases ({useCases.length})</TabsTrigger>
          <TabsTrigger value="customers">Ideal Customers ({idealCustomers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="use-cases" className="space-y-4">
          {sortedUseCases.length > 0 ? (
            sortedUseCases.map(renderUseCaseCard)
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No use cases available.
            </div>
          )}
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          {idealCustomers.length > 0 ? (
            idealCustomers.map(renderIdealCustomerCard)
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No ideal customer profiles available.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
