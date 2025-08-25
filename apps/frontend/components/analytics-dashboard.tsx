# Created automatically by Cursor AI (2024-12-19)

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  Target, 
  AlertTriangle,
  RefreshCw,
  Download,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';

interface AnalyticsData {
  claim_coverage_percentage: number;
  confidence_distribution: Record<string, number>;
  rank_volatility_score: number;
  performance_metrics: {
    average_processing_time: number;
    total_processing_time: number;
    requests_per_minute: number;
    error_rate: number;
    success_rate: number;
  };
  cost_metrics: {
    total_cost: number;
    cost_per_review: number;
    token_usage: number;
    api_calls: number;
    storage_cost: number;
  };
  quality_metrics: {
    citation_coverage: number;
    source_diversity: number;
    claim_consistency: number;
    score_reliability: number;
  };
  timestamp: string;
}

interface AnalyticsDashboardProps {
  analyticsData: AnalyticsData;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  onRefresh: () => Promise<void>;
  onExportReport: () => Promise<void>;
}

export function AnalyticsDashboard({
  analyticsData,
  timeRange,
  onTimeRangeChange,
  onRefresh,
  onExportReport
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      await onExportReport();
    } finally {
      setIsExporting(false);
    }
  };

  // Prepare data for charts
  const confidenceData = Object.entries(analyticsData.confidence_distribution).map(([level, count]) => ({
    level: level.charAt(0).toUpperCase() + level.slice(1),
    count,
    percentage: (count / Object.values(analyticsData.confidence_distribution).reduce((a, b) => a + b, 0)) * 100
  }));

  const performanceData = [
    { metric: 'Avg Processing Time', value: analyticsData.performance_metrics.average_processing_time, unit: 's' },
    { metric: 'Requests/min', value: analyticsData.performance_metrics.requests_per_minute, unit: '' },
    { metric: 'Error Rate', value: analyticsData.performance_metrics.error_rate, unit: '%' },
    { metric: 'Success Rate', value: analyticsData.performance_metrics.success_rate, unit: '%' }
  ];

  const costData = [
    { category: 'LLM Costs', value: analyticsData.cost_metrics.total_cost * 0.6 },
    { category: 'Storage', value: analyticsData.cost_metrics.storage_cost },
    { category: 'Compute', value: analyticsData.cost_metrics.total_cost * 0.3 },
    { category: 'Other', value: analyticsData.cost_metrics.total_cost * 0.1 }
  ];

  const qualityData = [
    { metric: 'Citation Coverage', value: analyticsData.quality_metrics.citation_coverage },
    { metric: 'Source Diversity', value: analyticsData.quality_metrics.source_diversity },
    { metric: 'Claim Consistency', value: analyticsData.quality_metrics.claim_consistency },
    { metric: 'Score Reliability', value: analyticsData.quality_metrics.score_reliability }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const getTrendIcon = (value: number, threshold: number = 0) => {
    if (value > threshold) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (value < threshold) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Activity className="h-4 w-4 text-blue-500" />;
  };

  const getMetricColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor performance, quality, and cost metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportReport}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claim Coverage</CardTitle>
            {getTrendIcon(analyticsData.claim_coverage_percentage, 80)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(analyticsData.claim_coverage_percentage, { good: 80, warning: 60 })}`}>
              {analyticsData.claim_coverage_percentage}%
            </div>
            <p className="text-xs text-muted-foreground">
              Products with claims for all criteria
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rank Volatility</CardTitle>
            {getTrendIcon(-analyticsData.rank_volatility_score, -10)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(analyticsData.rank_volatility_score, { good: 5, warning: 15 })}`}>
              {analyticsData.rank_volatility_score}%
            </div>
            <p className="text-xs text-muted-foreground">
              Lower is better - more stable rankings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost per Review</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analyticsData.cost_metrics.cost_per_review}
            </div>
            <p className="text-xs text-muted-foreground">
              Average cost per review generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            {getTrendIcon(analyticsData.performance_metrics.success_rate, 95)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getMetricColor(analyticsData.performance_metrics.success_rate, { good: 95, warning: 90 })}`}>
              {analyticsData.performance_metrics.success_rate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Successful processing rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Confidence Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Confidence Distribution
                </CardTitle>
                <CardDescription>
                  Distribution of confidence levels across claims and scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={confidenceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ level, percentage }) => `${level}: ${percentage.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {confidenceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Quality Metrics
                </CardTitle>
                <CardDescription>
                  Key quality indicators for review generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={qualityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  System performance and throughput indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Processing Time Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5" />
                  Processing Time Trend
                </CardTitle>
                <CardDescription>
                  Average processing time over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={[
                    { time: '00:00', time_ms: 1200 },
                    { time: '04:00', time_ms: 1100 },
                    { time: '08:00', time_ms: 1400 },
                    { time: '12:00', time_ms: 1600 },
                    { time: '16:00', time_ms: 1300 },
                    { time: '20:00', time_ms: 1000 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="time_ms" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Quality Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Quality Breakdown
                </CardTitle>
                <CardDescription>
                  Detailed quality metrics analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {qualityData.map((metric) => (
                    <div key={metric.metric} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{metric.metric}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getMetricColor(metric.value, { good: 80, warning: 60 })}`}
                            style={{ width: `${metric.value}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{metric.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quality Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quality Trends
                </CardTitle>
                <CardDescription>
                  Quality metrics over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { day: 'Mon', coverage: 85, diversity: 70, consistency: 90 },
                    { day: 'Tue', coverage: 88, diversity: 75, consistency: 92 },
                    { day: 'Wed', coverage: 82, diversity: 68, consistency: 88 },
                    { day: 'Thu', coverage: 90, diversity: 80, consistency: 95 },
                    { day: 'Fri', coverage: 87, diversity: 72, consistency: 91 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="coverage" stroke="#8884d8" />
                    <Line type="monotone" dataKey="diversity" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="consistency" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Cost Breakdown
                </CardTitle>
                <CardDescription>
                  Distribution of costs across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, value }) => `${category}: $${value.toFixed(2)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {costData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Cost Trends
                </CardTitle>
                <CardDescription>
                  Cost per review over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={[
                    { day: 'Mon', cost: 12.50 },
                    { day: 'Tue', cost: 11.80 },
                    { day: 'Wed', cost: 13.20 },
                    { day: 'Thu', cost: 10.90 },
                    { day: 'Fri', cost: 11.50 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="cost" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
