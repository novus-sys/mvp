import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, FileText, Users, MessageCircle, Award, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/dashboard/StatCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import UpcomingEvents from '@/components/dashboard/UpcomingEvents';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';

// Sample data for the engagement streak chart
const streakData = [
  { day: 'Mon', engagement: 65 },
  { day: 'Tue', engagement: 72 },
  { day: 'Wed', engagement: 80 },
  { day: 'Thu', engagement: 75 },
  { day: 'Fri', engagement: 85 },
  { day: 'Sat', engagement: 90 },
  { day: 'Sun', engagement: 70 },
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-brand-orange">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

const Index = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome to Academia Nexus</h1>
            <p className="text-muted-foreground mt-1">Your digital space for academic collaboration</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Upload Resource
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Uploaded Resources" 
            value={24} 
            icon={<FileText className="h-5 w-5 text-brand-orange" />}
            iconClassName="bg-brand-orange/10"
          />
          <StatCard 
            title="Academic Projects" 
            value={7}
            icon={<BookOpen className="h-5 w-5 text-brand-blue" />}
            iconClassName="bg-brand-blue/10"
          />
          <StatCard 
            title="Mentorship Connections" 
            value={3} 
            icon={<Users className="h-5 w-5 text-brand-purple" />}
            iconClassName="bg-brand-purple/10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-1 lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Daily Engagement Streak</h2>
                <Badge variant="outline" className="bg-brand-orange/10 text-brand-orange border-brand-orange/50">
                  14 Days
                </Badge>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={streakData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="day" 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="engagement" 
                      stroke="#FF6B00" 
                      fill="url(#colorEngagement)"
                      strokeWidth={0}
                      fillOpacity={0.3}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="engagement" 
                      stroke="#FF6B00" 
                      strokeWidth={3}
                      dot={{ 
                        r: 4, 
                        fill: '#FF6B00',
                        stroke: 'hsl(var(--background))',
                        strokeWidth: 2
                      }}
                      activeDot={{ 
                        r: 6, 
                        fill: '#FF6B00',
                        stroke: 'hsl(var(--background))',
                        strokeWidth: 2
                      }}
                      animationDuration={1000}
                      animationEasing="ease-in-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Keep interacting daily to earn achievement badges and unlock special features.
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-brand-orange"></div>
                  <span className="text-xs text-muted-foreground">Daily Engagement</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recommended For You</h2>
              <div className="space-y-4">
                <div className="p-3 rounded-md hover:bg-muted/50 transition-colors">
                  <Badge variant="outline" className="mb-2 bg-brand-blue/10 text-brand-blue border-brand-blue/50">Project</Badge>
                  <h3 className="font-medium">Data Visualization Techniques</h3>
                  <p className="text-sm text-muted-foreground mt-1">Based on your interest in data science</p>
                </div>
                <div className="p-3 rounded-md hover:bg-muted/50 transition-colors">
                  <Badge variant="outline" className="mb-2 bg-brand-purple/10 text-brand-purple border-brand-purple/50">Paper</Badge>
                  <h3 className="font-medium">Machine Learning in Healthcare</h3>
                  <p className="text-sm text-muted-foreground mt-1">Similar to your recent readings</p>
                </div>
                <div className="p-3 rounded-md hover:bg-muted/50 transition-colors">
                  <Badge variant="outline" className="mb-2 bg-brand-orange/10 text-brand-orange border-brand-orange/50">Mentor</Badge>
                  <h3 className="font-medium">Dr. Priya Sharma</h3>
                  <p className="text-sm text-muted-foreground mt-1">Expert in your field of study</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
          <UpcomingEvents />
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
