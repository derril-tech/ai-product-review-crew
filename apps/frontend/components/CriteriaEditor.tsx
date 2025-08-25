'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

interface Criteria {
  id: string;
  name: string;
  description: string;
  direction: 'higher_better' | 'lower_better';
  normalization: 'minmax' | 'zscore' | 'none';
  weight: number;
}

interface CriteriaEditorProps {
  criteria: Criteria[];
  onCriteriaChange: (criteria: Criteria[]) => void;
  onSave: () => void;
}

export function CriteriaEditor({ criteria, onCriteriaChange, onSave }: CriteriaEditorProps) {
  const [localCriteria, setLocalCriteria] = useState<Criteria[]>(criteria);

  const addCriterion = () => {
    const newCriterion: Criteria = {
      id: `criterion-${Date.now()}`,
      name: '',
      description: '',
      direction: 'higher_better',
      normalization: 'minmax',
      weight: 0.1,
    };
    const updatedCriteria = [...localCriteria, newCriterion];
    setLocalCriteria(updatedCriteria);
    onCriteriaChange(updatedCriteria);
  };

  const removeCriterion = (id: string) => {
    const updatedCriteria = localCriteria.filter(c => c.id !== id);
    setLocalCriteria(updatedCriteria);
    onCriteriaChange(updatedCriteria);
  };

  const updateCriterion = (id: string, field: keyof Criteria, value: any) => {
    const updatedCriteria = localCriteria.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    );
    setLocalCriteria(updatedCriteria);
    onCriteriaChange(updatedCriteria);
  };

  const normalizeWeights = () => {
    const totalWeight = localCriteria.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight > 0) {
      const updatedCriteria = localCriteria.map(c => ({
        ...c,
        weight: c.weight / totalWeight
      }));
      setLocalCriteria(updatedCriteria);
      onCriteriaChange(updatedCriteria);
    }
  };

  const totalWeight = localCriteria.reduce((sum, c) => sum + c.weight, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Evaluation Criteria
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Total Weight: {totalWeight.toFixed(2)}
            </span>
            <Button variant="outline" size="sm" onClick={normalizeWeights}>
              Normalize
            </Button>
            <Button size="sm" onClick={addCriterion}>
              <Plus className="h-4 w-4 mr-2" />
              Add Criterion
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {localCriteria.map((criterion, index) => (
          <Card key={criterion.id} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`name-${criterion.id}`}>Name</Label>
                <Input
                  id={`name-${criterion.id}`}
                  value={criterion.name}
                  onChange={(e) => updateCriterion(criterion.id, 'name', e.target.value)}
                  placeholder="e.g., Video Quality"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`direction-${criterion.id}`}>Direction</Label>
                <Select
                  value={criterion.direction}
                  onValueChange={(value) => updateCriterion(criterion.id, 'direction', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="higher_better">Higher is Better</SelectItem>
                    <SelectItem value="lower_better">Lower is Better</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`normalization-${criterion.id}`}>Normalization</Label>
                <Select
                  value={criterion.normalization}
                  onValueChange={(value) => updateCriterion(criterion.id, 'normalization', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minmax">Min-Max</SelectItem>
                    <SelectItem value="zscore">Z-Score</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`weight-${criterion.id}`}>
                  Weight: {criterion.weight.toFixed(2)}
                </Label>
                <Slider
                  value={[criterion.weight]}
                  onValueChange={([value]) => updateCriterion(criterion.id, 'weight', value)}
                  max={1}
                  min={0}
                  step={0.01}
                  className="w-full"
                />
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor={`description-${criterion.id}`}>Description</Label>
                <Textarea
                  id={`description-${criterion.id}`}
                  value={criterion.description}
                  onChange={(e) => updateCriterion(criterion.id, 'description', e.target.value)}
                  placeholder="Describe what this criterion measures..."
                  rows={2}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeCriterion(criterion.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </Card>
        ))}
        
        {localCriteria.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No criteria defined. Click "Add Criterion" to get started.
          </div>
        )}
        
        {localCriteria.length > 0 && (
          <div className="flex justify-end pt-4">
            <Button onClick={onSave}>
              Save Criteria
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
