# Created automatically by Cursor AI (2024-12-19)

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Download, 
  FileText, 
  FileImage, 
  FileCode, 
  FileJson, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Settings,
  Eye,
  Copy,
  Trash2
} from 'lucide-react';

interface ExportJob {
  id: string;
  format: 'pdf' | 'docx' | 'html' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  file_key?: string;
  file_size?: number;
  error?: string;
  metadata?: Record<string, any>;
}

interface ExportConfig {
  include_images: boolean;
  include_tables: boolean;
  include_charts: boolean;
  custom_styling: boolean;
  page_break_sections: boolean;
  include_metadata: boolean;
  compression_level: 'low' | 'medium' | 'high';
}

interface ExportHubProps {
  reviewId: string;
  exportJobs: ExportJob[];
  onExport: (format: string, config: ExportConfig) => Promise<void>;
  onDownload: (fileKey: string, filename: string) => Promise<void>;
  onDeleteJob: (jobId: string) => Promise<void>;
  onRefreshJobs: () => Promise<void>;
}

export function ExportHub({
  reviewId,
  exportJobs,
  onExport,
  onDownload,
  onDeleteJob,
  onRefreshJobs
}: ExportHubProps) {
  const [activeTab, setActiveTab] = useState('export');
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'docx' | 'html' | 'json'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    include_images: true,
    include_tables: true,
    include_charts: true,
    custom_styling: true,
    page_break_sections: true,
    include_metadata: true,
    compression_level: 'medium'
  });

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', icon: FileText, description: 'Professional PDF with formatting' },
    { value: 'docx', label: 'Word Document', icon: FileText, description: 'Editable Word document' },
    { value: 'html', label: 'HTML File', icon: FileCode, description: 'Web-ready HTML with styles' },
    { value: 'json', label: 'JSON Data', icon: FileJson, description: 'Structured data export' }
  ];

  const pendingJobs = exportJobs.filter(job => job.status === 'pending' || job.status === 'processing');
  const completedJobs = exportJobs.filter(job => job.status === 'completed');
  const failedJobs = exportJobs.filter(job => job.status === 'failed');

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(selectedFormat, exportConfig);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefreshJobs = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshJobs();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDownload = async (job: ExportJob) => {
    if (!job.file_key) return;
    
    const format = job.format.toUpperCase();
    const timestamp = new Date(job.created_at).toISOString().split('T')[0];
    const filename = `review_${reviewId}_${timestamp}.${job.format}`;
    
    await onDownload(job.file_key, filename);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      processing: 'default',
      completed: 'default',
      failed: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Export Hub</h2>
          <p className="text-muted-foreground">
            Export reviews in various formats for different use cases
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshJobs}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Export Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{exportJobs.length}</div>
              <div className="text-sm text-muted-foreground">Total Exports</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedJobs.length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingJobs.length}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{failedJobs.length}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export">Create Export</TabsTrigger>
          <TabsTrigger value="history">Export History</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          {/* Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Export Format</CardTitle>
              <CardDescription>
                Choose the format that best suits your needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formatOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Card
                      key={option.value}
                      className={`cursor-pointer transition-colors ${
                        selectedFormat === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedFormat(option.value as any)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Icon className="h-6 w-6 text-blue-600" />
                          <div>
                            <h3 className="font-medium">{option.label}</h3>
                            <p className="text-sm text-muted-foreground">{option.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Export Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Export Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="include-images">Include Images</Label>
                    <p className="text-sm text-muted-foreground">Embed images in the export</p>
                  </div>
                  <Switch
                    id="include-images"
                    checked={exportConfig.include_images}
                    onCheckedChange={(checked) => setExportConfig({ ...exportConfig, include_images: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="include-tables">Include Tables</Label>
                    <p className="text-sm text-muted-foreground">Include comparison tables</p>
                  </div>
                  <Switch
                    id="include-tables"
                    checked={exportConfig.include_tables}
                    onCheckedChange={(checked) => setExportConfig({ ...exportConfig, include_tables: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="include-charts">Include Charts</Label>
                    <p className="text-sm text-muted-foreground">Include visual charts and graphs</p>
                  </div>
                  <Switch
                    id="include-charts"
                    checked={exportConfig.include_charts}
                    onCheckedChange={(checked) => setExportConfig({ ...exportConfig, include_charts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="custom-styling">Custom Styling</Label>
                    <p className="text-sm text-muted-foreground">Apply custom CSS styling</p>
                  </div>
                  <Switch
                    id="custom-styling"
                    checked={exportConfig.custom_styling}
                    onCheckedChange={(checked) => setExportConfig({ ...exportConfig, custom_styling: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="page-break">Page Break Sections</Label>
                    <p className="text-sm text-muted-foreground">Start sections on new pages</p>
                  </div>
                  <Switch
                    id="page-break"
                    checked={exportConfig.page_break_sections}
                    onCheckedChange={(checked) => setExportConfig({ ...exportConfig, page_break_sections: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="include-metadata">Include Metadata</Label>
                    <p className="text-sm text-muted-foreground">Include review metadata</p>
                  </div>
                  <Switch
                    id="include-metadata"
                    checked={exportConfig.include_metadata}
                    onCheckedChange={(checked) => setExportConfig({ ...exportConfig, include_metadata: checked })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="compression">Compression Level</Label>
                <Select
                  value={exportConfig.compression_level}
                  onValueChange={(value: any) => setExportConfig({ ...exportConfig, compression_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Better Quality)</SelectItem>
                    <SelectItem value="medium">Medium (Balanced)</SelectItem>
                    <SelectItem value="high">High (Smaller Size)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Export Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              size="lg"
            >
              <Download className="h-5 w-5 mr-2" />
              {isExporting ? 'Exporting...' : `Export as ${selectedFormat.toUpperCase()}`}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Export History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Export History</CardTitle>
              <CardDescription>
                View and manage your export jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exportJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          {getStatusBadge(job.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase">
                          {job.format}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(job.created_at).toLocaleDateString()}
                        <br />
                        <span className="text-sm text-muted-foreground">
                          {new Date(job.created_at).toLocaleTimeString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        {formatFileSize(job.file_size)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {job.status === 'completed' && job.file_key && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(job)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/api/exports/${job.id}`, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteJob(job.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
