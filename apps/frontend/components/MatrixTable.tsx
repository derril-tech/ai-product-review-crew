'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  score: number;
  rank: number;
}

interface Criterion {
  id: string;
  name: string;
  weight: number;
}

interface ScoreData {
  productId: string;
  criterionId: string;
  rawScore: number;
  normalizedScore: number;
  weightedScore: number;
}

interface MatrixTableProps {
  products: Product[];
  criteria: Criterion[];
  scores: ScoreData[];
  onScoreUpdate?: (productId: string, criterionId: string, score: number) => void;
}

export function MatrixTable({ products, criteria, scores, onScoreUpdate }: MatrixTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'rank' | 'score' | 'name'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'rank':
        comparison = a.rank - b.rank;
        break;
      case 'score':
        comparison = b.score - a.score;
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  // Get score for product-criterion pair
  const getScore = (productId: string, criterionId: string) => {
    return scores.find(s => s.productId === productId && s.criterionId === criterionId);
  };

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    if (score >= 0.4) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const exportToCSV = () => {
    const headers = ['Product', 'Category', 'Price', 'Overall Score', 'Rank', ...criteria.map(c => c.name)];
    const rows = sortedProducts.map(product => [
      product.name,
      product.category,
      `$${product.price}`,
      product.score.toFixed(3),
      product.rank,
      ...criteria.map(criterion => {
        const score = getScore(product.id, criterion.id);
        return score ? score.normalizedScore.toFixed(3) : 'N/A';
      })
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scoring-matrix.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Scoring Matrix
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rank">Rank</SelectItem>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background z-10">Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Overall Score</TableHead>
                <TableHead>Rank</TableHead>
                {criteria.map(criterion => (
                  <TableHead key={criterion.id} className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-medium">{criterion.name}</span>
                      <span className="text-xs text-muted-foreground">
                        w: {criterion.weight.toFixed(2)}
                      </span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium sticky left-0 bg-background z-10">
                    {product.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>
                    <Badge className={getScoreColor(product.score)}>
                      {product.score.toFixed(3)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">#{product.rank}</Badge>
                  </TableCell>
                  {criteria.map(criterion => {
                    const score = getScore(product.id, criterion.id);
                    return (
                      <TableCell key={criterion.id} className="text-center">
                        {score ? (
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-medium">
                              {score.normalizedScore.toFixed(3)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {score.weightedScore.toFixed(3)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {sortedProducts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No products match the current filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
