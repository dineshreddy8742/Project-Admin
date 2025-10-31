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
import { useLanguage, languages } from '../contexts/language-utils';
import { useAuth } from '../contexts/ArtomartAuthContext';
import { Eye, EyeOff, Leaf, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  district: z.string().min(2, 'District must be at least 2 characters'),
  language: z.string().min(1, 'Please select a language'),
  plan: z.string().min(1, 'Please select a plan'),
  role: z.string().min(1, 'Please select a role'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

const plans = [
  {
    id: 'free',
    name: 'Free Plan',
    emoji: '🌱',
    price: 'Free',
    features: [
      'Voice Assistant & Dashboard',
      'Disease Detector AI',
      'Weather Updates',
      'Government Schemes Access',
      'Market Trends Data',
      'Grocery Marketplace',
      'Cold Storage Access'
    ],
    excludedFeatures: [
      'Crop Monitor (Premium sensors required)'
    ],
    description: 'Access essential features for smart farming. Crop monitoring requires premium sensors.'
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    emoji: '🌾',
    price: '₹10,000',
    features: [
      'All Free Plan Features',
      'Soil Moisture Sensor',
      'Temperature Sensor',
      'Installation Support',
      'AI Camera Unit',
      'NPK Sensor',
      'Advanced Crop Monitoring',
      'Dedicated Support'
    ],
    description: 'Unlock all features for comprehensive and professional farm management, including all sensors.'
  }
];

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState('profile');
  const { translateSync } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, signInWithGoogle } = useAuth();
  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      state: '',
      district: '',
      language: 'en',
      plan: '',
    },
  });

  const onSubmit = async (data: SignupForm) => {
    try {
      const { data: authData, error } = await signUp(data.email, data.password, {
        name: data.name,
        phone: data.phone,
        state: data.state,
        district: data.district,
        language: data.language,
        plan: data.plan,
        role: data.role,
      });

      if (error) {
        toast({
          title: translateSync("Sign Up Failed"),
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: translateSync("Account Created Successfully"),
        description: translateSync("Welcome to AgriTech! You can now sign in."),
      });

      // Navigate based on user role
      const userRole = data.role || 'farmer';
      if (userRole === 'admin') {
        // For admin, navigate to admin dashboard (role selection happens on first login)
        navigate('/admin/dashboard');
      } else if (userRole === 'artifact_seller') {
        navigate('/artisan/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: translateSync("Sign Up Failed"),
        description: translateSync("An unexpected error occurred"),
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: translateSync("Google Sign-Up Failed"),
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: translateSync("Google Sign-Up Failed"),
        description: translateSync("An unexpected error occurred"),
        variant: "destructive",
      });
    }
  };

  const nextStep = () => {
    if (step === 'profile') {
      // Validate profile fields
      form.trigger(['name', 'email', 'password', 'confirmPassword', 'phone', 'state', 'district', 'language']).then((isValid) => {
        if (isValid) setStep('plan');
      });
    }
  };

  const selectedPlan = plans.find(p => p.id === form.watch('plan'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-farm-primary/5 via-background to-farm-accent/5 flex items-center justify-center p-4 relative overflow-hidden">
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
        <div className="absolute bottom-1/3 left-3/4 w-4 h-4 text-farm-sun opacity-40 animate-ping">⭐</div>
      </div>
      
      <Card className="w-full max-w-4xl shadow-2xl border-0 bg-card/80 backdrop-blur-sm animate-fade-in hover:shadow-3xl transition-all duration-300">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-farm-primary to-farm-accent rounded-full flex items-center justify-center animate-pulse shadow-lg">
            <Leaf className="w-8 h-8 text-white animate-wiggle" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-farm-primary via-farm-accent to-farm-primary bg-clip-text text-transparent animate-gradient-text">
            🌟 {translateSync("Join AgriTech")} 🌟
          </CardTitle>
          <CardDescription className="text-muted-foreground animate-fade-in-up">
            🚀 {translateSync("Create your account and choose your farming plan")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs value={step} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step === 'profile' ? 'bg-farm-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  1
                </div>
                {translateSync("Profile")}
              </TabsTrigger>
              <TabsTrigger value="plan" className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step === 'plan' ? 'bg-farm-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  2
                </div>
                {translateSync("Plan")}
              </TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                <TabsContent value="profile" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translateSync("Full Name")}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={translateSync("Enter your full name")}
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translateSync("Email")}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={translateSync("Enter your email")}
                              type="email"
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
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translateSync("Phone Number")}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={translateSync("Enter your phone number")}
                              type="tel"
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
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translateSync("State")}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={translateSync("Enter your state")}
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
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translateSync("District")}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={translateSync("Enter your district")}
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
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translateSync("Preferred Language")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder={translateSync("Select language")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {languages.map((lang) => (
                                <SelectItem key={lang.code} value={lang.code}>
                                  <div className="flex items-center gap-2">
                                    <span>{lang.flag}</span>
                                    <span>{lang.nativeName}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translateSync("User Role")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder={translateSync("Select your role")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="farmer">
                                <div className="flex items-center gap-2">
                                  <span>🚜</span>
                                  <span>{translateSync("Farmer")}</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="artifact_seller">
                                <div className="flex items-center gap-2">
                                  <span>🏺</span>
                                  <span>{translateSync("Artifact Seller")}</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="crop_advisor">
                                <div className="flex items-center gap-2">
                                  <span>🧑‍🌾</span>
                                  <span>{translateSync("Crop Advisor")}</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-2">
                                  <span>👨‍💼</span>
                                  <span>{translateSync("Administrator")}</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translateSync("Password")}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder={translateSync("Create a password")}
                                type={showPassword ? "text" : "password"}
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
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translateSync("Confirm Password")}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder={translateSync("Confirm your password")}
                                type={showConfirmPassword ? "text" : "password"}
                                className="h-12 pr-12"
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" onClick={nextStep} className="bg-gradient-to-r from-secondary to-primary hover:from-secondary/90 hover:to-primary/90 text-primary-foreground">
                      {translateSync("Next")} <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="plan" className="space-y-6">
                  <FormField
                    control={form.control}
                    name="plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg">{translateSync("Choose Your Plan")}</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {plans.map((plan) => (
                              <Card 
                                key={plan.id}
                                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                                  field.value === plan.id 
                                    ? 'ring-2 ring-farm-primary shadow-lg bg-farm-primary/5' 
                                    : 'hover:shadow-lg'
                                }`}
                                onClick={() => field.onChange(plan.id)}
                              >
                                <CardHeader className="text-center">
                                  <div className="text-4xl mb-2">{plan.emoji}</div>
                                  <CardTitle className="text-lg">{translateSync(plan.name)}</CardTitle>
                                  <div className="text-2xl font-bold text-farm-primary">{plan.price}</div>
                                  <CardDescription className="text-sm">
                                    {translateSync(plan.description)}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <ul className="space-y-2">
                                    {plan.features.map((feature, index) => (
                                      <li key={index} className="flex items-center gap-2 text-sm">
                                        <Check className="w-4 h-4 text-farm-accent" />
                                        {translateSync(feature)}
                                      </li>
                                    ))}
                                  </ul>
                                  {plan.excludedFeatures && plan.excludedFeatures.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-border">
                                      <p className="text-xs text-muted-foreground mb-2">
                                        {translateSync("Not included:")}
                                      </p>
                                      <ul className="space-y-1">
                                        {plan.excludedFeatures.map((feature, index) => (
                                          <li key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <div className="w-3 h-3 rounded-full border border-muted-foreground/30" />
                                            {translateSync(feature)}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {field.value === plan.id && (
                                    <div className="mt-4 text-center">
                                      <div className="inline-flex items-center gap-2 bg-farm-primary text-white px-3 py-1 rounded-full text-sm">
                                        <Check className="w-4 h-4" />
                                        {translateSync("Selected")}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep('profile')}>
                      <ChevronLeft className="w-4 h-4 mr-2" /> {translateSync("Back")}
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-secondary-foreground"
                      disabled={form.formState.isSubmitting || !selectedPlan}
                    >
                      {form.formState.isSubmitting 
                        ? translateSync("Creating Account...") 
                        : translateSync("Create Account")
                      }
                    </Button>
                  </div>
                </TabsContent>
              </form>
            </Form>
          </Tabs>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {translateSync("Or continue with")}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12"
            onClick={handleGoogleSignUp}
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
            {translateSync("Sign up with Google")}
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {translateSync("Already have an account?")}{" "}
              <Link
                to="/login"
                className="font-medium text-farm-primary hover:text-farm-accent transition-colors"
              >
                {translateSync("Sign in")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;