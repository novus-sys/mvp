
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen, Calendar, Briefcase, GraduationCap, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

const opportunities = [
  {
    id: 1,
    title: 'Research Assistant - Machine Learning',
    organization: 'Indian Institute of Technology, Delhi',
    type: 'Research',
    location: 'Delhi, India',
    duration: '6 months',
    deadline: 'Oct 15, 2025',
    stipend: '₹25,000/month',
    requirements: ['Masters in Computer Science', 'Experience with TensorFlow/PyTorch', 'Strong mathematics background'],
    description: 'Seeking a research assistant to work on a project applying machine learning techniques to healthcare data for predictive diagnosis in rural areas.',
    postedBy: {
      name: 'Dr. Sharma',
      avatar: '',
      initials: 'DS'
    }
  },
  {
    id: 2,
    title: 'Teaching Fellowship - Physics',
    organization: 'Delhi University',
    type: 'Teaching',
    location: 'Delhi, India',
    duration: '1 year',
    deadline: 'Nov 5, 2025',
    stipend: '₹35,000/month',
    requirements: ['PhD in Physics', 'Prior teaching experience', 'Excellent communication skills'],
    description: 'Teaching fellowship position for undergraduate physics courses. Responsibilities include conducting lectures, labs, and assessing student performance.',
    postedBy: {
      name: 'Prof. Kumar',
      avatar: '',
      initials: 'PK'
    }
  },
  {
    id: 3,
    title: 'Summer Internship - Environmental Science',
    organization: 'TERI School of Advanced Studies',
    type: 'Internship',
    location: 'Remote/Hybrid',
    duration: '3 months',
    deadline: 'Dec 20, 2025',
    stipend: '₹15,000/month',
    requirements: ['Undergraduate in Environmental Science', 'Basic knowledge of GIS', 'Interest in climate policy'],
    description: 'Summer internship opportunity to work on climate change impact assessment projects. Interns will help with data collection, analysis, and report writing.',
    postedBy: {
      name: 'Dr. Gupta',
      avatar: '',
      initials: 'DG'
    }
  },
  {
    id: 4,
    title: 'PhD Position - Renewable Energy',
    organization: 'IIT Bombay',
    type: 'PhD',
    location: 'Mumbai, India',
    duration: '4 years',
    deadline: 'Jan 15, 2026',
    stipend: '₹42,000/month',
    requirements: ['Masters in Energy Engineering/Mechanical Engineering', 'Research experience', 'Publications preferred'],
    description: 'Fully funded PhD position to work on innovative solar energy harvesting and storage techniques suitable for Indian climatic conditions.',
    postedBy: {
      name: 'Prof. Patel',
      avatar: '',
      initials: 'PP'
    }
  }
];

const OpportunityCard = ({ opportunity }) => {
  const typeColors = {
    'Research': 'bg-brand-purple/10 text-brand-purple border-brand-purple/50',
    'Teaching': 'bg-brand-blue/10 text-brand-blue border-brand-blue/50',
    'Internship': 'bg-brand-orange/10 text-brand-orange border-brand-orange/50',
    'PhD': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50'
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{opportunity.title}</CardTitle>
            <CardDescription>{opportunity.organization}</CardDescription>
          </div>
          <Badge variant="outline" className={typeColors[opportunity.type]}>
            {opportunity.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <Briefcase className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{opportunity.location}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{opportunity.duration}</span>
          </div>
          <div className="flex items-center">
            <GraduationCap className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{opportunity.stipend}</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">{opportunity.description}</p>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Requirements</h4>
          <ul className="list-disc list-inside space-y-1">
            {opportunity.requirements.map((req, index) => (
              <li key={index} className="text-sm">{req}</li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={opportunity.postedBy.avatar} />
            <AvatarFallback className="text-xs">{opportunity.postedBy.initials}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">Posted by {opportunity.postedBy.name}</span>
        </div>
        <Button>Apply Now</Button>
      </CardFooter>
    </Card>
  );
};

const Opportunities = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Academic Opportunities</h1>
            <p className="text-muted-foreground mt-1">Discover research positions, teaching fellowships, and more</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button>
              <BookOpen className="mr-2 h-4 w-4" />
              Post Opportunity
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input placeholder="Search opportunities..." className="w-full" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Latest
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Opportunities</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="teaching">Teaching</TabsTrigger>
            <TabsTrigger value="internship">Internships</TabsTrigger>
            <TabsTrigger value="phd">PhD Positions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {opportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="research" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {opportunities.filter(o => o.type === 'Research').map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="teaching" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {opportunities.filter(o => o.type === 'Teaching').map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="internship" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {opportunities.filter(o => o.type === 'Internship').map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="phd" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {opportunities.filter(o => o.type === 'PhD').map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Opportunity Alerts</CardTitle>
            <CardDescription>Get notified about new opportunities in your field</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input placeholder="Enter your research interests" />
              </div>
              <Button>Set Alert</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Opportunities;
