import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageCircle, ThumbsUp, Award, ArrowRight } from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { getMentorRecommendations, extractUserInterests, RecommendationScore } from '@/lib/recommendation-service';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface MentorMatchingProps {
  onClose?: () => void;
}

interface MentorProfile {
  id: string;
  name: string;
  role: string;
  institution: string;
  avatar_url?: string;
  bio?: string;
  score: number;
  matchReasons: string[];
  initials: string;
}

const MentorMatching: React.FC<MentorMatchingProps> = ({ onClose }) => {
  const { user } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [recommendedMentors, setRecommendedMentors] = useState<MentorProfile[]>([]);
  
  // User interests form state
  const [academicInterests, setAcademicInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState<string>('');
  const [researchTopics, setResearchTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState<string>('');
  const [selectedPreferences, setSelectedPreferences] = useState<Record<string, boolean>>({
    'machine-learning': false,
    'data-science': false,
    'research-methodology': false,
    'academic-writing': false,
    'career-guidance': false,
    'programming': false,
    'mathematics': false,
    'physics': false,
    'biology': false,
    'chemistry': false,
  });
  
  // Extract user interests on mount
  useEffect(() => {
    const fetchUserInterests = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const interests = await extractUserInterests(user.id);
        
        // Set extracted interests
        setAcademicInterests(interests.academicInterests);
        setResearchTopics(interests.researchTopics);
        
        // Set preferences based on extracted interests
        const newPreferences = { ...selectedPreferences };
        Object.keys(selectedPreferences).forEach(key => {
          const normalizedKey = key.replace(/-/g, ' ');
          if (
            interests.academicInterests.some(interest => 
              interest.toLowerCase().includes(normalizedKey)
            ) ||
            interests.researchTopics.some(topic => 
              topic.toLowerCase().includes(normalizedKey)
            )
          ) {
            newPreferences[key] = true;
          }
        });
        setSelectedPreferences(newPreferences);
        
      } catch (error) {
        console.error('Error fetching user interests:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserInterests();
  }, [user]);
  
  // Handle finding mentor matches
  const handleFindMatches = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication required',
        description: 'You must be logged in to find mentor matches.'
      });
      return;
    }
    
    try {
      setIsAnalyzing(true);
      
      // Combine form data into user interests
      const userInterests = {
        academicInterests: [
          ...academicInterests,
          ...Object.keys(selectedPreferences)
            .filter(key => selectedPreferences[key])
            .map(key => key.replace(/-/g, ' '))
        ],
        researchTopics: researchTopics,
        careerGoals: [],
        skillsToLearn: []
      };
      
      // Get mentor recommendations
      const recommendations = await getMentorRecommendations(user, userInterests);
      
      // Fetch mentor profiles
      const mentorProfiles: MentorProfile[] = await Promise.all(
        recommendations.map(async (rec) => {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', rec.mentorId)
              .single();
            
            if (error || !data) {
              throw error || new Error('Mentor profile not found');
            }
            
            return {
              id: data.id,
              name: data.name || 'Anonymous',
              role: data.role || 'Mentor',
              institution: data.institution || 'Unknown Institution',
              avatar_url: data.avatar_url,
              bio: data.bio,
              score: rec.score,
              matchReasons: rec.matchReasons,
              initials: getInitials(data.name || 'Anonymous')
            };
          } catch (error) {
            console.error(`Error fetching mentor profile ${rec.mentorId}:`, error);
            return null;
          }
        })
      );
      
      // Filter out null profiles and sort by score
      setRecommendedMentors(
        mentorProfiles
          .filter((profile): profile is MentorProfile => profile !== null)
          .sort((a, b) => b.score - a.score)
      );
      
      // Move to results step
      setStep(2);
      
    } catch (error) {
      console.error('Error finding mentor matches:', error);
      toast({
        variant: 'destructive',
        title: 'Error finding matches',
        description: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Handle adding a new interest
  const handleAddInterest = () => {
    if (newInterest.trim() && !academicInterests.includes(newInterest.trim())) {
      setAcademicInterests([...academicInterests, newInterest.trim()]);
      setNewInterest('');
    }
  };
  
  // Handle removing an interest
  const handleRemoveInterest = (interest: string) => {
    setAcademicInterests(academicInterests.filter(i => i !== interest));
  };
  
  // Handle adding a new research topic
  const handleAddTopic = () => {
    if (newTopic.trim() && !researchTopics.includes(newTopic.trim())) {
      setResearchTopics([...researchTopics, newTopic.trim()]);
      setNewTopic('');
    }
  };
  
  // Handle removing a research topic
  const handleRemoveTopic = (topic: string) => {
    setResearchTopics(researchTopics.filter(t => t !== topic));
  };
  
  // Handle preference checkbox change
  const handlePreferenceChange = (key: string, checked: boolean) => {
    setSelectedPreferences({
      ...selectedPreferences,
      [key]: checked
    });
  };
  
  // Get initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Calculate match percentage
  const calculateMatchPercentage = (score: number): number => {
    // Normalize score to percentage (max score is around 10)
    return Math.min(Math.round(score * 10), 100);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-brand-purple">Find Your Ideal Mentor</CardTitle>
            <CardDescription>
              Tell us about your academic interests and research topics to help us find the best mentors for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="interests">
              <TabsList className="mb-4">
                <TabsTrigger value="interests">Academic Interests</TabsTrigger>
                <TabsTrigger value="research">Research Topics</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>
              
              <TabsContent value="interests" className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Your Academic Interests</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your academic interests to help us find mentors with relevant expertise
                  </p>
                  
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Add an academic interest (e.g., Machine Learning)"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddInterest()}
                    />
                    <Button onClick={handleAddInterest}>Add</Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {academicInterests.map((interest, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="px-3 py-1 flex items-center gap-1"
                      >
                        {interest}
                        <button 
                          className="ml-1 text-muted-foreground hover:text-foreground"
                          onClick={() => handleRemoveInterest(interest)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                    {academicInterests.length === 0 && (
                      <p className="text-sm text-muted-foreground">No interests added yet</p>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="research" className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Your Research Topics</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add specific research topics you're interested in
                  </p>
                  
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Add a research topic (e.g., Natural Language Processing)"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                    />
                    <Button onClick={handleAddTopic}>Add</Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {researchTopics.map((topic, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="px-3 py-1 flex items-center gap-1"
                      >
                        {topic}
                        <button 
                          className="ml-1 text-muted-foreground hover:text-foreground"
                          onClick={() => handleRemoveTopic(topic)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                    {researchTopics.length === 0 && (
                      <p className="text-sm text-muted-foreground">No research topics added yet</p>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="preferences" className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Mentorship Preferences</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Select areas where you'd like guidance from a mentor
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(selectedPreferences).map(([key, checked]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox 
                          id={key} 
                          checked={checked}
                          onCheckedChange={(checked) => 
                            handlePreferenceChange(key, checked === true)
                          }
                        />
                        <Label htmlFor={key} className="capitalize">
                          {key.replace(/-/g, ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleFindMatches}
              disabled={isAnalyzing || (academicInterests.length === 0 && researchTopics.length === 0 && !Object.values(selectedPreferences).some(v => v))}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Find Matches
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-brand-purple">Your Mentor Matches</h2>
            <Button variant="outline" onClick={() => setStep(1)}>
              Refine Preferences
            </Button>
          </div>
          
          {recommendedMentors.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mb-4">
                  <Award className="h-12 w-12 mx-auto text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No matches found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find any mentors matching your interests. Try adding more interests or changing your preferences.
                </p>
                <Button onClick={() => setStep(1)}>Update Preferences</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {recommendedMentors.map((mentor) => (
                <Card key={mentor.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={mentor.avatar_url} alt={mentor.name} />
                          <AvatarFallback className="bg-brand-purple text-white">
                            {mentor.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-bold">{mentor.name}</h3>
                          <p className="text-sm text-muted-foreground">{mentor.role}</p>
                          <p className="text-xs text-muted-foreground">{mentor.institution}</p>
                        </div>
                      </div>
                      
                      {mentor.bio && (
                        <p className="text-sm mb-4 line-clamp-2">{mentor.bio}</p>
                      )}
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-1">Why they're a good match:</h4>
                        <ul className="text-sm space-y-1">
                          {mentor.matchReasons.map((reason, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <ThumbsUp className="h-4 w-4 text-brand-purple mt-0.5" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button className="w-full md:w-auto">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Connect with Mentor
                      </Button>
                    </div>
                    
                    <div className="bg-muted p-6 md:w-48 flex flex-col items-center justify-center">
                      <div className="text-center mb-4">
                        <h4 className="text-sm font-medium mb-1">Match Score</h4>
                        <div className="relative h-32 w-32">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold text-brand-purple">
                              {calculateMatchPercentage(mentor.score)}%
                            </span>
                          </div>
                          <svg className="h-full w-full" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="10"
                              strokeLinecap="round"
                              className="text-muted-foreground/20"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="10"
                              strokeLinecap="round"
                              strokeDasharray={`${calculateMatchPercentage(mentor.score) * 2.83} 283`}
                              strokeDashoffset="0"
                              className="text-brand-purple"
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-brand-purple/10 text-brand-purple">
                        Top Match
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MentorMatching;
