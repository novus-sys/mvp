
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, X, FileText, Image as ImageIcon, Loader2, UserPlus, Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { resourcesApi, profilesApi, ApiResponse, UserProfile } from '@/services/supabaseApi';
import { useSupabaseMutation, useSupabaseQuery, useSupabaseDirectQuery } from '@/hooks/useSupabase';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FileUploaderProps {
  userId: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ userId }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = (filesList: FileList | null) => {
    if (!filesList) return;

    const newFiles = Array.from(filesList);
    
    // Validate file types (PDF and images only)
    const validFiles = newFiles.filter(file => {
      const isValid = file.type.includes('pdf') || file.type.includes('image');
      
      if (!isValid) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: `${file.name} is not a PDF or image file.`,
        });
      }
      
      return isValid;
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

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
    ? users
        .filter(user => user.id !== userId) // Exclude current user
        .filter(user => 
          searchQuery.trim() === '' || 
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    : [];

  // Use Supabase mutation for file upload
  const uploadMutation = useSupabaseMutation(
    (file: File) => resourcesApi.upload(userId, file, {
      title,
      description,
      tags: [],
      visibility,
      shared_with: visibility === 'private' ? selectedUsers : []
    }),
    {
      onSuccess: () => {
        toast({
          title: "Upload successful",
          description: `File uploaded successfully.`,
        });
        setFiles([]);
        setTitle('');
        setDescription('');
        setIsUploading(false);
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: error.message || "An error occurred during upload.",
        });
        setIsUploading(false);
      }
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "No files selected",
        description: "Please select at least one file to upload.",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Title required",
        description: "Please provide a title for your upload.",
      });
      return;
    }

    setIsUploading(true);
    
    // Upload the first file (for simplicity)
    // In a real app, you might want to handle multiple files
    uploadMutation.mutate(files[0]);
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else {
      return <ImageIcon className="h-6 w-6 text-blue-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Resources</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              placeholder="Enter a title for your resource"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Briefly describe your resource"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div
            className={`border-2 border-dashed rounded-md p-6 transition-colors ${
              isDragging 
                ? 'border-brand-purple bg-brand-purple/5' 
                : 'border-border hover:border-muted-foreground/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="rounded-full bg-background p-2">
                <Upload className="h-8 w-8" />
              </div>
              <h3 className="font-medium">Drag files here or click to upload</h3>
              <p className="text-sm text-muted-foreground">
                PDFs and images only (max 10 MB per file)
              </p>
              <Input
                id="file"
                type="file"
                className="hidden"
                accept=".pdf,image/*"
                multiple
                onChange={handleFileInput}
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('file')?.click()}
                type="button"
              >
                Select Files
              </Button>
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-3">
              <Label>Selected files</Label>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-muted/30">
                  <div className="flex items-center space-x-2">
                    {getFileIcon(file)}
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px] md:max-w-[400px]">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => removeFile(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Visibility</Label>
              <RadioGroup 
                defaultValue="public"
                value={visibility}
                onValueChange={(value) => {
                  setVisibility(value as 'public' | 'private');
                  // Reset selected users when switching to public
                  if (value === 'public') {
                    setSelectedUsers([]);
                  }
                }}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public">Public</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private">Private</Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                {visibility === 'public' 
                  ? "Public resources can be accessed by all users on the platform." 
                  : "Private resources can only be accessed by you and users you select."}
              </p>
            </div>
            
            {visibility === 'private' && (
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
                        <UserPlus className="h-8 w-8 text-muted-foreground mb-2" />
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
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button disabled={isUploading || uploadMutation.isPending} type="submit">
            {isUploading || uploadMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default FileUploader;
