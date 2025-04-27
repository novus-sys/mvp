import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';
import { registerAsMentor, checkMentorStatus } from '@/lib/mentorship-service';

const MentorTest = () => {
  const { user } = useSupabaseAuth();
  const [results, setResults] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const runTests = async () => {
    if (!user) {
      setResults('Please log in to run tests');
      return;
    }

    setIsLoading(true);
    setResults('Running tests...\n');

    try {
      // Test 1: Check profiles table structure
      setResults(prev => prev + '\nTest 1: Checking profiles table structure...');
      const { data: tableInfo, error: tableError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      if (tableError) {
        setResults(prev => prev + `\nError querying profiles table: ${tableError.message}`);
      } else {
        setResults(prev => prev + `\nProfiles table exists. Sample data: ${JSON.stringify(tableInfo, null, 2)}`);
      }

      // Test 2: Create storage bucket for mentor profiles if it doesn't exist
      setResults(prev => prev + '\n\nTest 2: Creating storage bucket for mentor profiles...');
      
      // Check if bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        setResults(prev => prev + `\nError listing buckets: ${bucketsError.message}`);
      } else {
        const mentorBucketExists = buckets.some(bucket => bucket.name === 'mentor_profiles');
        
        if (mentorBucketExists) {
          setResults(prev => prev + '\nmentor_profiles bucket already exists');
        } else {
          // Create the bucket
          const { data: newBucket, error: createError } = await supabase.storage.createBucket('mentor_profiles', {
            public: false
          });
          
          if (createError) {
            setResults(prev => prev + `\nError creating bucket: ${createError.message}`);
          } else {
            setResults(prev => prev + '\nmentor_profiles bucket created successfully');
          }
        }
      }
      
      // Test 3: Try to create mentor_data table
      setResults(prev => prev + '\n\nTest 3: Trying to create mentor_data table...');
      
      // We'll try to create the table, but this might fail without proper permissions
      try {
        const { error: createTableError } = await supabase.rpc('execute_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS mentor_data (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
              data JSONB NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE(user_id)
            );
          `
        });
        
        if (createTableError) {
          setResults(prev => prev + `\nError creating table via RPC: ${createTableError.message}`);
          setResults(prev => prev + '\nWill fall back to using storage for mentor data');
        } else {
          setResults(prev => prev + '\nmentor_data table created successfully');
        }
      } catch (error: any) {
        setResults(prev => prev + `\nError creating table: ${error.message}`);
        setResults(prev => prev + '\nWill fall back to using storage for mentor data');
      }
      
      // Test 4: Register as mentor using our new service
      setResults(prev => prev + '\n\nTest 4: Registering as mentor using new service...');
      
      const registerSuccess = await registerAsMentor(user, {
        specialization: ['Test Specialization', 'Academic Research'],
        availability: 'Weekly, 2-hour sessions'
      });
      
      if (registerSuccess) {
        setResults(prev => prev + '\nSuccessfully registered as mentor using new service!');
      } else {
        setResults(prev => prev + '\nFailed to register as mentor using new service');
      }
      
      // Test 5: Check mentor status
      setResults(prev => prev + '\n\nTest 5: Checking mentor status...');
      
      const isMentor = await checkMentorStatus(user.id);
      
      setResults(prev => prev + `\nMentor status check result: ${isMentor ? 'You are a mentor' : 'You are not a mentor'}`);
      
      // Test 6: Verify storage
      setResults(prev => prev + '\n\nTest 6: Verifying storage...');
      
      const { data: files, error: listError } = await supabase.storage
        .from('mentor_profiles')
        .list();
      
      if (listError) {
        setResults(prev => prev + `\nError listing files: ${listError.message}`);
      } else {
        setResults(prev => prev + `\nFiles in mentor_profiles bucket: ${JSON.stringify(files, null, 2)}`);
        
        // Try to download the file
        const fileName = `${user.id}.json`;
        const fileExists = files.some(file => file.name === fileName);
        
        if (fileExists) {
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('mentor_profiles')
            .download(fileName);
          
          if (downloadError) {
            setResults(prev => prev + `\nError downloading file: ${downloadError.message}`);
          } else {
            const text = await fileData.text();
            setResults(prev => prev + `\nFile contents: ${text}`);
          }
        } else {
          setResults(prev => prev + `\nFile ${fileName} not found in bucket`);
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
            <CardTitle>Mentor System Test</CardTitle>
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
                  'Run Tests'
                )}
              </Button>
            </div>
            
            <div className="bg-muted p-4 rounded-md">
              <pre className="whitespace-pre-wrap text-sm">
                {results || 'Click "Run Tests" to start testing the mentor system.'}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default MentorTest;
