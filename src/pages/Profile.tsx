import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, MapPin, GraduationCap, BookOpen, FileText, Users, Link, Award, MessageCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

const Profile = () => {
  const profileData = {
    name: 'Arjun Patel',
    title: 'Ph.D. Candidate',
    institution: 'Indian Institute of Technology, Delhi',
    location: 'New Delhi, India',
    bio: 'Researching artificial intelligence and machine learning applications in renewable energy systems. Passionate about interdisciplinary collaboration and open-source research.',
    skills: ['Machine Learning', 'Python', 'Data Analysis', 'Research Methodology', 'Academic Writing'],
    education: [
      { degree: 'Ph.D. in Computer Science (In Progress)', institution: 'IIT Delhi', year: '2023-Present' },
      { degree: 'M.Tech in Computer Science', institution: 'IIT Bombay', year: '2021-2023' },
      { degree: 'B.Tech in Computer Engineering', institution: 'Delhi Technological University', year: '2017-2021' },
    ],
    achievements: [
      { title: 'Paper Publisher', description: 'Published 5 research papers', icon: <FileText className="h-4 w-4" /> },
      { title: 'Collaboration Expert', description: 'Participated in 10+ projects', icon: <Users className="h-4 w-4" /> },
      { title: 'Resource Contributor', description: 'Shared 25+ academic resources', icon: <BookOpen className="h-4 w-4" /> },
    ],
    stats: {
      papers: 5,
      projects: 8,
      mentees: 3,
      resources: 27,
      answers: 42,
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src="/placeholder.svg" alt={profileData.name} />
                    <AvatarFallback className="bg-brand-purple text-white text-lg">AP</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{profileData.name}</h2>
                  <p className="text-muted-foreground">{profileData.title}</p>
                  
                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span>{profileData.location}</span>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                    <Button variant="outline" size="sm">
                      <Link className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>

                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Institution</h3>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-brand-orange" />
                      <span>{profileData.institution}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Bio</h3>
                    <p className="text-sm text-muted-foreground">{profileData.bio}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-1">
                      {profileData.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="bg-muted">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />
                
                <div>
                  <h3 className="font-medium mb-3">Achievements</h3>
                  <div className="space-y-3">
                    {profileData.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-brand-purple/10 text-brand-purple">
                          {achievement.icon}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{achievement.title}</p>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
              </TabsList>
              
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Academic Journey</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">Research Activity</h3>
                          <span className="text-sm text-muted-foreground">75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">Resource Contributions</h3>
                          <span className="text-sm text-muted-foreground">60%</span>
                        </div>
                        <Progress value={60} className="h-2" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">Community Engagement</h3>
                          <span className="text-sm text-muted-foreground">90%</span>
                        </div>
                        <Progress value={90} className="h-2" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">Mentorship</h3>
                          <span className="text-sm text-muted-foreground">40%</span>
                        </div>
                        <Progress value={40} className="h-2" />
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <h3 className="font-medium mb-4">Academic Timeline</h3>
                    <div className="space-y-6">
                      {profileData.education.map((edu, index) => (
                        <div key={index} className="relative pl-6 pb-4 border-l border-muted last:pb-0">
                          <div className="absolute left-[-8px] top-1 h-4 w-4 rounded-full bg-brand-purple"></div>
                          <h4 className="font-medium">{edu.degree}</h4>
                          <p className="text-sm text-muted-foreground">{edu.institution}</p>
                          <p className="text-xs text-muted-foreground mt-1">{edu.year}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="resources">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Uploaded Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">You have shared {profileData.stats.resources} academic resources with the community.</p>
                    
                    <div className="grid gap-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index} className="flex overflow-hidden">
                          <div className="bg-muted w-16 flex items-center justify-center">
                            <FileText className="h-6 w-6 text-brand-purple" />
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium">Machine Learning Research Paper {index + 1}</h3>
                            <p className="text-sm text-muted-foreground">Uploaded 2 weeks ago</p>
                            <Badge variant="outline" className="mt-2">PDF</Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="flex justify-center mt-6">
                      <Button variant="outline">View All Resources</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="projects">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Academic Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">You have {profileData.stats.projects} ongoing and completed research projects.</p>
                    
                    <div className="grid gap-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex justify-between mb-2">
                            <h3 className="font-medium">AI for Renewable Energy Project {index + 1}</h3>
                            <Badge className="bg-green-500">Active</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">Using machine learning to optimize solar panel efficiency in urban environments.</p>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-brand-blue text-xs">C{index+1}</AvatarFallback>
                            </Avatar>
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-brand-orange text-xs">C{index+2}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">+3 collaborators</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="flex justify-center mt-6">
                      <Button variant="outline">View All Projects</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="mentorship">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Mentorship</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between mb-6">
                      <p className="text-muted-foreground">You're currently mentoring {profileData.stats.mentees} students.</p>
                      <Button size="sm" className="bg-brand-purple hover:bg-brand-purple/90">
                        <Users className="h-4 w-4 mr-1" />
                        Find Mentees
                      </Button>
                    </div>
                    
                    <div className="grid gap-4">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 border rounded-md">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-brand-blue text-white">M{index+1}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">Mentee Name {index + 1}</h3>
                            <p className="text-sm text-muted-foreground">B.Tech Student • Computer Science</p>
                            <p className="text-xs text-muted-foreground mt-1">Mentoring since January 2025</p>
                          </div>
                          <Button variant="outline" size="sm" className="ml-auto">
                            Message
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-xl">Academic Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-4 text-center">
                    <div className="h-12 w-12 mx-auto rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple mb-2">
                      <FileText className="h-6 w-6" />
                    </div>
                    <p className="text-2xl font-bold">{profileData.stats.papers}</p>
                    <p className="text-sm text-muted-foreground">Papers</p>
                  </div>
                  
                  <div className="p-4 text-center">
                    <div className="h-12 w-12 mx-auto rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange mb-2">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <p className="text-2xl font-bold">{profileData.stats.projects}</p>
                    <p className="text-sm text-muted-foreground">Projects</p>
                  </div>
                  
                  <div className="p-4 text-center">
                    <div className="h-12 w-12 mx-auto rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-2">
                      <Users className="h-6 w-6" />
                    </div>
                    <p className="text-2xl font-bold">{profileData.stats.mentees}</p>
                    <p className="text-sm text-muted-foreground">Mentees</p>
                  </div>
                  
                  <div className="p-4 text-center">
                    <div className="h-12 w-12 mx-auto rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-2">
                      <FileText className="h-6 w-6" />
                    </div>
                    <p className="text-2xl font-bold">{profileData.stats.resources}</p>
                    <p className="text-sm text-muted-foreground">Resources</p>
                  </div>
                  
                  <div className="p-4 text-center">
                    <div className="h-12 w-12 mx-auto rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple mb-2">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <p className="text-2xl font-bold">{profileData.stats.answers}</p>
                    <p className="text-sm text-muted-foreground">Answers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
