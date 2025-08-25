'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3, Target } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
}

interface Criterion {
  id: string;
  name: string;
  weight: number;
}

interface SensitivityData {
  criterionId: string;
  weightVariation: number;
  rankings: {
    productId: string;
    rank: number;
    score: number;
  }[];
}

interface SensitivityChartProps {
  products: Product[];
  criteria: Criterion[];
  sensitivityData: SensitivityData[];
  onCriterionSelect: (criterionId: string) => void;
  onWeightVariationChange: (variation: number) => void;
}

export function SensitivityChart({ 
  products, 
  criteria, 
  sensitivityData, 
  onCriterionSelect, 
  onWeightVariationChange 
}: SensitivityChartProps) {
  const [selectedCriterion, setSelectedCriterion] = useState<string>('');
  const [chartType, setChartType] = useState<'rankings' | 'scores'>('rankings');

  // Prepare chart data
  const chartData = sensitivityData
    .filter(data => !selectedCriterion || data.criterionId === selectedCriterion)
    .map(data => {
      const criterion = criteria.find(c => c.id === data.criterionId);
      const baseWeight = criterion?.weight || 0;
      const actualWeight = baseWeight * (1 + data.weightVariation);
      
      const dataPoint: any = {
        weightVariation: `${(data.weightVariation * 100).toFixed(0)}%`,
        actualWeight: actualWeight.toFixed(3),
      };

      // Add product data
      data.rankings.forEach(ranking => {
        const product = products.find(p => p.id === ranking.productId);
        if (product) {
          if (chartType === 'rankings') {
            dataPoint[product.name] = ranking.rank;
          } else {
            dataPoint[product.name] = ranking.score;
          }
        }
      });

      return dataPoint;
    });

  // Get product colors
  const getProductColor = (index: number) => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
      '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
    ];
    return colors[index % colors.length];
  };

  // Calculate stability metrics
  const calculateStability = () => {
    if (!selectedCriterion || chartData.length === 0) return null;

    const productStabilities = products.map(product => {
      const rankings = chartData.map(point => point[product.name]).filter(r => r !== undefined);
      if (rankings.length === 0) return { product, stability: 0, avgRank: 0 };

      const avgRank = rankings.reduce((sum, rank) => sum + rank, 0) / rankings.length;
      const variance = rankings.reduce((sum, rank) => sum + Math.pow(rank - avgRank, 2), 0) / rankings.length;
      const stability = 1 / (1 + Math.sqrt(variance)); // Higher stability = less variance

      return { product, stability, avgRank };
    });

    return productStabilities.sort((a, b) => b.stability - a.stability);
  };

  const stabilityMetrics = calculateStability();

  const handleCriterionSelect = (criterionId: string) => {
    setSelectedCriterion(criterionId);
    onCriterionSelect(criterionId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sensitivity Analysis
          </div>
          <div className="flex items-center gap-2">
            <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rankings">Rankings</SelectItem>
                <SelectItem value="scores">Scores</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedCriterion} onValueChange={handleCriterionSelect}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select criterion..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Criteria</SelectItem>
                {criteria.map(criterion => (
                  <SelectItem key={criterion.id} value={criterion.id}>
                    {criterion.name} (w: {criterion.weight.toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="weightVariation" 
                label={{ value: 'Weight Variation', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                label={{ 
                  value: chartType === 'rankings' ? 'Rank' : 'Score', 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip 
                formatter={(value, name) => [
                  chartType === 'rankings' ? `Rank ${value}` : value.toFixed(3),
                  name
                ]}
                labelFormatter={(label) => `Weight: ${label}`}
              />
              <Legend />
              {products.map((product, index) => (
                <Line
                  key={product.id}
                  type="monotone"
                  dataKey={product.name}
                  stroke={getProductColor(index)}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stability Metrics */}
        {stabilityMetrics && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <h3 className="font-medium">Ranking Stability</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stabilityMetrics.map(({ product, stability, avgRank }) => (
                <div key={product.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{product.name}</span>
                    <Badge variant="outline">
                      {stability.toFixed(3)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Avg Rank: {avgRank.toFixed(1)}
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stability * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weight Variation Controls */}
        <div className="space-y-4">
          <h3 className="font-medium">Weight Variation Range</h3>
          <div className="flex gap-2">
            {[-0.5, -0.25, 0, 0.25, 0.5].map(variation => (
              <Button
                key={variation}
                variant="outline"
                size="sm"
                onClick={() => onWeightVariationChange(variation)}
              >
                {variation > 0 ? '+' : ''}{variation * 100}%
              </Button>
            ))}
          </div>
        </div>

        {chartData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No sensitivity data available. Run a sensitivity analysis to see how weight changes affect rankings.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
