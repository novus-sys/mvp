
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const FileUploader = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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

    // Mock file upload
    setTimeout(() => {
      toast({
        title: "Upload successful",
        description: `${files.length} file(s) uploaded successfully.`,
      });
      setFiles([]);
      setTitle('');
      setDescription('');
      setIsUploading(false);
    }, 2000);
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

          <div className="space-y-2">
            <Label>Visibility</Label>
            <RadioGroup 
              defaultValue="public"
              value={visibility}
              onValueChange={(value) => setVisibility(value as 'public' | 'private')}
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
                : "Private resources can only be accessed by you."}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button disabled={isUploading} type="submit">
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default FileUploader;
