// File: src/components/PostCard.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Minus, RefreshCw, ThumbsUp, Eye, Coins, Calendar } from 'lucide-react';
import { calculateTokens, formatDate, getKolName } from '@/lib/utils';

interface PostCardProps {
  post: any;
  kols: Array<{ id: string; name: string; }>;
  tokenSettings: { likesToToken: number; viewsToToken: number; };
  onUpdate: (id: number, counts: Array<{ date: string; likes: number; views: number; }>) => void;
  onDelete: (id: number) => void;
  onFetch: (id: number) => void;
}

export default function PostCard({ post, kols, tokenSettings, onUpdate, onDelete, onFetch }: PostCardProps) {
  const [manualMode, setManualMode] = useState(false);
  const [counts, setCounts] = useState(post.counts);

  const handleCountChange = useCallback((index: number, field: 'date' | 'likes' | 'views', value: string | number) => {
    setCounts(prevCounts => {
      const newCounts = [...prevCounts];
      newCounts[index] = { ...newCounts[index], [field]: field === 'date' ? value : Number(value) };
      return newCounts;
    });
  }, []);

  const handleAddCount = useCallback(() => {
    setCounts(prevCounts => [...prevCounts, { date: new Date().toISOString().split('T')[0], likes: 0, views: 0 }]);
  }, []);

  const handleRemoveCount = useCallback((index: number) => {
    setCounts(prevCounts => prevCounts.filter((_, i) => i !== index));
  }, []);

  useEffect(() => {
    if (JSON.stringify(counts) !== JSON.stringify(post.counts)) {
      onUpdate(post.id, counts);
    }
  }, [counts, post.id, post.counts, onUpdate]);

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
            <CardTitle>{getKolName(post.kolId, kols)}</CardTitle>
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
                />
                <Input
                  type="number"
                  value={count.likes}
                  onChange={(e) => handleCountChange(index, 'likes', e.target.value)}
                  placeholder="Likes"
                />
                <Input
                  type="number"
                  value={count.views}
                  onChange={(e) => handleCountChange(index, 'views', e.target.value)}
                  placeholder="Views"
                />
                <Button variant="destructive" onClick={() => handleRemoveCount(index)}>
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
            onCheckedChange={setManualMode}
          />
        </div>
        {manualMode && (
          <Button onClick={handleAddCount} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Add Count
          </Button>
        )}
        <div className="flex space-x-2">
          <Button onClick={() => onFetch(post.id)} className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" /> Fetch
          </Button>
          <Button variant="destructive" onClick={() => onDelete(post.id)} className="flex-1">
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