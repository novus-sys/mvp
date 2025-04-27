
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Activity {
  id: string;
  type: 'upload' | 'comment' | 'project' | 'mention';
  title: string;
  description: string;
  user: {
    name: string;
    image?: string;
    initials: string;
  };
  time: string;
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'upload',
    title: 'Research Paper Uploaded',
    description: 'Machine Learning Applications in Healthcare',
    user: { name: 'Priya Sharma', initials: 'PS' },
    time: '15 minutes ago',
  },
  {
    id: '2',
    type: 'comment',
    title: 'New Comment',
    description: 'On your project "Renewable Energy Solutions"',
    user: { name: 'Rahul Gupta', initials: 'RG' },
    time: '2 hours ago',
  },
  {
    id: '3',
    type: 'project',
    title: 'Project Update',
    description: 'Data Analysis Framework progress: 75% complete',
    user: { name: 'Aarav Patel', initials: 'AP' },
    time: '5 hours ago',
  },
  {
    id: '4',
    type: 'mention',
    title: 'Mentioned You',
    description: 'In a question about quantum computing',
    user: { name: 'Divya Singh', initials: 'DS' },
    time: 'Yesterday',
  },
];

const RecentActivity = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-4">
            <Avatar>
              <AvatarImage src={activity.user.image} alt={activity.user.name} />
              <AvatarFallback className="bg-brand-blue text-white">{activity.user.initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{activity.user.name}</p>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
              <p className="text-sm font-medium">{activity.title}</p>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
