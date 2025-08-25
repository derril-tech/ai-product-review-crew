'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit, Check, X, AlertTriangle } from 'lucide-react';

interface ProCon {
  id: string;
  title: string;
  description: string;
  category: string;
  confidence: 'low' | 'medium' | 'high';
  evidence?: any[];
  score?: number;
}

interface RedFlag {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  category: string;
  resolution: string;
  details?: any;
}

interface ProsConsEditorProps {
  pros: ProCon[];
  cons: ProCon[];
  redFlags: RedFlag[];
  onProsChange: (pros: ProCon[]) => void;
  onConsChange: (cons: ProCon[]) => void;
  onRedFlagsChange: (redFlags: RedFlag[]) => void;
  onSave: () => void;
}

export function ProsConsEditor({ 
  pros, 
  cons, 
  redFlags, 
  onProsChange, 
  onConsChange, 
  onRedFlagsChange, 
  onSave 
}: ProsConsEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<'pro' | 'con' | 'redFlag' | null>(null);
  const [newItem, setNewItem] = useState<Partial<ProCon | RedFlag>>({});

  const startEditing = (id: string, type: 'pro' | 'con' | 'redFlag', item: ProCon | RedFlag) => {
    setEditingId(id);
    setEditingType(type);
    setNewItem(item);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingType(null);
    setNewItem({});
  };

  const saveEditing = () => {
    if (!editingId || !editingType) return;

    const updatedItem = { ...newItem, id: editingId };

    if (editingType === 'pro') {
      const updatedPros = pros.map(p => p.id === editingId ? updatedItem as ProCon : p);
      onProsChange(updatedPros);
    } else if (editingType === 'con') {
      const updatedCons = cons.map(c => c.id === editingId ? updatedItem as ProCon : c);
      onConsChange(updatedCons);
    } else if (editingType === 'redFlag') {
      const updatedRedFlags = redFlags.map(r => r.id === editingId ? updatedItem as RedFlag : r);
      onRedFlagsChange(updatedRedFlags);
    }

    cancelEditing();
  };

  const addPro = () => {
    const newPro: ProCon = {
      id: `pro_${Date.now()}`,
      title: '',
      description: '',
      category: 'performance',
      confidence: 'medium',
    };
    onProsChange([...pros, newPro]);
    startEditing(newPro.id, 'pro', newPro);
  };

  const addCon = () => {
    const newCon: ProCon = {
      id: `con_${Date.now()}`,
      title: '',
      description: '',
      category: 'performance',
      confidence: 'medium',
    };
    onConsChange([...cons, newCon]);
    startEditing(newCon.id, 'con', newCon);
  };

  const removePro = (id: string) => {
    onProsChange(pros.filter(p => p.id !== id));
  };

  const removeCon = (id: string) => {
    onConsChange(cons.filter(c => c.id !== id));
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderProConItem = (item: ProCon, type: 'pro' | 'con', onRemove: (id: string) => void) => {
    const isEditing = editingId === item.id && editingType === type;

    if (isEditing) {
      return (
        <Card key={item.id} className="p-4 border-2 border-blue-200">
          <div className="space-y-4">
            <div>
              <Label htmlFor={`title-${item.id}`}>Title</Label>
              <Input
                id={`title-${item.id}`}
                value={newItem.title || ''}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Enter title..."
              />
            </div>
            
            <div>
              <Label htmlFor={`description-${item.id}`}>Description</Label>
              <Textarea
                id={`description-${item.id}`}
                value={newItem.description || ''}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Enter description..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`category-${item.id}`}>Category</Label>
                <Select
                  value={newItem.category || 'performance'}
                  onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="pricing">Pricing</SelectItem>
                    <SelectItem value="usability">Usability</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor={`confidence-${item.id}`}>Confidence</Label>
                <Select
                  value={newItem.confidence || 'medium'}
                  onValueChange={(value: any) => setNewItem({ ...newItem, confidence: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={cancelEditing}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={saveEditing}>
                <Check className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card key={item.id} className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium">{item.title}</h3>
              <Badge className={getConfidenceColor(item.confidence)}>
                {item.confidence}
              </Badge>
              <Badge variant="outline">{item.category}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
            {item.score && (
              <div className="text-xs text-muted-foreground">
                Score: {item.score.toFixed(2)}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => startEditing(item.id, type, item)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove(item.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Pros Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Pros ({pros.length})
            </div>
            <Button size="sm" onClick={addPro}>
              <Plus className="h-4 w-4 mr-2" />
              Add Pro
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pros.map(pro => renderProConItem(pro, 'pro', removePro))}
          {pros.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No pros defined. Click "Add Pro" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cons Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              Cons ({cons.length})
            </div>
            <Button size="sm" onClick={addCon}>
              <Plus className="h-4 w-4 mr-2" />
              Add Con
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cons.map(con => renderProConItem(con, 'con', removeCon))}
          {cons.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No cons defined. Click "Add Con" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Red Flags Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Red Flags ({redFlags.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {redFlags.map(redFlag => (
            <Card key={redFlag.id} className="p-4 border-l-4 border-red-500">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">{redFlag.title}</h3>
                    <Badge className={getSeverityColor(redFlag.severity)}>
                      {redFlag.severity}
                    </Badge>
                    <Badge variant="outline">{redFlag.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{redFlag.description}</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Resolution:</strong> {redFlag.resolution}
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {redFlags.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No red flags detected.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={onSave}>
          Save Pros & Cons
        </Button>
      </div>
    </div>
  );
}
