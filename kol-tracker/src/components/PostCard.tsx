// File: src/components/PostCard.tsx

'use client';

// File: src/components/PostCard.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Minus, RefreshCw, ThumbsUp, Eye, Coins, Calendar } from 'lucide-react';
import { calculateTokens, formatDate, getKolName } from '@/lib/utils';

interface PostCardProps {
  post: {
    id: string;
    kol_id: string;
    kol_name?: string;
    url: string;
    creation_date: string;
    counts: Array<{ date: string; likes: number; views: number }>;
    lastFetch?: { date: string; likes: number; views: number; tokens: number };
  };
  kols: Array<{ id: string; name: string }>;
  tokenSettings: { likesToToken: number; viewsToToken: number };
  onUpdate: (id: string, counts: Array<{ date: string; likes: number; views: number }>) => Promise<void>;
  onDelete: (id: string) => void;
  onFetch: (id: string) => void;
}

export default function PostCard({ post, kols, tokenSettings, onUpdate, onDelete, onFetch }: PostCardProps) {
  const [manualMode, setManualMode] = useState(false);
  const [counts, setCounts] = useState(post.counts);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCounts(post.counts);
  }, [post.counts]);

  const handleCountChange = useCallback((index: number, field: 'date' | 'likes' | 'views', value: string | number) => {
    const newCounts = counts.map((count, i) => 
      i === index ? { ...count, [field]: field === 'date' ? value : Number(value) } : count
    );
    setCounts(newCounts);
  }, [counts]);

  const handleUpdateCounts = useCallback(async () => {
    try {
      setIsLoading(true);
      await onUpdate(post.id, counts);
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setIsLoading(false);
    }
  }, [counts, post.id, onUpdate]);

  const handleAddCount = useCallback(() => {
    const newCounts = [...counts, { date: new Date().toISOString().split('T')[0], likes: 0, views: 0 }];
    setCounts(newCounts);
  }, [counts]);

  const handleRemoveCount = useCallback((index: number) => {
    const newCounts = counts.filter((_, i) => i !== index);
    setCounts(newCounts);
  }, [counts]);

  const handleManualModeChange = useCallback(async (checked: boolean) => {
    setManualMode(checked);
    if (!checked) {
      await handleUpdateCounts();
    }
  }, [handleUpdateCounts]);

  const latestCount = counts[counts.length - 1] || { likes: 0, views: 0, date: '' };
  const totalTokens = calculateTokens(
    latestCount.likes,
    latestCount.views,
    tokenSettings.likesToToken,
    tokenSettings.viewsToToken
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{post.kol_name || getKolName(post.kol_id, kols) || 'Unknown KOL'}</CardTitle>
            <p className="text-sm text-muted-foreground">Created: {formatDate(post.creation_date)}</p>
          </div>
          <Badge variant="secondary">
            {totalTokens} tokens
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground truncate">{post.url}</p>
        {counts.map((count, index) => (
          <div key={index} className="space-y-1">
            <p className="font-medium">Count {index + 1} ({formatDate(count.date)})</p>
            {manualMode ? (
              <div className="flex justify-between space-x-2">
                <Input
                  type="date"
                  value={count.date}
                  onChange={(e) => handleCountChange(index, 'date', e.target.value)}
                  disabled={isLoading}
                />
                <Input
                  type="number"
                  value={count.likes}
                  onChange={(e) => handleCountChange(index, 'likes', e.target.value)}
                  placeholder="Likes"
                  disabled={isLoading}
                />
                <Input
                  type="number"
                  value={count.views}
                  onChange={(e) => handleCountChange(index, 'views', e.target.value)}
                  placeholder="Views"
                  disabled={isLoading}
                />
                <Button variant="destructive" onClick={() => handleRemoveCount(index)} disabled={isLoading}>
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="flex items-center"><ThumbsUp className="mr-1 h-4 w-4" /> {count.likes}</span>
                <span className="flex items-center"><Eye className="mr-1 h-4 w-4" /> {count.views}</span>
                <span className="flex items-center"><Coins className="mr-1 h-4 w-4" /> {calculateTokens(count.likes, count.views, tokenSettings.likesToToken, tokenSettings.viewsToToken)}</span>
              </div>
            )}
          </div>
        ))}
        <div className="flex items-center justify-between">
          <span>Manual Input Mode</span>
          <Switch 
            checked={manualMode} 
            onCheckedChange={handleManualModeChange}
          />
        </div>
        {manualMode && (
          <Button onClick={handleAddCount} className="w-full" disabled={isLoading}>
            <Plus className="mr-2 h-4 w-4" /> Add Count
          </Button>
        )}
        <div className="flex space-x-2">
          <Button onClick={() => onFetch(post.id)} className="flex-1" disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Fetch
          </Button>
          <Button variant="destructive" onClick={() => onDelete(post.id)} className="flex-1" disabled={isLoading}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete Post
          </Button>
        </div>
        {post.lastFetch && (
          <div className="mt-4 p-2 bg-gray-100 rounded">
            <p className="text-sm font-medium flex items-center">
              <Calendar className="mr-2 h-4 w-4" /> Last Fetch: {formatDate(post.lastFetch.date)}
            </p>
            <div className="flex justify-between mt-2">
              <span className="flex items-center"><ThumbsUp className="mr-1 h-4 w-4" /> {post.lastFetch.likes}</span>
              <span className="flex items-center"><Eye className="mr-1 h-4 w-4" /> {post.lastFetch.views}</span>
              <span className="flex items-center"><Coins className="mr-1 h-4 w-4" /> {post.lastFetch.tokens}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}