
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
import { Search, Upload, Filter } from 'lucide-react';
import FileUploader from '@/components/files/FileUploader';
import FilePreview from '@/components/files/FilePreview';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const mockFiles = [
  {
    id: '1',
    title: 'Machine Learning Techniques Research Paper',
    description: 'Comprehensive analysis of modern ML algorithms and applications',
    url: 'https://example.com/paper1.pdf',
    type: 'pdf' as const,
    visibility: 'public' as const,
    uploadDate: '2 days ago',
    uploader: {
      name: 'Rahul Sharma',
    }
  },
  {
    id: '2',
    title: 'Quantum Computing Fundamentals',
    description: 'An introduction to quantum computing principles and algorithms',
    url: 'https://example.com/paper2.pdf',
    type: 'pdf' as const,
    visibility: 'public' as const,
    uploadDate: '1 week ago',
    uploader: {
      name: 'Priya Singh',
    }
  },
  {
    id: '3',
    title: 'Sustainable Energy Research Data',
    url: 'https://example.com/paper3.pdf',
    type: 'pdf' as const,
    visibility: 'public' as const,
    uploadDate: '2 weeks ago',
    uploader: {
      name: 'Amit Kumar',
    }
  },
  {
    id: '4',
    title: 'Neural Network Architecture Diagram',
    description: 'Visual representation of deep learning neural network architecture',
    url: 'https://example.com/image1.png',
    type: 'image' as const,
    visibility: 'private' as const,
    uploadDate: '3 days ago',
    uploader: {
      name: 'Anjali Patel',
    }
  },
  {
    id: '5',
    title: 'Research Methodology Handbook',
    description: 'Comprehensive guide to academic research methodologies',
    url: 'https://example.com/handbook.pdf',
    type: 'pdf' as const,
    visibility: 'public' as const,
    uploadDate: '1 month ago',
    uploader: {
      name: 'Sanjay Mehta',
    }
  },
  {
    id: '6',
    title: 'Statistical Analysis Results',
    url: 'https://example.com/stats.pdf',
    type: 'pdf' as const,
    visibility: 'private' as const,
    uploadDate: '5 days ago',
    uploader: {
      name: 'Deepa Gupta',
    }
  },
];

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [fileView, setFileView] = useState<'grid' | 'list'>('grid');
  const [fileFilter, setFileFilter] = useState('all');

  const filteredFiles = mockFiles.filter(file => {
    // Filter by search query
    if (searchQuery && !file.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by type
    if (fileFilter !== 'all' && file.type !== fileFilter) {
      return false;
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
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <FileUploader />
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-4">
              <TabsList>
                <TabsTrigger value="all">All Resources</TabsTrigger>
                <TabsTrigger value="my">My Uploads</TabsTrigger>
                <TabsTrigger value="shared">Shared With Me</TabsTrigger>
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
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="all" className="mt-0">
              {filteredFiles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFiles.map((file) => (
                    <FilePreview key={file.id} file={file} />
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
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">Your Uploads</h3>
                <p className="text-muted-foreground mt-1">Resources you've shared with the academic community</p>
                <Button variant="outline" className="mt-4">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Resource
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="shared" className="mt-0">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">Shared With You</h3>
                <p className="text-muted-foreground mt-1">Resources that others have shared with you</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Resources;
