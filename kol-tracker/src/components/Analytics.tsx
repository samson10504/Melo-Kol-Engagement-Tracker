// File: src/components/Analytics.tsx

'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { calculateTokens, formatDate, getKolName } from '@/lib/utils';

interface AnalyticsProps {
  posts: any[];
  kols: any[];
  tokenSettings: { likesToToken: number; viewsToToken: number; };
}

export default function Analytics({ posts, kols, tokenSettings }: AnalyticsProps) {
  const engagementData = posts.flatMap(post => post.counts.map(count => ({
    ...count,
    kolName: getKolName(post.kolId, kols)
  })));

  const kolPerformanceData = kols.map(kol => ({
    name: kol.name,
    totalLikes: posts
      .filter(post => post.kolId === kol.id)
      .reduce((sum, post) => sum + (post.counts[post.counts.length - 1]?.likes || 0), 0),
    totalViews: posts
      .filter(post => post.kolId === kol.id)
      .reduce((sum, post) => sum + (post.counts[post.counts.length - 1]?.views || 0), 0),
    totalTokens: posts
      .filter(post => post.kolId === kol.id)
      .reduce((sum, post) => sum + calculateTokens(
        post.counts[post.counts.length - 1]?.likes || 0, 
        post.counts[post.counts.length - 1]?.views || 0,
        tokenSettings.likesToToken,
        tokenSettings.viewsToToken
      ), 0)
  }));

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Engagement Trend by KOL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementData}>
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
              <BarChart data={kolPerformanceData}>
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
}