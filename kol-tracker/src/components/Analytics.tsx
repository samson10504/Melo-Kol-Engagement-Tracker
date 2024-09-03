// File: src/components/Analytics.tsx

'use client';
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { calculateTokens, formatDate, getKolName } from '@/lib/utils';

interface AnalyticsProps {
  posts: any[];
  kols: any[];
  tokenSettings: { tokensPerLike: number; tokensPerComment: number; };
}

export default function Analytics({ posts, kols, tokenSettings }: AnalyticsProps) {
  const engagementData = useMemo(() => {
    return posts.map(post => {
      const latestCount = post.counts && post.counts.length > 0 ? post.counts[post.counts.length - 1] : null;
      return {
        date: new Date(post.post_creation_date).getTime(),
        likes: latestCount ? latestCount.likes : 0,
        comments: latestCount ? latestCount.comments : 0,
        kolName: getKolName(post.kol_id, kols),
        postId: post.id
      };
    }).sort((a, b) => a.date - b.date);
  }, [posts, kols]);

  const kolPerformanceData = useMemo(() => {
    return kols.map(kol => {
      const kolPosts = posts.filter(post => post.kol_id === kol.id);
      const totalLikes = kolPosts.reduce((sum, post) => {
        const latestCount = post.counts && post.counts.length > 0 ? post.counts[post.counts.length - 1] : null;
        return sum + (latestCount ? latestCount.likes : 0);
      }, 0);
      const totalComments = kolPosts.reduce((sum, post) => {
        const latestCount = post.counts && post.counts.length > 0 ? post.counts[post.counts.length - 1] : null;
        return sum + (latestCount ? latestCount.comments : 0);
      }, 0);
      const totalTokens = calculateTokens(totalLikes, totalComments, tokenSettings.tokensPerLike, tokenSettings.tokensPerComment);
      
      return {
        name: kol.name,
        totalLikes,
        totalComments,
        totalTokens
      };
    });
  }, [kols, posts, tokenSettings]);

  if (engagementData.length === 0 || kolPerformanceData.length === 0) {
    return <div>No data available for analytics</div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Engagement Trend Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementData}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => formatDate(value)}
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  scale="time"
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value)}
                  formatter={(value, name, props) => [value, name]}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="likes" stroke="#8884d8" name="Likes" />
                <Line yAxisId="right" type="monotone" dataKey="comments" stroke="#82ca9d" name="Comments" />
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
                <Bar dataKey="totalComments" fill="#82ca9d" name="Total Comments" />
                <Bar dataKey="totalTokens" fill="#ffc658" name="Total Tokens" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}