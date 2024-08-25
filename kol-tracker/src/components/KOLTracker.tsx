// File: src/components/KOLTracker.tsx

'use client';

// File: src/components/KOLTracker.tsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThumbsUp, Eye, Coins, RefreshCw, UserPlus, UserMinus, Calendar, Settings, Filter, PlusCircle, Database } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { calculateTokens, formatDate, getKolName, getKolAvatar } from '@/lib/utils';
import PostCard from './PostCard';
import Analytics from './Analytics';
import { mockPosts, mockKols } from '@/data/mockData';

export default function KOLTracker() {
  const [posts, setPosts] = useState<any[]>([]);
  const [kols, setKols] = useState<any[]>([]);
  const [tokenSettings, setTokenSettings] = useState({ likesToToken: 1, viewsToToken: 50 });
  const [newPost, setNewPost] = useState({ url: '', kolId: '' });
  const [newKol, setNewKol] = useState({ name: '', avatar: '' });
  const [alert, setAlert] = useState<{ message: string; type: string } | null>(null);
  const [selectedKol, setSelectedKol] = useState('all');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchKOLs();
  }, []);

  const showAlert = (message: string, type: string) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/posts');
      const data = await response.json();
      console.log('Posts API response:', data);
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      showAlert('Error fetching posts', 'error');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKOLs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/kols');
      const data = await response.json();
      console.log('KOLs API response:', data);
      setKols(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching KOLs:', error);
      showAlert('Error fetching KOLs', 'error');
      setKols([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.url.trim() || !newPost.kolId) {
      showAlert('Please fill in all fields', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: newPost.url,
          kol_id: parseInt(newPost.kolId, 10),
          creation_date: new Date().toISOString().split('T')[0],
          counts: []
        })
      });
      const data = await response.json();
      const selectedKol = kols.find(kol => kol.id.toString() === newPost.kolId);
      const newPostWithKolName = {
        ...data,
        kol_name: selectedKol ? selectedKol.name : 'Unknown KOL'
      };
      setPosts(prevPosts => [...prevPosts, newPostWithKolName]);
      setNewPost({ url: '', kolId: '' });
      showAlert('Post created successfully', 'success');
    } catch (error) {
      console.error('Error creating post:', error);
      showAlert('Error creating post', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePost = useCallback(async (id: number, newCounts: any[]) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ counts: newCounts })
      });
      const updatedPost = await response.json();
      setPosts(prevPosts => 
        prevPosts.map(post => post.id === id ? updatedPost : post)
      );
    } catch (error) {
      console.error('Error updating post:', error);
      showAlert('Error updating post', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeletePost = async (id: number) => {
    setIsLoading(true);
    try {
      await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
      showAlert('Post deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting post:', error);
      showAlert('Error deleting post', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKol.name.trim()) {
      showAlert('KOL name cannot be empty', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const avatar = `https://api.dicebear.com/6.x/avataaars/svg?seed=${encodeURIComponent(newKol.name)}`;
      const response = await fetch('/api/kols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newKol, avatar })
      });
      const data = await response.json();
      setKols(prevKols => [...prevKols, data]);
      setNewKol({ name: '', avatar: '' });
      showAlert('KOL created successfully', 'success');
    } catch (error) {
      console.error('Error creating KOL:', error);
      showAlert('Error creating KOL', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteKol = async (id: string) => {
    setIsLoading(true);
    try {
      await fetch(`/api/kols/${id}`, { method: 'DELETE' });
      setKols(prevKols => prevKols.filter(kol => kol.id !== id));
      showAlert('KOL deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting KOL:', error);
      showAlert('Error deleting KOL', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const importMockData = async () => {
    setIsLoading(true);
    showAlert('Importing mock data...', 'info');
    try {
      // Import mock KOLs and keep track of their new IDs
      const kolIdMap = new Map();
      for (const kol of mockKols) {
        const response = await fetch('/api/kols', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(kol)
        });
        const newKol = await response.json();
        kolIdMap.set(kol.id, newKol.id);
      }
      
      // Import mock posts using the new KOL IDs
      for (const post of mockPosts) {
        const newKolId = kolIdMap.get(post.kolId);
        if (newKolId) {
          try {
            const response = await fetch('/api/posts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                url: post.url,
                kol_id: newKolId, // Use kol_id instead of kolId
                creation_date: post.creation_date,
                counts: post.counts // Don't stringify counts here
              })
            });
            if (!response.ok) {
              const errorData = await response.json();
              console.error('Error creating post:', errorData);
            } else {
              const newPost = await response.json();
              console.log('Created post:', newPost);
            }
          } catch (error) {
            console.error('Error creating post:', error);
          }
        } else {
          console.error('No matching KOL found for:', post.kolId);
        }
      }
      showAlert('Mock data imported successfully', 'success');
      fetchPosts();
      fetchKOLs();
    } catch (error) {
      console.error('Error importing mock data:', error);
      showAlert('Error importing mock data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    return (Array.isArray(posts) ? posts : []).filter(post => {
      const kolMatch = selectedKol === 'all' || post.kol_id.toString() === selectedKol;
      const dateMatch = (!dateFilter.start || new Date(post.creation_date) >= new Date(dateFilter.start)) &&
                        (!dateFilter.end || new Date(post.creation_date) <= new Date(dateFilter.end));
      return kolMatch && dateMatch;
    });
  }, [posts, selectedKol, dateFilter]);

  const totalEngagement = useMemo(() => {
    return filteredPosts.reduce((total, post) => {
      if (!post.counts || !Array.isArray(post.counts) || post.counts.length === 0) {
        return total; // Skip this post if counts is not a valid array
      }

      const latestCount = post.counts[post.counts.length - 1];
      if (!latestCount) return total;

      const postTokens = calculateTokens(
        latestCount.likes || 0,
        latestCount.views || 0,
        tokenSettings.likesToToken,
        tokenSettings.viewsToToken
      );

      return {
        likes: total.likes + (latestCount.likes || 0),
        views: total.views + (latestCount.views || 0),
        tokens: total.tokens + postTokens
      };
    }, { likes: 0, views: 0, tokens: 0 });
  }, [filteredPosts, tokenSettings]);

  const fetchPostUpdate = useCallback(async (postId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}`);
      const updatedPost = await response.json();
      setPosts(prevPosts => prevPosts.map(post => post.id === postId ? updatedPost : post));
      showAlert(`Post ${postId} updated successfully`, 'success');
    } catch (error) {
      console.error(`Error updating post ${postId}:`, error);
      showAlert(`Error updating post ${postId}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllUpdates = async () => {
    setIsLoading(true);
    showAlert('Fetching updates for all posts...', 'info');
    try {
      await Promise.all(posts.map(post => fetchPostUpdate(post.id)));
      showAlert('All posts updated successfully', 'success');
    } catch (error) {
      console.error('Error updating some posts:', error);
      showAlert('Error updating some posts', 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
        <Card>
          <CardHeader>
            <CardTitle>Total Engagement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <ThumbsUp className="text-green-500" />
              <span>Likes:</span>
              <span className="font-bold">{totalEngagement.likes}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="text-blue-500" />
              <span>Views:</span>
              <span className="font-bold">{totalEngagement.views}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Coins className="text-yellow-500" />
              <span>Tokens:</span>
              <span className="font-bold">{totalEngagement.tokens}</span>
            </div>
          </CardContent>
        </Card>
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
                  {(Array.isArray(kols) ? kols : []).map(kol => (
                    <SelectItem key={kol.id} value={kol.id.toString()}>{kol.name}</SelectItem>
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
      
      <div className="flex justify-between items-center mb-6">
        <Button onClick={fetchAllUpdates} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" /> Fetch All
        </Button>
        <Button onClick={importMockData} disabled={isLoading}>
          <Database className="mr-2 h-4 w-4" /> Import Mock Data
        </Button>
      </div>
      

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
              {filteredPosts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  kols={kols}
                  tokenSettings={tokenSettings}
                  onUpdate={handleUpdatePost}
                  onDelete={handleDeletePost}
                  onFetch={fetchPostUpdate}
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
                        <SelectItem key={kol.id} value={kol.id.toString()}>{kol.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={isLoading}>Create Post</Button>
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
                <Button type="submit" disabled={isLoading || !newKol.name.trim()}>
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
                    <Button variant="destructive" onClick={() => handleDeleteKol(kol.id)} disabled={isLoading}>
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
            posts={filteredPosts}
            kols={kols}
            tokenSettings={tokenSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
