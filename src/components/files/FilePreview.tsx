
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye, EyeOff, FileText, Image as ImageIcon, File, MoreVertical, Edit, Trash2, Users, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Resource, resourcesApi, profilesApi, UserProfile } from '@/services/supabaseApi';
import { formatDistanceToNow } from 'date-fns';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseMutation, useSupabaseDirectQuery } from '@/hooks/useSupabase';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Define a common file type that works with both mock data and Supabase data
type FileData = {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: string;
  visibility: string;
  shared_with?: string[];
  created_at: string;
  uploader_id?: string;
  uploader?: {
    id?: string;
    full_name?: string;
    name?: string;
    avatar_url?: string;
  };
};

interface FilePreviewProps {
  file: FileData;
  onUpdate?: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onUpdate }) => {
  const { user } = useSupabaseAuth();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: file.title,
    description: file.description || '',
    visibility: file.visibility as 'public' | 'private'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>(file.shared_with || []);
  
  // Determine if current user is the owner
  const isOwner = user?.id === file.uploader_id;

  useEffect(() => {
    // In a real app, we would generate preview thumbnails
    // For this demo, we'll just use the file URL directly for images
    if (file.file_type?.includes('image')) {
      setPreviewUrl(file.file_url);
    }
    // For PDFs, in a real app we would use PDF.js to render the first page
    
    // Reset form data when file changes
    setEditFormData({
      title: file.title,
      description: file.description || '',
      visibility: file.visibility as 'public' | 'private'
    });
    setSelectedUsers(file.shared_with || []);
  }, [file]);
  
  // Fetch users for sharing
  const { data: usersData } = useSupabaseDirectQuery<UserProfile[]>(
    ['users'],
    async () => {
      const response = await profilesApi.getAll();
      return response.data || [];
    },
    {
      initialData: []
    }
  );
  
  const users = usersData || [];
  
  // Filter users based on search query and exclude current user
  const filteredUsers = users
    .filter(u => u.id !== user?.id) // Exclude current user
    .filter(u => 
      searchQuery.trim() === '' || 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
  // Update resource mutation
  const updateMutation = useSupabaseMutation(
    async (data: any) => {
      return await resourcesApi.update(file.id, {
        title: data.title,
        description: data.description,
        visibility: data.visibility,
        shared_with: data.visibility === 'private' ? data.shared_with : []
      });
    },
    {
      onSuccess: () => {
        toast({
          title: 'Resource updated',
          description: 'The resource has been updated successfully.'
        });
        setIsEditDialogOpen(false);
        setIsShareDialogOpen(false);
        if (onUpdate) onUpdate();
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Update failed',
          description: error.message || 'Failed to update resource.'
        });
      }
    }
  );
  
  // Delete resource mutation
  const deleteMutation = useSupabaseMutation<null, string>(
    (id) => resourcesApi.delete(id),
    {
      onSuccess: () => {
        toast({
          title: 'Resource deleted',
          description: 'The resource has been deleted successfully.'
        });
        setIsDeleteDialogOpen(false);
        if (onUpdate) onUpdate();
      },
      onError: (error) => {
        toast({
          variant: 'destructive',
          title: 'Delete failed',
          description: error.message || 'Failed to delete resource.'
        });
      }
    }
  );
  
  const handleUpdateResource = () => {
    if (!editFormData.title.trim()) {
      toast({
        variant: 'destructive',
        title: 'Title required',
        description: 'Please provide a title for the resource.'
      });
      return;
    }
    
    updateMutation.mutate({
      ...editFormData,
      shared_with: selectedUsers
    });
  };
  
  const handleDeleteResource = () => {
    deleteMutation.mutate(file.id);
  };
  
  const handleShareUpdate = () => {
    updateMutation.mutate({
      ...editFormData,
      shared_with: selectedUsers
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{file.title}</CardTitle>
            {file.description && (
              <p className="text-sm text-muted-foreground mt-1">{file.description}</p>
            )}
          </div>
          <Badge 
            variant={(file.visibility || 'public') === 'public' ? 'default' : 'outline'}
            className={cn(
              (file.visibility || 'public') === 'public' 
                ? 'bg-brand-blue hover:bg-brand-blue/80' 
                : 'border-brand-orange text-brand-orange'
            )}
          >
            {(file.visibility || 'public') === 'public' ? (
              <Eye className="h-3 w-3 mr-1" />
            ) : (
              <EyeOff className="h-3 w-3 mr-1" />
            )}
            {file.visibility || 'public'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-48 flex items-center justify-center bg-muted/30">
          {file.file_type === 'image' && previewUrl ? (
            <img 
              src={previewUrl} 
              alt={file.title} 
              className="h-full w-full object-cover" 
            />
          ) : file.file_type === 'pdf' ? (
            <div className="flex flex-col items-center justify-center">
              <FileText className="h-12 w-12 text-brand-orange" />
              <p className="mt-2 text-sm font-medium">PDF Document</p>
              <p className="text-xs text-muted-foreground">Click to view</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <File className="h-12 w-12 text-brand-blue" />
              <p className="mt-2 text-sm font-medium">{file.file_type.toUpperCase()} File</p>
              <p className="text-xs text-muted-foreground">Click to download</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-card flex flex-col space-y-3">
        {/* Uploader info */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground w-full">
          <span>Uploaded {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}</span>
          <span>•</span>
          <span>By {file.uploader ? (file.uploader.full_name || file.uploader.name || 'Unknown') : 'Unknown'}</span>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center justify-end w-full">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.open(file.file_url, '_blank')}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button size="sm" onClick={() => window.open(file.file_url, '_blank')}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          
            {/* Actions dropdown menu - only show for owner */}
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="ml-2 h-9 w-9 flex items-center justify-center">
                    <MoreVertical className="h-6 w-6 text-black" />
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsShareDialogOpen(true)}>
                  <Users className="h-4 w-4 mr-2" />
                  Manage Access
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          </div>
        </div>
        
        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Resource</DialogTitle>
              <DialogDescription>
                Update the details of your resource.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={editFormData.title} 
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={editFormData.description} 
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Visibility</Label>
                <RadioGroup 
                  value={editFormData.visibility} 
                  onValueChange={(value) => {
                    setEditFormData({...editFormData, visibility: value as 'public' | 'private'});
                    // Reset selected users when switching to public
                    if (value === 'public') {
                      setSelectedUsers([]);
                    }
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="edit-public" />
                    <Label htmlFor="edit-public">Public</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="edit-private" />
                    <Label htmlFor="edit-private">Private</Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  {editFormData.visibility === 'public' 
                    ? "Public resources can be accessed by all users on the platform." 
                    : "Private resources can only be accessed by you and users you select."}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleUpdateResource} 
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Share Dialog */}
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Access</DialogTitle>
              <DialogDescription>
                Control who can access this resource.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <RadioGroup 
                  value={editFormData.visibility} 
                  onValueChange={(value) => {
                    setEditFormData({...editFormData, visibility: value as 'public' | 'private'});
                    // Reset selected users when switching to public
                    if (value === 'public') {
                      setSelectedUsers([]);
                    }
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="share-public" />
                    <Label htmlFor="share-public">Public - Anyone can access</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="share-private" />
                    <Label htmlFor="share-private">Private - Only specific users</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {editFormData.visibility === 'private' && (
                <div className="space-y-3 border rounded-md p-3">
                  <div className="flex justify-between items-center">
                    <Label>Share with users</Label>
                    <div className="text-xs text-muted-foreground">
                      {selectedUsers.length} user(s) selected
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Input 
                      placeholder="Search users by name or email"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    
                    <ScrollArea className="h-40 border rounded-md p-2">
                      {filteredUsers.length > 0 ? (
                        <div className="space-y-2">
                          {filteredUsers.map(user => (
                            <div key={user.id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                              <Checkbox 
                                id={`user-${user.id}`}
                                checked={selectedUsers.includes(user.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedUsers(prev => [...prev, user.id]);
                                  } else {
                                    setSelectedUsers(prev => prev.filter(id => id !== user.id));
                                  }
                                }}
                              />
                              <div className="flex items-center space-x-2 flex-1">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.avatar_url || ''} alt={user.name || 'User'} />
                                  <AvatarFallback>{user.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{user.name || 'Unknown User'}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                              {selectedUsers.includes(user.id) && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                          <Users className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            {searchQuery ? 'No users found' : 'Select users to share with'}
                          </p>
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleShareUpdate} 
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Resource</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this resource? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteResource} 
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : 'Delete Resource'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default FilePreview;
