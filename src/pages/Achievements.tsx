
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, BookOpen, Users, Calendar, GraduationCap, MessageCircle, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Let's create a simple chart component to show achievement stats visually
const AchievementBarChart = ({ data }) => {
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">{item.label}</span>
            <span className="text-sm font-medium">{item.value}</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${item.color}`} 
              style={{ width: `${(item.value / item.max) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// A simple circular progress component
const CircularProgress = ({ value, max, label, color }) => {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 45; // 45 is the radius
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-28 w-28">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle 
            className="text-muted stroke-current" 
            strokeWidth="10" 
            fill="transparent" 
            r="45" 
            cx="50" 
            cy="50" 
          />
          <circle 
            className={`${color} stroke-current`}
            strokeWidth="10" 
            strokeLinecap="round" 
            fill="transparent" 
            r="45" 
            cx="50" 
            cy="50" 
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
          />
          <text 
            x="50%" 
            y="50%" 
            textAnchor="middle" 
            dominantBaseline="central"
            className="text-2xl font-bold"
          >
            {value}
          </text>
        </svg>
      </div>
      <span className="mt-2 text-sm font-medium">{label}</span>
    </div>
  );
};

const Achievements = () => {
  // Sample achievement data
  const userLevel = 12;
  const streakDays = 14;
  const totalPoints = 2450;
  
  const achievementStats = [
    { label: 'Resources Uploaded', value: 24, max: 50, color: 'bg-brand-orange' },
    { label: 'Questions Answered', value: 36, max: 50, color: 'bg-brand-blue' },
    { label: 'Projects Contributed', value: 7, max: 10, color: 'bg-brand-purple' },
    { label: 'Mentorship Hours', value: 12, max: 20, color: 'bg-emerald-500' }
  ];
  
  const badgeData = [
    { title: 'Research Maven', description: 'Upload 25+ academic resources', progress: 24, total: 25, icon: <FileText className="h-6 w-6" /> },
    { title: 'Collaboration Star', description: 'Join 10 academic projects', progress: 7, total: 10, icon: <Users className="h-6 w-6" /> },
    { title: 'Knowledge Sharer', description: 'Answer 50 questions in the forum', progress: 36, total: 50, icon: <MessageCircle className="h-6 w-6" /> },
    { title: 'Dedicated Scholar', description: 'Maintain a 30-day streak', progress: 14, total: 30, icon: <Calendar className="h-6 w-6" /> },
    { title: 'Mentorship Guru', description: 'Provide 20 hours of mentorship', progress: 12, total: 20, icon: <GraduationCap className="h-6 w-6" /> },
    { title: 'Topic Expert', description: 'Get recognized in a specific field', progress: 1, total: 1, icon: <Award className="h-6 w-6" /> }
  ];
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Academic Achievements</h1>
            <p className="text-muted-foreground mt-1">Track your progress and earn recognition</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button>
              <Award className="mr-2 h-4 w-4" />
              Share Achievements
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-brand-purple/90 to-brand-purple/70 text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium opacity-80">Scholar Level</p>
                  <h2 className="text-3xl font-bold">{userLevel}</h2>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <GraduationCap className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress to next level</span>
                  <span>78%</span>
                </div>
                <div className="h-1.5 w-full bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-brand-orange/90 to-brand-orange/70 text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium opacity-80">Engagement Streak</p>
                  <h2 className="text-3xl font-bold">{streakDays} Days</h2>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Next milestone: 15 days</span>
                  <span>93%</span>
                </div>
                <div className="h-1.5 w-full bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: '93%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-brand-blue/90 to-brand-blue/70 text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium opacity-80">Total Points</p>
                  <h2 className="text-3xl font-bold">{totalPoints}</h2>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <Award className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Rank: Top 5%</span>
                  <span></span>
                </div>
                <div className="flex gap-1 mt-1">
                  <span className="h-1.5 w-full bg-white rounded-full"></span>
                  <span className="h-1.5 w-full bg-white rounded-full"></span>
                  <span className="h-1.5 w-full bg-white rounded-full"></span>
                  <span className="h-1.5 w-full bg-white/50 rounded-full"></span>
                  <span className="h-1.5 w-full bg-white/50 rounded-full"></span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-emerald-500/90 to-emerald-500/70 text-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium opacity-80">Achievements</p>
                  <h2 className="text-3xl font-bold">12 / 24</h2>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Overall completion</span>
                  <span>50%</span>
                </div>
                <div className="h-1.5 w-full bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Achievement Progress</CardTitle>
              <CardDescription>Track your academic activities and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <AchievementBarChart data={achievementStats} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Activity Distribution</CardTitle>
              <CardDescription>Your engagement by category</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between">
              <CircularProgress 
                value={65} 
                max={100} 
                label="Resources" 
                color="text-brand-orange" 
              />
              <CircularProgress 
                value={42} 
                max={100} 
                label="Forums" 
                color="text-brand-blue" 
              />
              <CircularProgress 
                value={78} 
                max={100} 
                label="Projects" 
                color="text-brand-purple" 
              />
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-bold mb-6">Achievement Badges</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {badgeData.map((badge, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-full ${
                    badge.progress >= badge.total ? 'bg-brand-orange/10 text-brand-orange' : 'bg-muted text-muted-foreground'
                  }`}>
                    {badge.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{badge.title}</h3>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{badge.progress} of {badge.total}</span>
                  </div>
                  <Progress value={(badge.progress / badge.total) * 100} className="h-2" />
                </div>
              </CardContent>
              {badge.progress >= badge.total && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-brand-orange text-white">Achieved</Badge>
                </div>
              )}
            </Card>
          ))}
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Academic Impact</CardTitle>
            <CardDescription>Your contributions and their reach in the academic community</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50">
                <FileText className="h-8 w-8 mb-2 text-brand-orange" />
                <h3 className="text-2xl font-bold">126</h3>
                <p className="text-sm text-muted-foreground text-center">Resource Downloads</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50">
                <MessageCircle className="h-8 w-8 mb-2 text-brand-blue" />
                <h3 className="text-2xl font-bold">84</h3>
                <p className="text-sm text-muted-foreground text-center">Forum Contributions</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50">
                <Users className="h-8 w-8 mb-2 text-brand-purple" />
                <h3 className="text-2xl font-bold">37</h3>
                <p className="text-sm text-muted-foreground text-center">Collaboration Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Weekly Activity Timeline</CardTitle>
              <CardDescription>Your engagement pattern over the past week</CardDescription>
            </div>
            <Button variant="outline" size="sm">View Details</Button>
          </CardHeader>
          <CardContent>
            <div className="h-64 relative">
              {/* This is where a full timeline chart would go in a real implementation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Activity timeline chart will appear here</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Achievements;
