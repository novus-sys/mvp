
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

type AuthMode = 'login' | 'register';

const AuthForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, isLoading, isConfigured } = useSupabaseAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    institution: '',
    role: 'student', // student or educator
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get the redirect path from location state or default to home
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
      
      if (authMode === 'login') {
        await signIn(formData.email, formData.password);
        navigate(from);
      } else {
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          toast({
            variant: "destructive",
            title: "Passwords don't match",
            description: "Please make sure your passwords match.",
          });
          return;
        }
        
        // Register the user
        await signUp(formData.email, formData.password, {
          name: formData.name,
          role: formData.role as 'student' | 'researcher' | 'educator' | 'admin',
          institution: formData.institution,
        });
        
        // After signup, we don't automatically navigate because Supabase sends a confirmation email
        toast({
          title: "Registration successful!",
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (error) {
      // Error handling is done in the auth context
      console.error('Authentication error:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background px-4">
      {!isConfigured && (
        <Alert variant="destructive" className="absolute top-4 left-4 right-4 max-w-xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Supabase Not Configured</AlertTitle>
          <AlertDescription>
            <p>Supabase credentials are missing. To fix this:</p>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Create a <code>.env</code> file in the project root</li>
              <li>Add your Supabase URL: <code>VITE_SUPABASE_URL=your_supabase_url</code></li>
              <li>Add your Supabase anon key: <code>VITE_SUPABASE_ANON_KEY=your_anon_key</code></li>
              <li>Restart the development server</li>
            </ol>
          </AlertDescription>
        </Alert>
      )}
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-md bg-gradient-to-br from-brand-orange to-brand-purple flex items-center justify-center">
              <span className="text-white font-bold text-xl">AN</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-center gradient-text">ThinkBridge</CardTitle>
          <CardDescription className="text-center">
            Share knowledge and collaborate with India's academic community
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="login" className="w-full" onValueChange={(value) => setAuthMode(value as AuthMode)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-xs text-brand-blue hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-gradient-to-r from-brand-orange to-brand-purple hover:opacity-90" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="register">
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  <Input
                    id="institution"
                    name="institution"
                    placeholder="Your university or institution"
                    value={formData.institution}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-gradient-to-r from-brand-orange to-brand-purple hover:opacity-90" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default AuthForm;
