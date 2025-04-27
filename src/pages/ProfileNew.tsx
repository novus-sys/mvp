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

const ProfileNew = () => {
  const { user, profile, updateProfile } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [editableProfile, setEditableProfile] = useState({
    name: '',
    title: '',
    institution: '',
    location: '',
    bio: '',
    avatar_url: ''
  });
  
  // Stats for the user (these would ideally come from API calls)
  const [userStats, setUserStats] = useState({
    papers: 0,
    projects: 0,
    mentees: 0,
    resources: 0,
    answers: 0
  });
  
  // Initialize editable profile when user profile is loaded
  useEffect(() => {
    if (profile) {
      setEditableProfile({
        name: profile.name || '',
        title: profile.title || '',
        institution: profile.institution || '',
        location: profile.location || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);
  
  // If no user is logged in or profile is loading
  if (!user || !profile) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto p-6">
          <Card>
            <CardContent className="p-8 flex justify-center items-center">
              <p>Please log in to view your profile.</p>
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
  
  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      await updateProfile(editableProfile);
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was an error updating your profile."
      });
    }
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    // Reset to original profile data
    if (profile) {
      setEditableProfile({
        name: profile.name || '',
        title: profile.title || '',
        institution: profile.institution || '',
        location: profile.location || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || ''
      });
    }
    setIsEditing(false);
  };
  
  // Get initials for avatar fallback
  const getInitials = () => {
    if (!profile?.name) return 'U';
    return profile.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Handle avatar upload
  const handleAvatarUpload = async (file: File) => {
    try {
      setIsLoading(true);
      
      // Create a unique file name for the avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Use the Supabase client
      
      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL for the uploaded file
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const avatarUrl = data.publicUrl;
      
      // Update the profile with the new avatar URL
      await updateProfile({
        ...editableProfile,
        avatar_url: avatarUrl
      });
      
      setIsAvatarDialogOpen(false);
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully."
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your avatar."
      });
    } finally {
      setIsLoading(false);
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
                  <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.name} />
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
                    disabled={isLoading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleAvatarUpload(file);
                      }
                    }} 
                  />
                  {isLoading && (
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
                      <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.name} />
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
                      <h2 className="text-xl font-bold">{profile.name}</h2>
                      <p className="text-muted-foreground">{profile.title || 'Add your title'}</p>
                      
                      {profile.location && (
                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Action buttons */}
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="default" size="sm" onClick={handleSaveProfile} disabled={isLoading}>
                          {isLoading ? (
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
                    </>
                  ) : (
                    <>
                      <div>
                        <h3 className="font-medium mb-2">Institution</h3>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-brand-orange" />
                          <span>{profile.institution || 'Add your institution'}</span>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Bio</h3>
                        <p className="text-sm text-muted-foreground">
                          {profile.bio || 'Add your bio to tell others about yourself'}
                        </p>
                      </div>
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

export default ProfileNew;
