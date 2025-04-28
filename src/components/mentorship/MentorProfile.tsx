import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Calendar, GraduationCap, MapPin, MessageCircle, Users } from 'lucide-react';

interface MentorProfileProps {
  mentor: {
    id: number;
    name: string;
    role: string;
    institution: string;
    specialization: string[];
    availability: string;
    rating?: number;
    students?: number;
    image?: string;
    initials: string;
    bio?: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onRequestMentorship: () => void;
}

const MentorProfile = ({ mentor, isOpen, onClose, onRequestMentorship }: MentorProfileProps) => {
  // Generate a mock bio if one doesn't exist
  const bio = mentor.bio || 
    `${mentor.name} is an experienced ${mentor.role} at ${mentor.institution} with expertise in ${mentor.specialization.join(', ')}. ` +
    `They are passionate about mentoring students and helping them achieve their academic goals.`;

  // Mock publications
  const publications = [
    "Machine Learning Applications in Academic Research (2024)",
    "The Future of AI in Education (2023)",
    "Quantum Computing: Practical Applications (2022)"
  ];

  // Mock courses
  const courses = [
    "Advanced Research Methodology",
    "Data Analysis for Academics",
    "Scientific Writing and Publication"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Mentor Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-24 w-24 border-4 border-brand-purple/20">
              <AvatarImage src={mentor.image} alt={mentor.name} />
              <AvatarFallback className="bg-brand-purple text-white text-2xl">{mentor.initials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl font-bold">{mentor.name}</h2>
                <Badge className="bg-brand-purple text-white">Mentor</Badge>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center text-muted-foreground">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  <span>{mentor.role}</span>
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{mentor.institution}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-2">
                {mentor.rating && (
                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-brand-orange mr-1" />
                    <span className="text-sm">{mentor.rating} Rating</span>
                  </div>
                )}
                
                {mentor.students && (
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-brand-blue mr-1" />
                    <span className="text-sm">{mentor.students} Mentees</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm">{mentor.availability}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bio */}
          <div>
            <h3 className="text-lg font-semibold mb-2">About</h3>
            <p className="text-muted-foreground">{bio}</p>
          </div>
          
          {/* Specializations */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Specializations</h3>
            <div className="flex flex-wrap gap-2">
              {mentor.specialization.map((spec, index) => (
                <Badge key={index} variant="outline">{spec}</Badge>
              ))}
            </div>
          </div>
          
          {/* Publications */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Selected Publications</h3>
            <ul className="space-y-2 list-disc pl-5">
              {publications.map((pub, index) => (
                <li key={index} className="text-muted-foreground">{pub}</li>
              ))}
            </ul>
          </div>
          
          {/* Courses */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Courses & Workshops</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {courses.map((course, index) => (
                <Card key={index} className="bg-muted/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-brand-purple" />
                      <span>{course}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button className="gap-2" onClick={() => {
              onRequestMentorship();
              onClose(); // Close the dialog after sending the request
            }}>
              <MessageCircle className="h-4 w-4" />
              Request Mentorship
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MentorProfile;
