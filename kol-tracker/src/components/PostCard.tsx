// File: src/components/PostCard.tsx

'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Trash2, RefreshCw } from 'lucide-react';
import { calculateTokens, formatDate, getKolName } from '@/lib/utils';

interface PostCardProps {
  post: any;
  kols: Array<{ id: string; name: string; }>;
  tokenSettings: { likesToToken: number; viewsToToken: number; };
  onUpdate: (id: number, likes: number, views: number) => void;
  onDelete: (id: number) => void;
}

export default function PostCard({ post, kols, tokenSettings, onUpdate, onDelete }: PostCardProps) {
  const [manualMode, setManualMode] = useState(false);
  const [manualLikes, setManualLikes] = useState(post.counts[post.counts.length - 1]?.likes || 0);
  const [manualViews, setManualViews] = useState(post.counts[post.counts.length - 1]?.views || 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{getKolName(post.kolId, kols)}</CardTitle>
            <p className="text-sm text-muted-foreground">Created: {formatDate(post.creation_date)}</p>
          </div>
          <Badge variant="secondary">
            {calculateTokens(
              post.counts[post.counts.length - 1]?.likes || 0,
              post.counts[post.counts.length - 1]?.views || 0,
              tokenSettings.likesToToken,
              tokenSettings.viewsToToken
            )} tokens
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground truncate">{post.url}</p>
        {post.counts.map((count, index) => (
          <div key={index} className="space-y-1">
            <p className="font-medium">Count {index + 1} ({formatDate(count.date)})</p>
            <div className="flex justify-between">
              <span>Likes: <span className="font-bold">{count.likes}</span></span>
              <span>Views: <span className="font-bold">{count.views}</span></span>
            </div>
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
          <div className="space-y-2">
            <Input 
              type="number" 
              value={manualLikes} 
              onChange={(e) => setManualLikes(parseInt(e.target.value))}
              placeholder="Likes"
            />
            <Input 
              type="number" 
              value={manualViews} 
              onChange={(e) => setManualViews(parseInt(e.target.value))}
              placeholder="Views"
            />
            <Button onClick={() => onUpdate(post.id, manualLikes, manualViews)}>
              <RefreshCw className="mr-2 h-4 w-4" /> Update
            </Button>
          </div>
        )}
        <Button variant="destructive" className="w-full" onClick={() => onDelete(post.id)}>
          <Trash2 className="mr-2 h-4 w-4" /> Delete Post
        </Button>
      </CardContent>
    </Card>
  );
}