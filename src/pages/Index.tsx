
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
              <div className="space-y-3">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Current Progress</span>
                  <span className="font-medium">70%</span>
                </div>
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-orange to-brand-purple rounded-full" style={{ width: '70%' }}></div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Keep interacting daily to earn achievement badges and unlock special features.
                </p>
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
