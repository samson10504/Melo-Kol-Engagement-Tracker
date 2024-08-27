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
import { ThumbsUp, MessageCircle, Coins, RefreshCw, UserPlus, UserMinus, Calendar, Settings, Filter, PlusCircle, Database, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { calculateTokens, formatDate, getKolName, getKolAvatar } from '@/lib/utils';
import PostCard from './PostCard';
import Analytics from './Analytics';
import { mockPosts, mockKols } from '@/data/mockData';

export default function KOLTracker() {
  const [posts, setPosts] = useState<any[]>([]);
  const [kols, setKols] = useState<any[]>([]);
  const [tokenSettings, setTokenSettings] = useState({ tokensPerLike: 1, tokensPerComment: 5 });
  const [newPosts, setNewPosts] = useState<{ url: string; kolId: string }[]>([{ url: '', kolId: '' }]);
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
      const formattedKols = Array.isArray(data) ? data.map(kol => ({
        ...kol,
        id: kol.id.toString() // Ensure ID is a string
      })) : [];
      setKols(formattedKols);
    } catch (error) {
      console.error('Error fetching KOLs:', error);
      showAlert('Error fetching KOLs', 'error');
      setKols([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePosts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPosts.some(post => !post.url.trim() || !post.kolId || isNaN(parseInt(post.kolId, 10)))) {
      showAlert('Please fill in all fields with valid values for all posts', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          posts: newPosts.map(post => ({
            url: post.url,
            kol_id: parseInt(post.kolId, 10)
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
      }

      const createdPosts = await response.json();
      console.log('Response from server:', createdPosts);
      
      if (Array.isArray(createdPosts)) {
        setPosts(prevPosts => [...prevPosts, ...createdPosts]);
        setNewPosts([{ url: '', kolId: '' }]);
        showAlert('Posts created and updated successfully', 'success');
      } else {
        console.error('Unexpected response format:', createdPosts);
        showAlert('Unexpected response format from server', 'error');
      }
    } catch (error) {
      console.error('Error creating posts:', error);
      showAlert(`Error creating posts: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePost = useCallback(async (id: string, newCounts: { date: string; likes: number; comments: number; }[]) => {
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

  const handleDeletePost = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from server:', errorData);
        throw new Error(`Failed to delete post: ${errorData.error || 'Unknown error'}`);
      }
      setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
      showAlert('Post deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting post:', error);
      showAlert(`Error deleting post: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      setKols(prevKols => [...prevKols, { ...data, id: data.id.toString() }]);
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
        latestCount.comments || 0,
        tokenSettings.tokensPerLike,
        tokenSettings.tokensPerComment
      );

      return {
        likes: total.likes + (latestCount.likes || 0),
        comments: total.comments + (latestCount.comments || 0),
        tokens: total.tokens + postTokens
      };
    }, { likes: 0, comments: 0, tokens: 0 });
  }, [filteredPosts, tokenSettings]);

  const fetchPostUpdate = useCallback(async (postId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/fetch`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
      }
      const updatedPost = await response.json();
      console.log('Fetched updated post:', updatedPost);
      setPosts(prevPosts => prevPosts.map(post => post.id === updatedPost.id ? updatedPost : post));
      showAlert(`Post ${postId} updated successfully`, 'success');
      return updatedPost; // Return the updated post
    } catch (error) {
      console.error(`Error updating post ${postId}:`, error);
      showAlert(`Error updating post ${postId}: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      return null; // Return null in case of an error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllUpdates = async () => {
    setIsLoading(true);
    showAlert('Fetching updates for all posts...', 'info');
    try {
      const response = await fetch('/api/posts/fetch-all/fetch', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedPosts = await response.json();
      
      // Update the posts state with the new data
      setPosts(prevPosts => {
        const updatedPostsMap = new Map(updatedPosts.map((post: { url: string, id: string | number }) => [post.url, post]));
        return prevPosts.map((post: any) => {
          const updatedPost = updatedPostsMap.get(post.url);
          if (updatedPost) {
            console.log(`Updating post ${post.id} with new data:`, updatedPost);
            return { ...post, ...updatedPost };
          }
          console.log(`No update found for post ${post.id}, keeping original data`);
          return post;
        });
      });

      const updatedCount = updatedPosts.filter((post: any) => post.counts && post.counts.length > 0).length;
      showAlert(`${updatedCount} posts updated successfully`, 'success');
    } catch (error) {
      console.error('Error updating posts:', error);
      showAlert(`Error updating posts: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">KOL Instagram Engagement Tracker</h1>
        <div className="flex space-x-2">
          <Button onClick={fetchAllUpdates} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Fetch All
          </Button>
          <Button onClick={importMockData} disabled={isLoading} variant="secondary">
            <Database className="mr-2 h-4 w-4" /> Import Mock Data
          </Button>
        </div>
      </header>

      {alert && (
        <Alert className="mb-4" variant={alert.type === 'error' ? 'destructive' : 'default'}>
          <AlertTitle>{alert.type === 'error' ? 'Error' : 'Success'}</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coins className="mr-2 h-5 w-5 text-yellow-500" />
              Total Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center"><ThumbsUp className="mr-2 h-4 w-4 text-green-500" /> Likes:</span>
              <span className="font-bold text-lg">{totalEngagement.likes.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center"><MessageCircle className="mr-2 h-4 w-4 text-blue-500" /> Comments:</span>
              <span className="font-bold text-lg">{totalEngagement.comments.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center"><Coins className="mr-2 h-4 w-4 text-yellow-500" /> Tokens:</span>
              <span className="font-bold text-lg">{totalEngagement.tokens.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="kolFilter" className="mb-2 block">Select KOL</Label>
              <Select value={selectedKol} onValueChange={setSelectedKol}>
                <SelectTrigger id="kolFilter" className="w-full">
                  <SelectValue placeholder="Select a KOL" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All KOLs</SelectItem>
                  {(Array.isArray(kols) ? kols : []).map(kol => (
                    <SelectItem key={kol.id} value={kol.id.toString()}>{kol.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateFilterStart" className="mb-2 block">Date Range</Label>
              <div className="flex space-x-2">
                <Input
                  id="dateFilterStart"
                  type="date"
                  value={dateFilter.start}
                  onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                  className="w-full"
                />
                <Input
                  id="dateFilterEnd"
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
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Token Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="tokensPerLike" className="mb-2 block">Tokens per Like</Label>
            <Input
              id="tokensPerLike"
              type="number"
              min="0"
              step="0.01"
              value={tokenSettings.tokensPerLike}
              onChange={(e) => setTokenSettings(prev => ({ ...prev, tokensPerLike: parseFloat(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="tokensPerComment" className="mb-2 block">Tokens per Comment</Label>
            <Input
              id="tokensPerComment"
              type="number"
              min="0"
              step="0.01"
              value={tokenSettings.tokensPerComment}
              onChange={(e) => setTokenSettings(prev => ({ ...prev, tokensPerComment: parseFloat(e.target.value) }))}
            />
          </div>
        </CardContent>
      </Card>
      </div>

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="create">Track Post</TabsTrigger>
          <TabsTrigger value="kols">Manage KOLs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <ScrollArea className="h-[600px] rounded-md border p-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
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
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PlusCircle className="mr-2 h-5 w-5" />
                Track New Post
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePosts} className="space-y-4">
                {newPosts.map((post, index) => (
                  <div key={index} className="space-y-4 border p-4 rounded">
                    <div className="space-y-2">
                      <Label htmlFor={`postUrl-${index}`}>Instagram Post URL</Label>
                      <Input
                        id={`postUrl-${index}`}
                        type="text"
                        placeholder="https://www.instagram.com/p/..."
                        value={post.url}
                        onChange={(e) => {
                          const updatedPosts = [...newPosts];
                          updatedPosts[index].url = e.target.value;
                          setNewPosts(updatedPosts);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`kolId-${index}`}>Select KOL</Label>
                      <Select
                        value={post.kolId}
                        onValueChange={(value) => {
                          const updatedPosts = [...newPosts];
                          updatedPosts[index].kolId = value;
                          setNewPosts(updatedPosts);
                        }}
                      >
                        <SelectTrigger id={`kolId-${index}`}>
                          <SelectValue placeholder="Select a KOL" />
                        </SelectTrigger>
                        <SelectContent>
                          {kols.map(kol => (
                            <SelectItem key={kol.id} value={kol.id.toString()}>{kol.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setNewPosts(posts => posts.filter((_, i) => i !== index))}
                      >
                        Remove Post
                      </Button>
                    )}
                  </div>
                ))}
                <div className="flex space-x-4 mt-4">
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={() => setNewPosts(posts => [...posts, { url: '', kolId: '' }])}
                  >
                    Add Another Post
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    Track Posts
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kols">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="mr-2 h-5 w-5" />
                Manage KOLs
              </CardTitle>
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
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  Add KOL
                </Button>
              </form>
              <div className="space-y-2">
                {kols.map(kol => (
                  <div key={kol.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 transition-colors">
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