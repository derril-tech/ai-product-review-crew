'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scale, RotateCcw } from 'lucide-react';

interface Criterion {
  id: string;
  name: string;
  weight: number;
}

interface WeightSliderGroupProps {
  criteria: Criterion[];
  onWeightChange: (criterionId: string, weight: number) => void;
  onReset: () => void;
  onEqualize: () => void;
}

export function WeightSliderGroup({ 
  criteria, 
  onWeightChange, 
  onReset, 
  onEqualize 
}: WeightSliderGroupProps) {
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  const isNormalized = Math.abs(totalWeight - 1) < 0.01;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Criteria Weights
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isNormalized ? "default" : "secondary"}>
              Total: {totalWeight.toFixed(2)}
            </Badge>
            <Button variant="outline" size="sm" onClick={onEqualize}>
              Equalize
            </Button>
            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {criteria.map((criterion) => (
          <div key={criterion.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                {criterion.name}
              </Label>
              <span className="text-sm text-muted-foreground">
                {criterion.weight.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[criterion.weight]}
              onValueChange={([value]) => onWeightChange(criterion.id, value)}
              max={1}
              min={0}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        ))}
        
        {criteria.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No criteria available for weighting.
          </div>
        )}
        
        {!isNormalized && criteria.length > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Weights are not normalized. Total should equal 1.00 for optimal results.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
