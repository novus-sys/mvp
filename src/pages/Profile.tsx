import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, MapPin, GraduationCap, BookOpen, FileText, Users, Link, Award, MessageCircle, Save, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Profile = () => {
  // Get auth user and updateProfile from context
  const { user, updateProfile } = useSupabaseAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [editableProfile, setEditableProfile] = useState({
    name: '',
    title: '',
    institution: '',
    location: '',
    bio: '',
    avatar_url: '',
    skills: []
  });
  
  // State for academic timeline
  const [academicTimeline, setAcademicTimeline] = useState([
    { id: '1', degree: '', institution: '', year: '' }
  ]);
  
  // State for managing new skill input
  const [newSkill, setNewSkill] = useState('');
  
  // Stats for the user (these would ideally come from API calls)
  const [userStats, setUserStats] = useState({
    papers: 0,
    projects: 0,
    mentees: 0,
    resources: 0,
    answers: 0
  });
  
  // Fetch profile data directly from Supabase
  const fetchProfileData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      console.log('Fetching profile data for user ID:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      console.log('Fetched profile data:', data);
      
      // Set profile data
      setProfileData(data);
      
      // Initialize editable states with safe defaults
      setEditableProfile({
        name: data.name || '',
        title: data.title || '',
        institution: data.institution || '',
        location: data.location || '',
        bio: data.bio || '',
        avatar_url: data.avatar_url || '',
        skills: Array.isArray(data.skills) ? data.skills : []
      });
      
      // Initialize academic timeline with safe defaults
      if (data.academic_timeline && Array.isArray(data.academic_timeline) && data.academic_timeline.length > 0) {
        setAcademicTimeline(data.academic_timeline);
      } else {
        // Set default empty timeline with one entry
        setAcademicTimeline([{ id: '1', degree: '', institution: '', year: '' }]);
      }
      
      // Initialize user stats with safe defaults
      if (data.stats && typeof data.stats === 'object') {
        setUserStats({
          papers: Number(data.stats.papers) || 0,
          projects: Number(data.stats.projects) || 0,
          mentees: Number(data.stats.mentees) || 0,
          resources: Number(data.stats.resources) || 0,
          answers: Number(data.stats.answers) || 0
        });
      } else {
        // Set default empty stats
        setUserStats({
          papers: 0,
          projects: 0,
          mentees: 0,
          resources: 0,
          answers: 0
        });
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if the profile table has the necessary columns
  const checkProfileTable = async () => {
    try {
      console.log('Checking profile table structure...');
      
      // First, check if the user has a profile at all
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      console.log('Profile check result:', { data, error });
      
      // If the profile doesn't exist, we need to create it
      if (!data) {
        console.log('Profile does not exist, creating default profile...');
        
        const defaultProfile = {
          id: user.id,
          name: user.email?.split('@')[0] || 'User',
          title: '',
          institution: '',
          location: '',
          bio: '',
          avatar_url: '',
          skills: [],
          academic_timeline: [{ id: '1', degree: '', institution: '', year: '' }],
          stats: {
            papers: 0,
            projects: 0,
            mentees: 0,
            resources: 0,
            answers: 0
          }
        };
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(defaultProfile);
        
        if (insertError) {
          console.error('Error creating default profile:', insertError);
        } else {
          console.log('Default profile created successfully');
        }
      }
    } catch (error) {
      console.error('Error checking profile table:', error);
    }
  };
  
  // Fetch profile data on component mount or when user changes
  useEffect(() => {
    checkProfileTable().then(() => fetchProfileData());
  }, [user]);
  
  // If no user is logged in or profile is loading
  if (!user || isLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto p-6">
          <Card>
            <CardContent className="p-8 flex justify-center items-center">
              {!user ? (
                <p>Please log in to view your profile.</p>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-brand-purple animate-spin mb-4"></div>
                  <p>Loading your profile...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  // If profile data couldn't be loaded
  if (!profileData) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto p-6">
          <Card>
            <CardContent className="p-8 flex justify-center items-center">
              <p>There was an error loading your profile. Please try again later.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditableProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle adding a new skill
  const handleAddSkill = () => {
    if (newSkill.trim() && !editableProfile.skills.includes(newSkill.trim())) {
      setEditableProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };
  
  // Handle removing a skill
  const handleRemoveSkill = (skillToRemove: string) => {
    setEditableProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };
  
  // Handle academic timeline changes
  const handleTimelineChange = (index: number, field: string, value: string) => {
    const updatedTimeline = [...academicTimeline];
    updatedTimeline[index] = { ...updatedTimeline[index], [field]: value };
    setAcademicTimeline(updatedTimeline);
  };
  
  // Add new timeline entry
  const addTimelineEntry = () => {
    setAcademicTimeline(prev => [
      ...prev, 
      { id: `${Date.now()}`, degree: '', institution: '', year: '' }
    ]);
  };
  
  // Remove timeline entry
  const removeTimelineEntry = (id: string) => {
    setAcademicTimeline(prev => prev.filter(entry => entry.id !== id));
  };
  
  // Save profile changes using the context's updateProfile method
  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      // Ensure skills is an array
      const safeSkills = Array.isArray(editableProfile.skills) ? editableProfile.skills : [];
      
      // Ensure academic_timeline is an array of valid objects
      const safeTimeline = Array.isArray(academicTimeline) ? academicTimeline.map(entry => ({
        id: entry.id || String(Date.now()),
        degree: entry.degree || '',
        institution: entry.institution || '',
        year: entry.year || ''
      })) : [];
      
      // Ensure stats is a valid object
      const safeStats = {
        papers: Number(userStats.papers) || 0,
        projects: Number(userStats.projects) || 0,
        mentees: Number(userStats.mentees) || 0,
        resources: Number(userStats.resources) || 0,
        answers: Number(userStats.answers) || 0
      };
      
      // Prepare the sanitized profile data
      const updatedProfile = {
        name: editableProfile.name || '',
        title: editableProfile.title || '',
        institution: editableProfile.institution || '',
        location: editableProfile.location || '',
        bio: editableProfile.bio || '',
        avatar_url: editableProfile.avatar_url || '',
        skills: safeSkills,
        academic_timeline: safeTimeline,
        stats: safeStats
      };
      
      console.log('Saving profile with sanitized data:', updatedProfile);
      
      await updateProfile(updatedProfile);
      
      // Fetch the updated profile data to refresh the UI
      await fetchProfileData();
      
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // More detailed error information
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      toast({
        variant: "destructive",
        title: "Update failed",
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    // Reset to original profile data
    if (profileData) {
      setEditableProfile({
        name: profileData.name || '',
        title: profileData.title || '',
        institution: profileData.institution || '',
        location: profileData.location || '',
        bio: profileData.bio || '',
        avatar_url: profileData.avatar_url || '',
        skills: profileData.skills || []
      });
      
      // Reset timeline
      if (profileData.academic_timeline && Array.isArray(profileData.academic_timeline)) {
        setAcademicTimeline(profileData.academic_timeline);
      } else {
        setAcademicTimeline([{ id: '1', degree: '', institution: '', year: '' }]);
      }
    }
    setIsEditing(false);
    setNewSkill('');
  };
  
  // Get initials for avatar fallback
  const getInitials = () => {
    if (!profileData?.name) return 'U';
    return profileData.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Handle avatar upload directly with Supabase
  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      console.log('Starting avatar upload for user:', user.id);
      
      // Validate file size and type
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size exceeds 5MB limit');
      }
      
      // Create a unique file name for the avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      console.log('Uploading file:', fileName);
      
      // Upload the file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      console.log('Upload response:', { uploadData, uploadError });
      
      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }
      
      // Get the public URL for the uploaded file
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const avatarUrl = data.publicUrl;
      
      console.log('Avatar URL:', avatarUrl);
      
      // Update the profile with the new avatar URL directly in Supabase
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);
      
      console.log('Profile update response:', { updateData, updateError });
      
      if (updateError) {
        console.error('Profile update error details:', updateError);
        throw updateError;
      }
      
      // Fetch the updated profile to ensure we have the latest data
      await fetchProfileData();
      
      setIsAvatarDialogOpen(false);
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully."
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      
      // More detailed error information
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Avatar Upload Dialog */}
        <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Profile Picture</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileData.avatar_url || "/placeholder.svg"} alt={profileData.name} />
                  <AvatarFallback className="bg-brand-purple text-white text-lg">{getInitials()}</AvatarFallback>
                </Avatar>
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">Upload new picture</Label>
                <div className="relative">
                  <Input 
                    id="avatar" 
                    type="file" 
                    accept="image/*"
                    disabled={isSaving}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleAvatarUpload(file);
                      }
                    }} 
                  />
                  {isSaving && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-brand-purple border-t-transparent" />
                    </div>
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Recommended: Square image, at least 200x200 pixels.</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Profile card */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  {/* Avatar with edit option */}
                  <div className="relative">
                    <Avatar className="h-24 w-24 mb-4 cursor-pointer" onClick={() => setIsAvatarDialogOpen(true)}>
                      <AvatarImage src={profileData.avatar_url || "/placeholder.svg"} alt={profileData.name} />
                      <AvatarFallback className="bg-brand-purple text-white text-lg">{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-3 right-0 bg-brand-purple text-white rounded-full p-1 cursor-pointer"
                         onClick={() => setIsAvatarDialogOpen(true)}>
                      <Edit className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  
                  {/* Profile info - editable or static */}
                  {isEditing ? (
                    <div className="space-y-3 w-full max-w-xs">
                      <Input 
                        name="name" 
                        value={editableProfile.name} 
                        onChange={handleInputChange} 
                        placeholder="Your name"
                        className="text-center font-bold text-lg"
                      />
                      <Input 
                        name="title" 
                        value={editableProfile.title} 
                        onChange={handleInputChange} 
                        placeholder="Your title or role"
                        className="text-center text-muted-foreground"
                      />
                      <div className="flex items-center justify-center">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        <Input 
                          name="location" 
                          value={editableProfile.location} 
                          onChange={handleInputChange} 
                          placeholder="Your location"
                          className="text-center text-sm text-muted-foreground"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold">{profileData.name}</h2>
                      <p className="text-muted-foreground">{profileData.title || 'Add your title'}</p>
                      
                      {profileData.location && (
                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          <span>{profileData.location}</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Action buttons */}
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="default" size="sm" onClick={handleSaveProfile} disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <div className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm">
                          <Users className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                        <Button variant="outline" size="sm">
                          <Link className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <Separator className="my-6" />
                
                {/* Institution and Bio section */}
                <div className="space-y-4 text-left">
                  {isEditing ? (
                    <>
                      <div>
                        <Label htmlFor="institution" className="font-medium mb-2 block">Institution</Label>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-brand-orange" />
                          <Input 
                            id="institution"
                            name="institution" 
                            value={editableProfile.institution} 
                            onChange={handleInputChange} 
                            placeholder="Your institution"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="bio" className="font-medium mb-2 block">Bio</Label>
                        <Textarea 
                          id="bio"
                          name="bio" 
                          value={editableProfile.bio} 
                          onChange={handleInputChange} 
                          placeholder="Tell others about yourself"
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      {/* Skills section - editable */}
                      <div>
                        <Label htmlFor="skills" className="font-medium mb-2 block">Skills</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {editableProfile.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="px-2 py-1 flex items-center gap-1">
                              {skill}
                              <button 
                                type="button" 
                                onClick={() => handleRemoveSkill(skill)}
                                className="ml-1 h-4 w-4 rounded-full bg-muted-foreground/20 inline-flex items-center justify-center hover:bg-muted-foreground/40"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            id="newSkill"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Add a skill"
                            className="flex-1"
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                          />
                          <Button type="button" size="sm" onClick={handleAddSkill}>
                            Add
                          </Button>
                        </div>
                      </div>
                      
                      {/* Academic Timeline - editable */}
                      <div>
                        <Label className="font-medium mb-2 block">Academic Timeline</Label>
                        <div className="space-y-3">
                          {academicTimeline.map((entry, index) => (
                            <div key={entry.id} className="space-y-2 p-3 border rounded-md relative">
                              {academicTimeline.length > 1 && (
                                <button 
                                  type="button" 
                                  onClick={() => removeTimelineEntry(entry.id)}
                                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-muted-foreground/20 inline-flex items-center justify-center hover:bg-muted-foreground/40"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                              <div>
                                <Label htmlFor={`degree-${index}`}>Degree</Label>
                                <Input
                                  id={`degree-${index}`}
                                  value={entry.degree}
                                  onChange={(e) => handleTimelineChange(index, 'degree', e.target.value)}
                                  placeholder="e.g., Ph.D. in Computer Science"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`institution-${index}`}>Institution</Label>
                                <Input
                                  id={`institution-${index}`}
                                  value={entry.institution}
                                  onChange={(e) => handleTimelineChange(index, 'institution', e.target.value)}
                                  placeholder="e.g., IIT Delhi"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`year-${index}`}>Year</Label>
                                <Input
                                  id={`year-${index}`}
                                  value={entry.year}
                                  onChange={(e) => handleTimelineChange(index, 'year', e.target.value)}
                                  placeholder="e.g., 2020-2024"
                                />
                              </div>
                            </div>
                          ))}
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={addTimelineEntry}
                            className="w-full"
                          >
                            <GraduationCap className="h-4 w-4 mr-2" />
                            Add Education
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <h3 className="font-medium mb-2">Institution</h3>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-brand-orange" />
                          <span>{profileData.institution || 'Add your institution'}</span>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Bio</h3>
                        <p className="text-sm text-muted-foreground">
                          {profileData.bio || 'Add your bio to tell others about yourself'}
                        </p>
                      </div>
                      
                      {/* Skills section - display */}
                      {(profileData.skills && profileData.skills.length > 0) && (
                        <div>
                          <h3 className="font-medium mb-2">Skills</h3>
                          <div className="flex flex-wrap gap-2">
                            {profileData.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Academic Timeline - display */}
                      {(profileData.academic_timeline && profileData.academic_timeline.length > 0) && (
                        <div>
                          <h3 className="font-medium mb-2">Academic Timeline</h3>
                          <div className="space-y-3">
                            {profileData.academic_timeline.map((entry, index) => (
                              <div key={index} className="border-l-2 border-brand-purple pl-4 pb-4">
                                <h4 className="font-medium">{entry.degree}</h4>
                                <div className="text-sm text-muted-foreground">{entry.institution}</div>
                                <div className="text-xs text-muted-foreground">{entry.year}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Tabs */}
          <div className="md:col-span-2">
            <Tabs defaultValue="overview">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Academic Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress bars */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">Research</h3>
                          <span className="text-sm text-muted-foreground">75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">Teaching</h3>
                          <span className="text-sm text-muted-foreground">60%</span>
                        </div>
                        <Progress value={60} className="h-2" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">Collaboration</h3>
                          <span className="text-sm text-muted-foreground">85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    {/* Stats */}
                    <div>
                      <h3 className="font-medium mb-4">Activity Stats</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                          <FileText className="h-5 w-5 mb-1 text-brand-purple" />
                          <span className="text-xl font-bold">{userStats.papers}</span>
                          <span className="text-xs text-muted-foreground">Papers</span>
                        </div>
                        
                        <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                          <Users className="h-5 w-5 mb-1 text-brand-purple" />
                          <span className="text-xl font-bold">{userStats.projects}</span>
                          <span className="text-xs text-muted-foreground">Projects</span>
                        </div>
                        
                        <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                          <MessageCircle className="h-5 w-5 mb-1 text-brand-purple" />
                          <span className="text-xl font-bold">{userStats.answers}</span>
                          <span className="text-xs text-muted-foreground">Answers</span>
                        </div>
                        
                        <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                          <BookOpen className="h-5 w-5 mb-1 text-brand-purple" />
                          <span className="text-xl font-bold">{userStats.resources}</span>
                          <span className="text-xs text-muted-foreground">Resources</span>
                        </div>
                        
                        <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                          <Award className="h-5 w-5 mb-1 text-brand-purple" />
                          <span className="text-xl font-bold">{userStats.mentees}</span>
                          <span className="text-xs text-muted-foreground">Mentees</span>
                        </div>
                      </div>
                      
                      {isEditing && (
                        <>
                          <Separator className="my-6" />
                          <div>
                            <h3 className="font-medium mb-4">Edit Stats</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div>
                                <Label htmlFor="papers">Papers</Label>
                                <Input
                                  id="papers"
                                  type="number"
                                  min="0"
                                  value={userStats.papers}
                                  onChange={(e) => setUserStats(prev => ({ ...prev, papers: parseInt(e.target.value) || 0 }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="projects">Projects</Label>
                                <Input
                                  id="projects"
                                  type="number"
                                  min="0"
                                  value={userStats.projects}
                                  onChange={(e) => setUserStats(prev => ({ ...prev, projects: parseInt(e.target.value) || 0 }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="mentees">Mentees</Label>
                                <Input
                                  id="mentees"
                                  type="number"
                                  min="0"
                                  value={userStats.mentees}
                                  onChange={(e) => setUserStats(prev => ({ ...prev, mentees: parseInt(e.target.value) || 0 }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="resources">Resources</Label>
                                <Input
                                  id="resources"
                                  type="number"
                                  min="0"
                                  value={userStats.resources}
                                  onChange={(e) => setUserStats(prev => ({ ...prev, resources: parseInt(e.target.value) || 0 }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="answers">Answers</Label>
                                <Input
                                  id="answers"
                                  type="number"
                                  min="0"
                                  value={userStats.answers}
                                  onChange={(e) => setUserStats(prev => ({ ...prev, answers: parseInt(e.target.value) || 0 }))}
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Resources Tab */}
              <TabsContent value="resources">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">My Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">You haven't uploaded any resources yet.</p>
                    <Button className="mt-4" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Upload Resource
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Mentorship Tab */}
              <TabsContent value="mentorship">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Mentorship</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">You are not currently mentoring anyone.</p>
                    <Button className="mt-4" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Become a Mentor
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
