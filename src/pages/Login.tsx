import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useLanguage } from '../contexts/language-utils';
import { useAuth } from '../contexts/ArtomartAuthContext.jsx';
import { Eye, EyeOff, Leaf } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import LanguageSelector from '../components/LanguageSelector';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().min(1, 'Role is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [showAdminRoleSelection, setShowAdminRoleSelection] = useState(false);

  // Load selected role from localStorage on mount (for Google OAuth redirect)
  React.useEffect(() => {
    const storedRole = localStorage.getItem('selectedRole');
    if (storedRole) {
      setSelectedRole(storedRole);
      localStorage.removeItem('selectedRole'); // Clean up after use
    }
  }, []);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signInWithGoogle, userProfile, profileLoading, updateProfile } = useAuth();
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      // Store selected role for redirect
      if (data.role) {
        localStorage.setItem('selectedRole', data.role);
      }

      const { error } = await signIn(data.email, data.password);
      if (error) {
        localStorage.removeItem('selectedRole'); // Clean up if sign-in fails
        toast({
          title: t("Login Failed"),
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: t("Login Successful"),
        description: t("Welcome back to AgriTech!"),
      });

    } catch (error) {
      localStorage.removeItem('selectedRole'); // Clean up on error
      toast({
        title: t("Login Failed"),
        description: t("An unexpected error occurred"),
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    if (userProfile && !profileLoading) {
      // Use selectedRole for navigation after login, fallback to userProfile.role
      const userRole = selectedRole || userProfile.role || 'farmer';
      if (userRole === 'admin' || userRole === 'administrator') {
        // For admin, show role selection modal before navigating
        setShowAdminRoleSelection(true);
      } else if (userRole === 'artifact_seller') {
        navigate('/artisans/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [userProfile, profileLoading, navigate, selectedRole]);

  const handleGoogleSignIn = async () => {
    if (!selectedRole) {
      toast({
        title: t("Role Required"),
        description: t("Please select your role before signing in with Google"),
        variant: "destructive",
      });
      return;
    }

    // Store selected role for Google OAuth redirect
    localStorage.setItem('selectedRole', selectedRole);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        localStorage.removeItem('selectedRole');
        toast({
          title: t("Google Sign-In Failed"),
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      localStorage.removeItem('selectedRole');
      toast({
        title: t("Google Sign-In Failed"),
        description: t("An unexpected error occurred"),
        variant: "destructive",
      });
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-farm-primary/5 via-background to-farm-accent/5 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSelector />
      </div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Enhanced floating animations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-8 h-8 text-farm-leaf opacity-30 animate-float-leaf-1 animate-pulse">🌿</div>
        <div className="absolute top-32 right-20 w-6 h-6 text-farm-accent opacity-40 animate-float-leaf-2 animate-bounce">🌾</div>
        <div className="absolute bottom-32 left-1/4 w-7 h-7 text-farm-leaf opacity-25 animate-float-leaf-3">🍃</div>
        <div className="absolute bottom-20 right-1/3 w-5 h-5 text-farm-accent opacity-35 animate-float-leaf-4 animate-pulse">🌿</div>
        <div className="absolute top-1/2 left-20 w-6 h-6 text-farm-leaf opacity-20 animate-float-leaf-5">🌾</div>
        <div className="absolute top-1/3 right-10 w-8 h-8 text-farm-accent opacity-30 animate-float-leaf-1">🍃</div>
        
        {/* Additional animated elements */}
        <div className="absolute top-1/4 left-1/3 w-4 h-4 text-farm-sun opacity-60 animate-spin-slow">☀️</div>
        <div className="absolute bottom-1/4 right-1/4 w-5 h-5 text-farm-leaf opacity-45 animate-wiggle">🌱</div>
        <div className="absolute top-3/4 left-16 w-6 h-6 text-farm-accent opacity-35 animate-float">🌾</div>
        <div className="absolute top-16 left-1/2 w-3 h-3 text-farm-leaf opacity-50 animate-bounce">🌿</div>
      </div>
      
      <Card className="w-full max-w-md shadow-2xl border-0 bg-card/80 backdrop-blur-sm animate-fade-in hover:shadow-3xl transition-all duration-300">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-farm-primary to-farm-accent rounded-full flex items-center justify-center animate-pulse shadow-lg">
            <Leaf className="w-8 h-8 text-white animate-wiggle" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-farm-primary via-farm-accent to-farm-primary bg-clip-text text-white animate-gradient-text">
            🌟 {t("Welcome Back")} 🌟
          </CardTitle>
          <CardDescription className="text-muted-foreground animate-fade-in-up">
            🚀 {t("Sign in to your AgriTech account")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="email">{t("Email")}</FormLabel>
                    <FormControl>
                      <Input 
                        id="email"
                        placeholder={t("Enter your email")}
                        type="email"
                        autoComplete="email"
                        className="h-12"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="password">{t("Password")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          id="password"
                          placeholder={t("Enter your password")}
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          className="h-12 pr-12"
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="role">{t("Login as")}</FormLabel>
                    <Select onValueChange={(value) => { field.onChange(value); setSelectedRole(value); }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger id="role" className="h-12">
                          <SelectValue placeholder={t("Select your role")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="farmer">{t("Farmer")}</SelectItem>
                        <SelectItem value="artifact_seller">{t("Artisan")}</SelectItem>
                        <SelectItem value="admin">{t("Administrator")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-farm-primary to-farm-accent hover:from-farm-primary/90 hover:to-farm-accent/90 transition-all duration-300"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? t("Signing in...") : t("Sign In")}
              </Button>
            </form>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t("Or continue with")}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12"
            onClick={handleGoogleSignIn}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {t("Sign in with Google")}
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t("Don't have an account?")}{" "}
              <Link
                to="/signup"
                className="font-medium text-farm-primary hover:text-farm-accent transition-colors"
              >
                {t("Sign up")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Admin Role Selection Modal */}
      {showAdminRoleSelection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-card/80 backdrop-blur-sm animate-fade-in">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-farm-primary to-farm-accent rounded-full flex items-center justify-center">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-farm-primary to-farm-accent bg-clip-text text-transparent">
                {t("Admin Dashboard Access")}
              </CardTitle>
              <CardDescription className="text-base">
                {t("Administrator, choose which dashboard to access")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pb-6">
              <div className="space-y-4">
                <Button
                  onClick={() => {
                    navigate('/admin/dashboard');
                    setShowAdminRoleSelection(false);
                  }}
                  className="w-full h-14 bg-gradient-to-r from-farm-primary to-farm-accent hover:from-farm-primary/90 hover:to-farm-accent/90 transition-all duration-300 text-lg flex items-center justify-center gap-2"
                >
                  <Shield className="h-5 w-5" />
                  {t("Admin Dashboard")}
                </Button>
                <Button
                  onClick={() => {
                    navigate('/artisans/dashboard');
                    setShowAdminRoleSelection(false);
                  }}
                  variant="outline"
                  className="w-full h-14 hover:bg-farm-primary/10 transition-all duration-300 text-lg flex items-center justify-center gap-2"
                >
                  <Package className="h-5 w-5" />
                  {t("Artisan Dashboard")}
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {t("Choose the dashboard that matches your current role")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
export default Login;