'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { User } from '@/lib/db/schema';
import useSWR from 'swr';
import { Share2, FileText, Eye, Calendar } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UserInfo() {
  const { data: user } = useSWR<User>('/api/user', fetcher);

  if (!user) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage alt={user.name || ''} />
            <AvatarFallback className="text-lg">
              {(user.name || user.email)
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xl font-semibold">
              {user.name || 'Welcome!'}
            </p>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Share2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No activity yet</p>
          <p className="text-sm">Start sharing to see your activity here</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your sharing dashboard
        </p>
      </div>
      
      <UserInfo />
      <RecentActivity />
    </div>
  );
}