'use client';
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { ThumbsUp, Eye, Coins, Trash2, RefreshCw, UserPlus, UserMinus } from 'lucide-react';

// Mock data
const mockPosts = [
  { 
    id: 1, 
    url: 'https://www.instagram.com/p/123', 
    kolId: '1', 
    creation_date: '2023-07-26', 
    counts: [
      { date: '2023-08-02', likes: 1000, views: 5000 },
      { date: '2023-08-26', likes: 1500, views: 7500 }
    ]
  },
  // ... more mock posts
];

const mockKols = [
  { id: '1', name: 'John Doe', avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=John' },
  { id: '2', name: 'Jane Smith', avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Jane' },
  { id: '3', name: 'Bob Johnson', avatar: 'https://api.dicebear.com/6.x/avataaars/svg?seed=Bob' },
];

export default function ImprovedKOLTracker() {
  const [posts, setPosts] = useState(mockPosts);
  const [kols, setKols] = useState(mockKols);
  const [tokenSettings, setTokenSettings] = useState({ likesToToken: 1, viewsToToken: 50 });
  const [newPost, setNewPost] = useState({ url: '', kolId: '' });
  const [newKol, setNewKol] = useState({ name: '', avatar: '' });
  const [alert, setAlert] = useState(null);
  const [selectedKol, setSelectedKol] = useState('all');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  const calculateTokens = (likes, views) => {
    return Math.floor(likes / tokenSettings.likesToToken) + Math.floor(views / tokenSettings.viewsToToken);
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getKolName = (kolId) => {
    const kol = kols.find(k => k.id === kolId);
    return kol ? kol.name : 'Unknown KOL';
  };

  const getKolAvatar = (kolId) => {
    const kol = kols.find(k => k.id === kolId);
    return kol ? kol.avatar : '';
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
    // This would be an API call in a real application
    showAlert('Fetching updates from backend...', 'info');
    // Simulate backend update
    setTimeout(() => {
      const updatedPosts = posts.map(post => {
        const now = new Date();
        const creationDate = new Date(post.creation_date);
        const daysSinceCreation = Math.floor((now - creationDate) / (1000 * 60 * 60 * 24));
        
        if (daysSinceCreation >= 7 && post.counts.length === 0) {
          // First count after a week
          post.counts.push({
            date: new Date(creationDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            likes: Math.floor(Math.random() * 1000),
            views: Math.floor(Math.random() * 5000)
          });
        } else if (daysSinceCreation >= 30 && post.counts.length === 1) {
          // Second count after a month
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
    <Card className="bg-[#E6F3FF]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#1E40AF]">Total Engagement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <ThumbsUp className="text-[#10B981]" />
          <span className="text-lg font-semibold">Likes:</span>
          <span className="text-2xl font-bold text-[#10B981]">{likes}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Eye className="text-[#8B5CF6]" />
          <span className="text-lg font-semibold">Views:</span>
          <span className="text-2xl font-bold text-[#8B5CF6]">{views}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Coins className="text-[#F59E0B]" />
          <span className="text-lg font-semibold">Tokens:</span>
          <span className="text-2xl font-bold text-[#F59E0B]">{tokens}</span>
        </div>
      </CardContent>
    </Card>
  );

  const PostCard = ({ post }) => {
    const [manualMode, setManualMode] = useState(false);
    const [manualLikes, setManualLikes] = useState(post.counts[post.counts.length - 1]?.likes || 0);
    const [manualViews, setManualViews] = useState(post.counts[post.counts.length - 1]?.views || 0);

    return (
      <Card className="bg-[#F3F4F6] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-bold">{getKolName(post.kolId)}</CardTitle>
              <p className="text-sm opacity-80">Created: {formatDate(post.creation_date)}</p>
            </div>
            <Badge className="bg-[#F59E0B] text-white">
              {calculateTokens(post.counts[post.counts.length - 1]?.likes || 0, post.counts[post.counts.length - 1]?.views || 0)} tokens
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 mt-4">
          <p className="text-sm text-gray-600 truncate">{post.url}</p>
          {post.counts.map((count, index) => (
            <div key={index} className="space-y-1">
              <p className="font-bold text-[#4B5563]">Count {index + 1} ({formatDate(count.date)})</p>
              <div className="flex justify-between">
                <span className="text-[#3B82F6] font-medium">Likes: <span className="font-bold text-black">{count.likes}</span></span>
                <span className="text-[#3B82F6] font-medium">Views: <span className="font-bold text-black">{count.views}</span></span>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <span>Manual Input Mode</span>
            <Switch 
              checked={manualMode} 
              onCheckedChange={setManualMode} 
              className="data-[state=checked]:bg-purple-600"
            />
          </div>
          {manualMode && (
            <div className="space-y-2">
              <Input 
                type="number" 
                value={manualLikes} 
                onChange={(e) => setManualLikes(e.target.value)}
                placeholder="Likes"
              />
              <Input 
                type="number" 
                value={manualViews} 
                onChange={(e) => setManualViews(e.target.value)}
                placeholder="Views"
              />
              <Button onClick={() => handleUpdatePost(post.id, manualLikes, manualViews)}>
                <RefreshCw className="mr-2 h-4 w-4" /> Update
              </Button>
            </div>
          )}
          <Button variant="destructive" className="w-full bg-gradient-to-r from-[#EF4444] to-[#DC2626]" onClick={() => handleDeletePost(post.id)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete Post
          </Button>
        </CardContent>
      </Card>
    );
  };

  const Analytics = () => (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Engagement Trend by KOL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filterPosts(posts).flatMap(post => post.counts.map(count => ({
                ...count,
                kolName: getKolName(post.kolId)
              })))}>
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip labelFormatter={formatDate} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="likes" stroke="#8884d8" name="Likes" />
                <Line yAxisId="right" type="monotone" dataKey="views" stroke="#82ca9d" name="Views" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>KOL Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kols.map(kol => ({
                name: kol.name,
                totalLikes: filterPosts(posts)
                  .filter(post => post.kolId === kol.id)
                  .reduce((sum, post) => sum + (post.counts[post.counts.length - 1]?.likes || 0), 0),
                totalViews: filterPosts(posts)
                  .filter(post => post.kolId === kol.id)
                  .reduce((sum, post) => sum + (post.counts[post.counts.length - 1]?.views || 0), 0),
                totalTokens: filterPosts(posts)
                  .filter(post => post.kolId === kol.id)
                  .reduce((sum, post) => sum + calculateTokens(post.counts[post.counts.length - 1]?.likes || 0, post.counts[post.counts.length - 1]?.views || 0), 0)
              }))}>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalLikes" fill="#8884d8" name="Total Likes" />
                <Bar dataKey="totalViews" fill="#82ca9d" name="Total Views" />
                <Bar dataKey="totalTokens" fill="#ffc658" name="Total Tokens" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-[#1E40AF]">KOL Instagram Engagement Tracker</h1>

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
          tokens={filterPosts(posts).reduce((sum, post) => sum + calculateTokens(post.counts[post.counts.length - 1]?.likes || 0, post.counts[post.counts.length - 1]?.views || 0), 0)}
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1E40AF]">Filters</CardTitle>
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
            <CardTitle className="text-[#1E40AF]">Token Settings</CardTitle>
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

      <Button onClick={fetchUpdates} className="mb-6 bg-[#3B82F6] hover:bg-[#2563EB]">
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
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1E40AF]">Create New Post</CardTitle>
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
                <Button type="submit" className="bg-[#10B981] hover:bg-[#059669]">Create Post</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kols">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1E40AF]">Manage KOLs</CardTitle>
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
                <Button type="submit" className="bg-[#10B981] hover:bg-[#059669]">
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
          <Analytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}