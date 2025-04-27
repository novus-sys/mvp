
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookOpen, Users, Calendar, FileText, PlusCircle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/useSupabase';
import { projectsApi, Project } from '@/services/supabaseApi';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Project form interface
interface ProjectForm {
  title: string;
  description: string;
  category: string;
  deadline: string;
}

// Define a type for project data
type ProjectData = {
  id: string;
  title: string;
  description: string;
  progress?: number;
  category: string;
  collaborators?: any[];
  deadline?: string;
  tasks?: any[];
  created_at: string;
  updated_at?: string;
  owner_id: string;
  [key: string]: any; // Allow additional properties
};

// Sample project data (fallback for when API is not available)
const sampleProjects: ProjectData[] = [
  {
    id: '1',
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
    ],
    created_at: new Date().toISOString(),
    owner_id: 'sample-user-1'
  },
  {
    id: '2',
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
    ],
    created_at: new Date().toISOString(),
    owner_id: 'sample-user-2'
  },
  {
    id: '3',
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
    ],
    created_at: new Date().toISOString(),
    owner_id: 'sample-user-3'
  }
];

const ProjectCard = ({ project }: { project: ProjectData }) => {
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
  const { user } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState<ProjectForm>({
    title: '',
    description: '',
    category: 'Research',
    deadline: ''
  });

  // Fetch projects from Supabase
  const { 
    data: projects, 
    isLoading, 
    isError, 
    error 
  } = useSupabaseQuery<Project[]>(
    ['projects'],
    projectsApi.getAll
  );

  // Transform projects to match our ProjectData type
  const transformedProjects: ProjectData[] = projects?.map(project => ({
    id: project.id,
    title: project.title,
    description: project.description || '',
    progress: 50, // Default progress
    category: project.category || 'Research',
    collaborators: project.members?.map(member => ({
      name: member.name || 'Team Member',
      avatar: member.avatar_url || '',
      initials: member.name ? member.name.substring(0, 2).toUpperCase() : 'TM'
    })) || [],
    deadline: project.deadline || 'Not set',
    tasks: project.tasks?.map(task => ({
      name: task.name || 'Task', // Use name property instead of title
      status: task.status || 'pending'
    })) || [],
    created_at: project.created_at,
    owner_id: project.created_by || '' // Use created_by as owner_id
  })) || [];

  // Use sample projects as fallback if no data is available
  const displayProjects = transformedProjects.length > 0 ? transformedProjects : sampleProjects;

  // Filter projects based on active tab and search query
  const filteredProjects = displayProjects.filter(project => {
    // Filter by tab
    if (activeTab === 'my' && user && project.owner_id !== user.id) return false;
    
    // For collaborating tab, check if the user is a collaborator
    if (activeTab === 'collaborating') {
      // For sample projects which have a different structure
      if (typeof project.id === 'string' && project.collaborators) {
        const isCollaborator = project.collaborators.some((c: any) => 
          c.id === user?.id || c.name?.includes(user?.email?.split('@')[0] || '')  
        );
        if (!isCollaborator) return false;
      }
    }
    
    // Filter by search query
    if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    return true;
  });

  // Handle project creation
  const createProjectMutation = useSupabaseMutation(
    (projectData: any) => projectsApi.create({
      title: projectData.title,
      description: projectData.description,
      category: projectData.category,
      deadline: projectData.deadline || null,
      created_by: user?.id, // Use created_by instead of owner_id to match the API
      progress: 0 // Add required progress field
    })
  );

  const handleCreateProject = () => {
    if (!newProject.title.trim()) {
      toast({
        variant: "destructive",
        title: "Title required",
        description: "Please provide a title for your project.",
      });
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to create a project.",
      });
      return;
    }
    
    // Use the mutation to create the project
    createProjectMutation.mutate(newProject);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProject(prev => ({ ...prev, [name]: value }));
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Academic Projects</h1>
            <p className="text-muted-foreground mt-1">Discover and collaborate on academic research initiatives</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new academic project.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Project Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={newProject.title}
                      onChange={handleInputChange}
                      placeholder="Enter project title"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={newProject.description}
                      onChange={handleInputChange}
                      placeholder="Describe your project"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      name="category"
                      value={newProject.category}
                      onChange={handleInputChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Research">Research</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Policy">Policy</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      name="deadline"
                      type="date"
                      value={newProject.deadline}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={() => handleCreateProject()} 
                    disabled={!newProject.title.trim() || createProjectMutation.isPending}
                  >
                    {createProjectMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Project'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="my">My Projects</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="engineering">Engineering</TabsTrigger>
            <TabsTrigger value="policy">Policy</TabsTrigger>
          </TabsList>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading projects...</span>
            </div>
          ) : isError ? (
            <Alert variant="destructive" className="my-4">
              <AlertDescription>
                {error?.message || 'Failed to load projects. Please try again later.'}
              </AlertDescription>
            </Alert>
          ) : (
            <TabsContent value={activeTab} className="mt-4">
              {filteredProjects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No projects found.</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Project
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </TabsContent>
          )}
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
