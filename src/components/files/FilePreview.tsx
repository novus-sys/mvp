
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye, EyeOff, FileText, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface FilePreviewProps {
  file: {
    id: string;
    title: string;
    description?: string;
    url: string;
    type: 'pdf' | 'image';
    visibility: 'public' | 'private';
    uploadDate: string;
    uploader: {
      name: string;
      avatar?: string;
    };
  };
}

const FilePreview: React.FC<FilePreviewProps> = ({ file }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, we would generate preview thumbnails
    // For this demo, we'll just use the file URL directly for images
    if (file.type === 'image') {
      setPreviewUrl(file.url);
    }
    // For PDFs, in a real app we would use PDF.js to render the first page
  }, [file]);

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
            variant={file.visibility === 'public' ? 'default' : 'outline'}
            className={cn(
              file.visibility === 'public' 
                ? 'bg-brand-blue hover:bg-brand-blue/80' 
                : 'border-brand-orange text-brand-orange'
            )}
          >
            {file.visibility === 'public' ? (
              <Eye className="h-3 w-3 mr-1" />
            ) : (
              <EyeOff className="h-3 w-3 mr-1" />
            )}
            {file.visibility}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-48 flex items-center justify-center bg-muted/30">
          {file.type === 'image' && previewUrl ? (
            <img 
              src={previewUrl} 
              alt={file.title} 
              className="h-full w-full object-cover" 
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <FileText className="h-12 w-12 text-brand-orange" />
              <p className="mt-2 text-sm font-medium">PDF Document</p>
              <p className="text-xs text-muted-foreground">Click to view</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-card flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span>Uploaded {file.uploadDate}</span>
          <span>•</span>
          <span>By {file.uploader.name}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default FilePreview;
