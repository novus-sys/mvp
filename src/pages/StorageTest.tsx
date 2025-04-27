import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';

const StorageTest = () => {
  const { user } = useSupabaseAuth();
  const [results, setResults] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const runTests = async () => {
    if (!user) {
      setResults('Please log in to run tests');
      return;
    }

    setIsLoading(true);
    setResults('Running storage tests...\n');

    try {
      // Test 1: List all buckets
      setResults(prev => prev + '\nTest 1: Listing all storage buckets...');
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        setResults(prev => prev + `\nError listing buckets: ${bucketsError.message}`);
      } else {
        setResults(prev => prev + `\nFound ${buckets.length} buckets:`);
        buckets.forEach(bucket => {
          setResults(prev => prev + `\n- ${bucket.name} (id: ${bucket.id})`);
        });
      }
      
      // Test 2: Check for mentor_profiles bucket
      setResults(prev => prev + '\n\nTest 2: Checking for mentor_profiles bucket...');
      const mentorBucket = buckets?.find(b => b.name === 'mentor_profiles');
      
      if (mentorBucket) {
        setResults(prev => prev + `\nFound mentor_profiles bucket with id: ${mentorBucket.id}`);
      } else {
        setResults(prev => prev + '\nmentor_profiles bucket NOT found');
        
        // Check for similar bucket names (case sensitivity)
        const similarBuckets = buckets?.filter(b => 
          b.name.toLowerCase().includes('mentor') || 
          b.name.toLowerCase().includes('profile')
        );
        
        if (similarBuckets && similarBuckets.length > 0) {
          setResults(prev => prev + '\nFound similar buckets that might be the one you created:');
          similarBuckets.forEach(bucket => {
            setResults(prev => prev + `\n- ${bucket.name}`);
          });
        }
      }
      
      // Test 3: Try to create a test file in the bucket
      if (mentorBucket) {
        setResults(prev => prev + '\n\nTest 3: Trying to create a test file in mentor_profiles bucket...');
        
        const testData = JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          userId: user.id
        });
        
        const testFileName = `test_${user.id}.json`;
        
        const { error: uploadError } = await supabase.storage
          .from('mentor_profiles')
          .upload(testFileName, testData, {
            contentType: 'application/json',
            upsert: true
          });
        
        if (uploadError) {
          setResults(prev => prev + `\nError uploading test file: ${uploadError.message}`);
          
          // Check bucket policies
          setResults(prev => prev + '\n\nChecking bucket policies...');
          try {
            const { data: policies, error: policiesError } = await supabase
              .from('storage')
              .select('*')
              .eq('name', 'mentor_profiles');
            
            if (policiesError) {
              setResults(prev => prev + `\nError checking policies: ${policiesError.message}`);
            } else if (policies && policies.length > 0) {
              setResults(prev => prev + `\nFound policies: ${JSON.stringify(policies, null, 2)}`);
            } else {
              setResults(prev => prev + '\nNo policies found for this bucket');
            }
          } catch (error: any) {
            setResults(prev => prev + `\nError checking policies: ${error.message}`);
          }
        } else {
          setResults(prev => prev + '\nSuccessfully uploaded test file!');
          
          // Try to list files
          const { data: files, error: listError } = await supabase.storage
            .from('mentor_profiles')
            .list();
          
          if (listError) {
            setResults(prev => prev + `\nError listing files: ${listError.message}`);
          } else {
            setResults(prev => prev + `\nFiles in bucket: ${JSON.stringify(files, null, 2)}`);
          }
        }
      }
      
    } catch (error: any) {
      setResults(prev => prev + `\n\nUnexpected error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Storage Bucket Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button 
                onClick={runTests} 
                disabled={isLoading || !user}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  'Run Storage Tests'
                )}
              </Button>
            </div>
            
            <div className="bg-muted p-4 rounded-md">
              <pre className="whitespace-pre-wrap text-sm">
                {results || 'Click "Run Storage Tests" to start testing the storage buckets.'}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default StorageTest;
