
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GraduationCap, Users, Calendar, MessageCircle, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mentors = [
  {
    id: 1,
    name: 'Dr. Priya Sharma',
    role: 'Professor of Computer Science',
    institution: 'Indian Institute of Technology',
    specialization: ['Machine Learning', 'Data Science', 'AI Ethics'],
    availability: 'Weekly, 1-hour sessions',
    rating: 4.9,
    students: 24,
    image: '',
    initials: 'PS'
  },
  {
    id: 2,
    name: 'Prof. Rajiv Kumar',
    role: 'Associate Professor of Physics',
    institution: 'Delhi University',
    specialization: ['Quantum Physics', 'Mathematical Modeling', 'Research Methodology'],
    availability: 'Bi-weekly, 2-hour sessions',
    rating: 4.7,
    students: 18,
    image: '',
    initials: 'RK'
  },
  {
    id: 3,
    name: 'Dr. Anjali Desai',
    role: 'Professor of Environmental Science',
    institution: 'BITS Pilani',
    specialization: ['Renewable Energy', 'Sustainable Development', 'Climate Policy'],
    availability: 'Monthly intensive sessions',
    rating: 4.8,
    students: 15,
    image: '',
    initials: 'AD'
  }
];

const mentees = [
  {
    id: 1,
    name: 'Arjun Patel',
    role: 'PhD Student',
    institution: 'IIT Bombay',
    interests: ['Machine Learning', 'Computer Vision'],
    lookingFor: 'Guidance on research publication',
    image: '',
    initials: 'AP'
  },
  {
    id: 2,
    name: 'Divya Singh',
    role: 'Masters Student',
    institution: 'JNU Delhi',
    interests: ['Social Policy', 'Educational Reform'],
    lookingFor: 'Career guidance in academia',
    image: '',
    initials: 'DS'
  },
  {
    id: 3,
    name: 'Karthik Iyer',
    role: 'Undergraduate',
    institution: 'MIT Manipal',
    interests: ['Robotics', 'Artificial Intelligence'],
    lookingFor: 'Research project mentorship',
    image: '',
    initials: 'KI'
  }
];

const MentorCard = ({ mentor }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={mentor.image} alt={mentor.name} />
              <AvatarFallback className="bg-brand-purple text-white">{mentor.initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{mentor.name}</CardTitle>
              <CardDescription>{mentor.role}</CardDescription>
              <p className="text-xs text-muted-foreground">{mentor.institution}</p>
            </div>
          </div>
          <Badge className="bg-brand-purple text-white">Mentor</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Specializations</h4>
          <div className="flex flex-wrap gap-2">
            {mentor.specialization.map((spec, index) => (
              <Badge key={index} variant="outline">{spec}</Badge>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Availability</h4>
          <p className="text-sm">{mentor.availability}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <Award className="h-4 w-4 text-brand-orange mr-1" />
            <span className="text-sm">{mentor.rating} Rating</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 text-brand-blue mr-1" />
            <span className="text-sm">{mentor.students} Mentees</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">View Profile</Button>
        <Button>Request Mentorship</Button>
      </CardFooter>
    </Card>
  );
};

const MenteeCard = ({ mentee }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={mentee.image} alt={mentee.name} />
              <AvatarFallback className="bg-brand-blue text-white">{mentee.initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{mentee.name}</CardTitle>
              <CardDescription>{mentee.role}</CardDescription>
              <p className="text-xs text-muted-foreground">{mentee.institution}</p>
            </div>
          </div>
          <Badge className="bg-brand-blue text-white">Mentee</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Research Interests</h4>
          <div className="flex flex-wrap gap-2">
            {mentee.interests.map((interest, index) => (
              <Badge key={index} variant="outline">{interest}</Badge>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Looking For</h4>
          <p className="text-sm">{mentee.lookingFor}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">View Profile</Button>
        <Button>Offer Mentorship</Button>
      </CardFooter>
    </Card>
  );
};

const Mentorship = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mentorship Connections</h1>
            <p className="text-muted-foreground mt-1">Connect with experienced mentors or find mentees in your field</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button>
              <GraduationCap className="mr-2 h-4 w-4" />
              Register as Mentor
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <Card className="bg-gradient-to-r from-brand-purple/80 to-brand-orange/80 text-white">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Find Your Academic Guide</h3>
                  <p className="opacity-90">Our mentorship program connects students with experienced academics for personalized guidance</p>
                </div>
                <Button className="bg-white text-brand-purple hover:bg-white/90">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Start Matching
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="mentors" className="mb-8">
          <TabsList>
            <TabsTrigger value="mentors">Find Mentors</TabsTrigger>
            <TabsTrigger value="mentees">Find Mentees</TabsTrigger>
            <TabsTrigger value="connections">My Connections</TabsTrigger>
          </TabsList>
          <TabsContent value="mentors" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="mentees" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentees.map((mentee) => (
                <MenteeCard key={mentee.id} mentee={mentee} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="connections" className="mt-4">
            <Card>
              <CardContent className="py-10">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No active connections yet</h3>
                  <p className="text-muted-foreground mb-4">Connect with mentors or mentees to see them here</p>
                  <Button>Find Connections</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mentorship Benefits</CardTitle>
              <CardDescription>Why join our mentorship program</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {title: 'Expert Guidance', description: 'Get advice from experienced academics in your field'},
                {title: 'Career Development', description: 'Build connections and explore academic pathways'},
                {title: 'Research Support', description: 'Get help with your research methodology and publications'},
                {title: 'Personal Growth', description: 'Develop confidence and academic identity'}
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-full bg-brand-purple/10 text-brand-purple">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Mentorship Events</CardTitle>
              <CardDescription>Virtual sessions and workshops</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {title: 'Research Methodology Workshop', date: 'Oct 10, 2025', time: '2:00 PM - 4:00 PM'},
                {title: 'Academic Publishing Panel', date: 'Oct 15, 2025', time: '11:00 AM - 12:30 PM'},
                {title: 'Career in Academia Q&A', date: 'Oct 22, 2025', time: '3:00 PM - 4:30 PM'}
              ].map((event, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-full bg-brand-orange/10 text-brand-orange">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-xs text-muted-foreground">{event.date} • {event.time}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">View All Events</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Mentorship;
