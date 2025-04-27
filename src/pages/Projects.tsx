
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen, Users, Calendar, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Sample project data
const projects = [
  {
    id: 1,
    title: 'Machine Learning for Healthcare',
    description: 'Applying machine learning algorithms to predict patient outcomes in rural healthcare settings',
    progress: 65,
    category: 'Research',
    collaborators: [
      { name: 'Priya S.', avatar: '', initials: 'PS' },
      { name: 'Rahul G.', avatar: '', initials: 'RG' },
      { name: 'Aarav P.', avatar: '', initials: 'AP' }
    ],
    deadline: 'Oct 15, 2025',
    tasks: [
      { name: 'Data Collection', status: 'completed' },
      { name: 'Model Training', status: 'in-progress' },
      { name: 'Validation', status: 'pending' },
      { name: 'Paper Writing', status: 'pending' }
    ]
  },
  {
    id: 2,
    title: 'Renewable Energy Systems',
    description: 'Exploring sustainable energy solutions for rural communities in developing countries',
    progress: 42,
    category: 'Engineering',
    collaborators: [
      { name: 'Vikram M.', avatar: '', initials: 'VM' },
      { name: 'Neha K.', avatar: '', initials: 'NK' }
    ],
    deadline: 'Nov 30, 2025',
    tasks: [
      { name: 'Literature Review', status: 'completed' },
      { name: 'System Design', status: 'in-progress' },
      { name: 'Prototype Development', status: 'pending' },
      { name: 'Field Testing', status: 'pending' }
    ]
  },
  {
    id: 3,
    title: 'Educational Policy Framework',
    description: 'Developing policy recommendations to improve higher education accessibility',
    progress: 78,
    category: 'Policy',
    collaborators: [
      { name: 'Arjun L.', avatar: '', initials: 'AL' },
      { name: 'Meera V.', avatar: '', initials: 'MV' },
      { name: 'Sanjay R.', avatar: '', initials: 'SR' }
    ],
    deadline: 'Sep 10, 2025',
    tasks: [
      { name: 'Research', status: 'completed' },
      { name: 'Policy Draft', status: 'completed' },
      { name: 'Expert Review', status: 'in-progress' },
      { name: 'Final Publication', status: 'pending' }
    ]
  }
];

const ProjectCard = ({ project }) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{project.title}</CardTitle>
            <CardDescription className="mt-1">{project.description}</CardDescription>
          </div>
          <Badge variant="outline" className={
            project.category === 'Research' ? 'bg-brand-purple/10 text-brand-purple border-brand-purple/50' :
            project.category === 'Engineering' ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/50' :
            'bg-brand-orange/10 text-brand-orange border-brand-orange/50'
          }>
            {project.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Key Tasks</h4>
          <div className="space-y-1">
            {project.tasks.map((task, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{task.name}</span>
                <Badge variant="outline" className={
                  task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                  task.status === 'in-progress' ? 'bg-amber-500/10 text-amber-500' : 
                  'bg-slate-300/10 text-slate-500'
                }>
                  {task.status === 'completed' ? 'Done' : 
                   task.status === 'in-progress' ? 'In Progress' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{project.deadline}</span>
        </div>
        <div className="flex -space-x-2">
          {project.collaborators.map((collaborator, index) => (
            <Avatar key={index} className="h-6 w-6 border-2 border-background">
              <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
              <AvatarFallback className="text-xs bg-brand-blue text-white">{collaborator.initials}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};

const Projects = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Academic Projects</h1>
            <p className="text-muted-foreground mt-1">Discover and collaborate on academic research initiatives</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button>
              <BookOpen className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="my">My Projects</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="engineering">Engineering</TabsTrigger>
            <TabsTrigger value="policy">Policy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="my">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProjectCard project={projects[0]} />
            </div>
          </TabsContent>
          <TabsContent value="research">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.filter(p => p.category === 'Research').map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="engineering">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.filter(p => p.category === 'Engineering').map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="policy">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.filter(p => p.category === 'Policy').map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Project Timeline</CardTitle>
            <CardDescription>Key milestones and upcoming deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border rounded-md p-4 bg-muted/10">
              <div className="text-center">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Project timeline visualization will appear here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Project Analytics</CardTitle>
              <CardDescription>Track progress and contribution metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72 flex items-center justify-center border rounded-md p-4 bg-muted/10">
                <div className="text-center">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Project analytics graph will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Suggested Collaborators</CardTitle>
              <CardDescription>People who might be interested in your projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {name: 'Dr. Sharma', field: 'Machine Learning', avatar: '', initials: 'DS'},
                {name: 'Prof. Kumar', field: 'Renewable Energy', avatar: '', initials: 'PK'},
                {name: 'Dr. Verma', field: 'Education Policy', avatar: '', initials: 'DV'}
              ].map((person, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={person.avatar} alt={person.name} />
                      <AvatarFallback className="bg-brand-orange text-white">{person.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{person.name}</p>
                      <p className="text-xs text-muted-foreground">{person.field}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Users className="h-4 w-4 mr-1" />
                    Invite
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Projects;
