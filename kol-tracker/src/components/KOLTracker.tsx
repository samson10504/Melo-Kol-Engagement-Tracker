// File: src/components/KOLTracker.tsx

'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, Eye, Coins, RefreshCw, UserPlus, UserMinus } from 'lucide-react';
import { mockPosts, mockKols } from '@/data/mockData';
import { calculateTokens, formatDate, getKolName } from '@/lib/utils';
import PostCard from './PostCard';
import Analytics from './Analytics';

export default function KOLTracker() {
  const [posts, setPosts] = useState(mockPosts);
  const [kols, setKols] = useState(mockKols);
  const [tokenSettings, setTokenSettings] = useState({ likesToToken: 1, viewsToToken: 50 });
  const [newPost, setNewPost] = useState({ url: '', kolId: '' });
  const [newKol, setNewKol] = useState({ name: '', avatar: '' });
  const [alert, setAlert] = useState(null);
  const [selectedKol, setSelectedKol] = useState('all');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    const newPostWithId = { 
      ...newPost, 
      id: Date.now(),
      creation_date: new Date().toISOString().split('T')[0],
      counts: []
    };
    setPosts([...posts, newPostWithId]);
    setNewPost({ url: '', kolId: '' });
    showAlert('Post created successfully', 'success');
  };

  const handleUpdatePost = (id, likes, views) => {
    const updatedPosts = posts.map(post => 
      post.id === id ? { 
        ...post, 
        counts: [...post.counts, { date: new Date().toISOString().split('T')[0], likes: parseInt(likes), views: parseInt(views) }] 
      } : post
    );
    setPosts(updatedPosts);
    showAlert('Post updated successfully', 'success');
  };

  const handleDeletePost = (id) => {
    const updatedPosts = posts.filter(post => post.id !== id);
    setPosts(updatedPosts);
    showAlert('Post deleted successfully', 'success');
  };

  const handleCreateKol = (e) => {
    e.preventDefault();
    const newKolWithId = { 
      ...newKol, 
      id: Date.now().toString(),
      avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${newKol.name}`
    };
    setKols([...kols, newKolWithId]);
    setNewKol({ name: '', avatar: '' });
    showAlert('KOL created successfully', 'success');
  };

  const handleDeleteKol = (id) => {
    const updatedKols = kols.filter(kol => kol.id !== id);
    setKols(updatedKols);
    showAlert('KOL deleted successfully', 'success');
  };

  const filterPosts = (postsToFilter) => {
    return postsToFilter.filter(post => {
      const kolMatch = selectedKol === 'all' || post.kolId === selectedKol;
      const dateMatch = (!dateFilter.start || new Date(post.creation_date) >= new Date(dateFilter.start)) &&
                        (!dateFilter.end || new Date(post.creation_date) <= new Date(dateFilter.end));
      return kolMatch && dateMatch;
    });
  };

  const fetchUpdates = async () => {
    showAlert('Fetching updates from backend...', 'info');
    setTimeout(() => {
      const updatedPosts = posts.map(post => {
        const now = new Date();
        const creationDate = new Date(post.creation_date);
        const daysSinceCreation = Math.floor((now - creationDate) / (1000 * 60 * 60 * 24));
        
        if (daysSinceCreation >= 7 && post.counts.length === 0) {
          post.counts.push({
            date: new Date(creationDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            likes: Math.floor(Math.random() * 1000),
            views: Math.floor(Math.random() * 5000)
          });
        } else if (daysSinceCreation >= 30 && post.counts.length === 1) {
          post.counts.push({
            date: new Date(creationDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            likes: Math.floor(Math.random() * 2000),
            views: Math.floor(Math.random() * 10000)
          });
        }
        return post;
      });
      setPosts(updatedPosts);
      showAlert('Posts updated successfully', 'success');
    }, 2000);
  };

  const TotalEngagement = ({ likes, views, tokens }) => (
    <Card>
      <CardHeader>
        <CardTitle>Total Engagement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <ThumbsUp className="text-green-500" />
          <span>Likes:</span>
          <span className="font-bold">{likes}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Eye className="text-blue-500" />
          <span>Views:</span>
          <span className="font-bold">{views}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Coins className="text-yellow-500" />
          <span>Tokens:</span>
          <span className="font-bold">{tokens}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">KOL Instagram Engagement Tracker</h1>

      {alert && (
        <Alert className="mb-4" variant={alert.type === 'error' ? 'destructive' : 'default'}>
          <AlertTitle>{alert.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <TotalEngagement 
          likes={filterPosts(posts).reduce((sum, post) => sum + (post.counts[post.counts.length - 1]?.likes || 0), 0)}
          views={filterPosts(posts).reduce((sum, post) => sum + (post.counts[post.counts.length - 1]?.views || 0), 0)}
          tokens={filterPosts(posts).reduce((sum, post) => sum + calculateTokens(post.counts[post.counts.length - 1]?.likes || 0, post.counts[post.counts.length - 1]?.views || 0, tokenSettings.likesToToken, tokenSettings.viewsToToken), 0)}
        />
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Select value={selectedKol} onValueChange={setSelectedKol}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a KOL" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All KOLs</SelectItem>
                  {kols.map(kol => (
                    <SelectItem key={kol.id} value={kol.id}>{kol.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={dateFilter.start}
                  onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                  className="w-full"
                />
                <Input
                  type="date"
                  value={dateFilter.end}
                  onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Token Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <Label htmlFor="likesToToken">Likes per Token</Label>
                <Input
                  id="likesToToken"
                  type="number"
                  value={tokenSettings.likesToToken}
                  onChange={(e) => setTokenSettings(prev => ({ ...prev, likesToToken: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="viewsToToken">Views per Token</Label>
                <Input
                  id="viewsToToken"
                  type="number"
                  value={tokenSettings.viewsToToken}
                  onChange={(e) => setTokenSettings(prev => ({ ...prev, viewsToToken: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={fetchUpdates} className="mb-6">
        <RefreshCw className="mr-2 h-4 w-4" /> Fetch Updates
      </Button>

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="create">Create Post</TabsTrigger>
          <TabsTrigger value="kols">Manage KOLs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <ScrollArea className="h-[600px] rounded-md border p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterPosts(posts).map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  kols={kols}
                  tokenSettings={tokenSettings}
                  onUpdate={handleUpdatePost}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Post</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="postUrl">Instagram Post URL</Label>
                  <Input
                    id="postUrl"
                    type="text"
                    placeholder="https://www.instagram.com/p/..."
                    value={newPost.url}
                    onChange={(e) => setNewPost({ ...newPost, url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kolId">Select KOL</Label>
                  <Select value={newPost.kolId} onValueChange={(value) => setNewPost({ ...newPost, kolId: value })}>
                    <SelectTrigger id="kolId">
                      <SelectValue placeholder="Select a KOL" />
                    </SelectTrigger>
                    <SelectContent>
                      {kols.map(kol => (
                        <SelectItem key={kol.id} value={kol.id}>{kol.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit">Create Post</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kols">
          <Card>
            <CardHeader>
              <CardTitle>Manage KOLs</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateKol} className="space-y-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="kolName">KOL Name</Label>
                  <Input
                    id="kolName"
                    type="text"
                    placeholder="Enter KOL name"
                    value={newKol.name}
                    onChange={(e) => setNewKol({ ...newKol, name: e.target.value })}
                  />
                </div>
                <Button type="submit">
                  <UserPlus className="mr-2 h-4 w-4" /> Add KOL
                </Button>
              </form>
              <div className="space-y-2">
                {kols.map(kol => (
                  <div key={kol.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src={kol.avatar} alt={kol.name} />
                        <AvatarFallback>{kol.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{kol.name}</span>
                    </div>
                    <Button variant="destructive" onClick={() => handleDeleteKol(kol.id)}>
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Analytics 
            posts={filterPosts(posts)}
            kols={kols}
            tokenSettings={tokenSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}