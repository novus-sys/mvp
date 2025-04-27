
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, Upload, Filter, Loader2 } from 'lucide-react';
import FileUploader from '@/components/files/FileUploader';
import FilePreview from '@/components/files/FilePreview';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useSupabaseQuery } from '@/hooks/useSupabase';
import { resourcesApi, Resource } from '@/services/supabaseApi';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Define a type that matches our FileData type from FilePreview
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

// Fallback mock data in case Supabase is not configured or there's an error
const mockFiles: FileData[] = [
  {
    id: '1',
    title: 'Machine Learning Techniques Research Paper',
    description: 'Comprehensive analysis of modern ML algorithms and applications',
    file_url: 'https://example.com/paper1.pdf',
    file_type: 'pdf',
    visibility: 'public',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    uploader_id: 'user1',
    uploader: {
      id: 'user1',
      full_name: 'Rahul Sharma',
    }
  },
  {
    id: '2',
    title: 'Quantum Computing Fundamentals',
    description: 'An introduction to quantum computing principles and algorithms',
    file_url: 'https://example.com/paper2.pdf',
    file_type: 'pdf',
    visibility: 'public',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    uploader_id: 'user2',
    uploader: {
      id: 'user2',
      full_name: 'Priya Singh',
    }
  },
  {
    id: '3',
    title: 'Sustainable Energy Research Data',
    description: '',
    file_url: 'https://example.com/paper3.pdf',
    file_type: 'pdf',
    visibility: 'public',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    uploader_id: 'user3',
    uploader: {
      id: 'user3',
      full_name: 'Amit Kumar',
    }
  }
];

const Resources = () => {
  const { user } = useSupabaseAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [fileView, setFileView] = useState<'grid' | 'list'>('grid');
  const [fileFilter, setFileFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Used to trigger refetching

  // Fetch all resources from Supabase
  const { data: resources, isLoading, isError, error, refetch: refetchResources } = useSupabaseQuery<Resource[]>(
    ['resources', refreshTrigger.toString()], // Add refreshTrigger to force refetch when needed
    resourcesApi.getAll
  );
  
  // Fetch resources shared with the current user
  const { data: sharedResources, isLoading: isLoadingShared, refetch: refetchShared } = useSupabaseQuery<Resource[]>(
    ['resources', 'shared', user?.id, refreshTrigger.toString()], // Add refreshTrigger to force refetch when needed
    async () => {
      if (!user) return { data: null, error: null };
      // This should only fetch private resources that are shared with the current user
      // and NOT uploaded by the current user
      return await resourcesApi.getAllSharedWithUser(user.id);
    },
    {
      // Only fetch if user is logged in and shared tab is active
      enabled: !!user && activeTab === 'shared'
    }
  );

  // Transform Supabase resources to match our FileData type
  const transformedResources: FileData[] = resources?.map(resource => ({
    id: resource.id,
    title: resource.title,
    description: resource.description,
    file_url: resource.file_url,
    file_type: resource.file_type || 'other',
    visibility: resource.visibility || 'public',
    shared_with: resource.shared_with || [],
    created_at: resource.created_at,
    // Use the uploader's id as the uploader_id for consistency
    uploader_id: resource.uploader?.id,
    uploader: resource.uploader ? {
      id: resource.uploader.id,
      full_name: resource.uploader.name,
      name: resource.uploader.name,
      avatar_url: resource.uploader.avatar_url
    } : undefined
  })) || [];

  // Use real data if available, otherwise fall back to mock data
  const files: FileData[] = transformedResources.length > 0 ? transformedResources : mockFiles;

  // Get the appropriate files based on the active tab
  const getFilesForActiveTab = () => {
    // For the shared tab, use the dedicated shared resources query
    if (activeTab === 'shared' && sharedResources) {
      // Transform shared resources to match our FileData type
      return sharedResources.map(resource => ({
        id: resource.id,
        title: resource.title,
        description: resource.description,
        file_url: resource.file_url,
        file_type: resource.file_type || 'other',
        visibility: resource.visibility || 'private',
        shared_with: resource.shared_with || [],
        created_at: resource.created_at,
        uploader_id: resource.uploader?.id,
        uploader: resource.uploader ? {
          id: resource.uploader.id,
          full_name: resource.uploader.name,
          name: resource.uploader.name,
          avatar_url: resource.uploader.avatar_url
        } : undefined
      }));
    }
    
    // For other tabs, use the main files array
    return files;
  };
  
  const tabFiles = getFilesForActiveTab();
  
  // Filter files based on search query, type filter, and visibility permissions
  const filteredFiles = tabFiles.filter(file => {
    // Filter by search query
    if (searchQuery && !file.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filter by file type
    if (fileFilter !== 'all' && file.file_type && !file.file_type.includes(fileFilter)) {
      return false;
    }

    // For the 'all' tab, only show public resources and private resources the user has access to
    if (activeTab === 'all') {
      // Always show public resources
      if (file.visibility === 'public') return true;
      
      // For private resources, check permissions
      if (file.visibility === 'private') {
        // If not logged in, don't show private resources
        if (!user) return false;
        
        // Show if user is the uploader or in the shared_with list
        const isUploader = file.uploader_id === user.id;
        const isSharedWith = file.shared_with?.includes(user.id);
        
        return isUploader || isSharedWith;
      }
    }

    // For 'my' tab, only show resources uploaded by the current user
    if (activeTab === 'my') {
      if (!user) return false;
      return file.uploader_id === user.id;
    }

    // For 'shared' tab, the filtering is already done by the API call
    // but we'll add an extra check just to be safe
    if (activeTab === 'shared') {
      if (!user) return false;
      // Only show private resources that are shared with the current user
      // and NOT uploaded by the current user
      return file.visibility === 'private' && 
             file.shared_with?.includes(user.id) && 
             file.uploader_id !== user.id;
    }

    return true;
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Academic Resources</h1>
            <p className="text-muted-foreground mt-1">Share and discover academic materials</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button disabled={!user}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              {user && <FileUploader userId={user.id} />}
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-4">
              <TabsList>
                <TabsTrigger value="all">All Resources</TabsTrigger>
                <TabsTrigger value="my" disabled={!user}>My Uploads</TabsTrigger>
                <TabsTrigger value="shared" disabled={!user}>Shared With Me</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search resources..." 
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select defaultValue="all" onValueChange={setFileFilter}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="doc">Documents</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="all" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading resources...</span>
                </div>
              ) : isError ? (
                <Alert variant="destructive" className="my-4">
                  <AlertDescription>
                    {error?.message || 'Failed to load resources. Please try again later.'}
                  </AlertDescription>
                </Alert>
              ) : filteredFiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFiles.map((file) => (
                    <FilePreview 
                      key={file.id} 
                      file={file} 
                      onUpdate={() => {
                        // Trigger refetch when a resource is updated or deleted
                        setRefreshTrigger(prev => prev + 1);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">No resources found</h3>
                  <p className="text-muted-foreground mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="my" className="mt-0">
              {!user ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">Please sign in</h3>
                  <p className="text-muted-foreground mt-1">You need to be logged in to view your uploads</p>
                </div>
              ) : isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredFiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFiles.map((file) => (
                    <FilePreview 
                      key={file.id} 
                      file={file} 
                      onUpdate={() => {
                        // Trigger refetch when a resource is updated or deleted
                        setRefreshTrigger(prev => prev + 1);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">No uploads yet</h3>
                  <p className="text-muted-foreground mt-1">You haven't uploaded any resources yet</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="mt-4">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload New Resource
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      {user && <FileUploader userId={user.id} />}
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="shared" className="mt-0">
                {!user ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium">Please sign in</h3>
                  <p className="text-muted-foreground mt-1">You need to be logged in to view shared resources</p>
                </div>
              ) : (
                isLoadingShared ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading shared resources...</span>
                  </div>
                ) : filteredFiles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFiles.map((file) => (
                      <FilePreview key={file.id} file={file} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">No resources shared with you</h3>
                    <p className="text-muted-foreground mt-1">When others share resources with you, they'll appear here</p>
                  </div>
                )
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Resources;
