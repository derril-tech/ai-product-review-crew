# Created automatically by Cursor AI (2024-12-19)

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Link, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Settings,
  Plus,
  Trash2,
  Copy,
  Eye
} from 'lucide-react';

interface AffiliateLink {
  id: string;
  url: string;
  provider: string;
  product_id: string;
  product_name: string;
  affiliate_id: string;
  commission_rate: number;
  is_healthy: boolean;
  last_checked: string;
  status_code?: number;
  response_time?: number;
  error?: string;
}

interface DisclosureBlock {
  id: string;
  type: 'provider_disclosure' | 'general_disclosure';
  provider?: string;
  text: string;
  html: string;
  position: 'inline' | 'footer' | 'sidebar';
  is_active: boolean;
}

interface AffiliateManagerProps {
  reviewId: string;
  affiliateLinks: AffiliateLink[];
  disclosureBlocks: DisclosureBlock[];
  onLinksUpdate: (links: AffiliateLink[]) => void;
  onDisclosureUpdate: (blocks: DisclosureBlock[]) => void;
  onHealthCheck: () => Promise<void>;
  onAutoInsert: () => Promise<void>;
  onGenerateDisclosure: () => Promise<void>;
}

export function AffiliateManager({
  reviewId,
  affiliateLinks,
  disclosureBlocks,
  onLinksUpdate,
  onDisclosureUpdate,
  onHealthCheck,
  onAutoInsert,
  onGenerateDisclosure
}: AffiliateManagerProps) {
  const [activeTab, setActiveTab] = useState('links');
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  const [isAutoInserting, setIsAutoInserting] = useState(false);
  const [autoInsertSettings, setAutoInsertSettings] = useState({
    enabled: true,
    maxLinksPerSection: 3,
    insertAtFirstMention: true,
    addDisclosure: true
  });
  const [newLink, setNewLink] = useState({
    url: '',
    provider: '',
    product_id: '',
    affiliate_id: '',
    commission_rate: 0
  });

  const healthyLinks = affiliateLinks.filter(link => link.is_healthy);
  const unhealthyLinks = affiliateLinks.filter(link => !link.is_healthy);
  const healthPercentage = affiliateLinks.length > 0 
    ? (healthyLinks.length / affiliateLinks.length * 100).toFixed(1)
    : '0';

  const handleAddLink = () => {
    if (!newLink.url || !newLink.provider) return;

    const link: AffiliateLink = {
      id: `link_${Date.now()}`,
      url: newLink.url,
      provider: newLink.provider,
      product_id: newLink.product_id,
      product_name: '', // Will be populated from product data
      affiliate_id: newLink.affiliate_id,
      commission_rate: newLink.commission_rate,
      is_healthy: true,
      last_checked: new Date().toISOString()
    };

    onLinksUpdate([...affiliateLinks, link]);
    setNewLink({
      url: '',
      provider: '',
      product_id: '',
      affiliate_id: '',
      commission_rate: 0
    });
  };

  const handleRemoveLink = (linkId: string) => {
    onLinksUpdate(affiliateLinks.filter(link => link.id !== linkId));
  };

  const handleHealthCheck = async () => {
    setIsHealthChecking(true);
    try {
      await onHealthCheck();
    } finally {
      setIsHealthChecking(false);
    }
  };

  const handleAutoInsert = async () => {
    setIsAutoInserting(true);
    try {
      await onAutoInsert();
    } finally {
      setIsAutoInserting(false);
    }
  };

  const handleToggleDisclosure = (blockId: string) => {
    const updatedBlocks = disclosureBlocks.map(block =>
      block.id === blockId ? { ...block, is_active: !block.is_active } : block
    );
    onDisclosureUpdate(updatedBlocks);
  };

  const handleCopyDisclosure = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getHealthIcon = (isHealthy: boolean) => {
    return isHealthy ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getHealthBadge = (isHealthy: boolean) => {
    return isHealthy ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Healthy
      </Badge>
    ) : (
      <Badge variant="destructive">
        Unhealthy
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Affiliate Manager</h2>
          <p className="text-muted-foreground">
            Manage affiliate links, monitor health, and configure auto-insertion
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleHealthCheck}
            disabled={isHealthChecking}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isHealthChecking ? 'animate-spin' : ''}`} />
            Health Check
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoInsert}
            disabled={isAutoInserting}
          >
            <Link className="h-4 w-4 mr-2" />
            Auto Insert
          </Button>
        </div>
      </div>

      {/* Health Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Link Health Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{healthyLinks.length}</div>
              <div className="text-sm text-muted-foreground">Healthy Links</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{unhealthyLinks.length}</div>
              <div className="text-sm text-muted-foreground">Unhealthy Links</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{affiliateLinks.length}</div>
              <div className="text-sm text-muted-foreground">Total Links</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{healthPercentage}%</div>
              <div className="text-sm text-muted-foreground">Health Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="links">Affiliate Links</TabsTrigger>
          <TabsTrigger value="settings">Auto-Insert Settings</TabsTrigger>
          <TabsTrigger value="disclosures">Disclosures</TabsTrigger>
        </TabsList>

        <TabsContent value="links" className="space-y-4">
          {/* Add New Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Affiliate Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    placeholder="https://example.com/product"
                  />
                </div>
                <div>
                  <Label htmlFor="provider">Provider</Label>
                  <Select value={newLink.provider} onValueChange={(value) => setNewLink({ ...newLink, provider: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amazon">Amazon</SelectItem>
                      <SelectItem value="clickbank">ClickBank</SelectItem>
                      <SelectItem value="commission-junction">Commission Junction</SelectItem>
                      <SelectItem value="shareasale">ShareASale</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="affiliate-id">Affiliate ID</Label>
                  <Input
                    id="affiliate-id"
                    value={newLink.affiliate_id}
                    onChange={(e) => setNewLink({ ...newLink, affiliate_id: e.target.value })}
                    placeholder="your-affiliate-id"
                  />
                </div>
                <div>
                  <Label htmlFor="commission-rate">Commission Rate (%)</Label>
                  <Input
                    id="commission-rate"
                    type="number"
                    value={newLink.commission_rate}
                    onChange={(e) => setNewLink({ ...newLink, commission_rate: parseFloat(e.target.value) || 0 })}
                    placeholder="5.0"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddLink} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links Table */}
          <Card>
            <CardHeader>
              <CardTitle>Affiliate Links ({affiliateLinks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Last Checked</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliateLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getHealthIcon(link.is_healthy)}
                          {getHealthBadge(link.is_healthy)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{link.provider}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate max-w-xs"
                          >
                            {link.url}
                          </a>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </TableCell>
                      <TableCell>{link.commission_rate}%</TableCell>
                      <TableCell>
                        {new Date(link.last_checked).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(link.url, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveLink(link.id)}
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

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Auto-Insertion Settings
              </CardTitle>
              <CardDescription>
                Configure how affiliate links are automatically inserted into review content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-insert-enabled">Enable Auto-Insertion</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically insert affiliate links when products are mentioned
                  </p>
                </div>
                <Switch
                  id="auto-insert-enabled"
                  checked={autoInsertSettings.enabled}
                  onCheckedChange={(checked) => setAutoInsertSettings({ ...autoInsertSettings, enabled: checked })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max-links">Max Links per Section</Label>
                  <Input
                    id="max-links"
                    type="number"
                    value={autoInsertSettings.maxLinksPerSection}
                    onChange={(e) => setAutoInsertSettings({ ...autoInsertSettings, maxLinksPerSection: parseInt(e.target.value) || 1 })}
                    min="1"
                    max="10"
                  />
                </div>
                <div>
                  <Label htmlFor="insert-position">Insert Position</Label>
                  <Select 
                    value={autoInsertSettings.insertAtFirstMention ? 'first' : 'last'} 
                    onValueChange={(value) => setAutoInsertSettings({ ...autoInsertSettings, insertAtFirstMention: value === 'first' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first">First Mention</SelectItem>
                      <SelectItem value="last">Last Mention</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="add-disclosure">Add Disclosure Blocks</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically add disclosure blocks when affiliate links are inserted
                  </p>
                </div>
                <Switch
                  id="add-disclosure"
                  checked={autoInsertSettings.addDisclosure}
                  onCheckedChange={(checked) => setAutoInsertSettings({ ...autoInsertSettings, addDisclosure: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disclosures" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Disclosure Blocks</h3>
              <p className="text-sm text-muted-foreground">
                Manage disclosure blocks for affiliate links
              </p>
            </div>
            <Button onClick={onGenerateDisclosure}>
              <Plus className="h-4 w-4 mr-2" />
              Generate Disclosures
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {disclosureBlocks.map((block) => (
              <Card key={block.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{block.type.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={block.is_active}
                        onCheckedChange={() => handleToggleDisclosure(block.id)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyDisclosure(block.text)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Position: {block.position} {block.provider && `• Provider: ${block.provider}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={block.text}
                    readOnly
                    className="min-h-[100px]"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
