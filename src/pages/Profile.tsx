import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/Layout';
import { useLanguage } from '@/contexts/language-utils';
import { languages } from '@/contexts/language-utils';
import { User, Mail, Phone, Globe, Package, LogOut, Edit, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import eventBus from '@/lib/eventBus';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  district: z.string().min(2, 'District must be at least 2 characters'),
  language: z.string().min(1, 'Please select a language'),
});

type ProfileForm = z.infer<typeof profileSchema>;

const plans = {
  basic: { name: 'Basic Package', emoji: '🌱', price: '₹1,999' },
  smart: { name: 'Smart AI Package', emoji: '🌿', price: '₹4,400' },
  premium: { name: 'Premium Agriculture Kit', emoji: '🌾', price: '₹10,000' }
};

const Profile = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { t: languageT, setLanguage, currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      state: '',
      district: '',
      language: 'en',
    },
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('agritech_current_user') || 'null');
    if (!user) {
      navigate('/login');
      return;
    }
    
    setCurrentUser(user);
    form.reset({
      name: user.name,
      email: user.email,
      phone: user.phone,
      state: user.state,
      district: user.district,
      language: user.language,
    });
  }, [navigate, form]);

  useEffect(() => {
    const handleFillField = ({ field, value }: { field: string, value: string }) => {
        if (field === 'name') {
            form.setValue('name', value);
        } else if (field === 'email') {
            form.setValue('email', value);
        } else if (field === 'phone') {
            form.setValue('phone', value);
        } else if (field === 'state') {
            form.setValue('state', value);
        } else if (field === 'district') {
            form.setValue('district', value);
        } else if (field === 'language') {
            form.setValue('language', value);
        }
        setIsEditing(true); // Automatically switch to edit mode when a field is filled by the agent
    };

    eventBus.on('fill-profile-field', handleFillField);

    return () => {
        eventBus.remove('fill-profile-field', handleFillField);
    };
  }, [form]);

  const onSubmit = (data: ProfileForm) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...data };
    
    // Update in users array
    const users = JSON.parse(localStorage.getItem('agritech_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('agritech_users', JSON.stringify(users));
    }
    
    // Update current user
    localStorage.setItem('agritech_current_user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    
    // Update language context if changed
    if (data.language !== currentLanguage.code) {
      const selectedLanguage = languages.find(lang => lang.code === data.language);
      if (selectedLanguage) {
        setLanguage(selectedLanguage);
      }
    }
    
    setIsEditing(false);
    toast({
      title: languageT("Profile Updated"),
      description: languageT("Your profile has been successfully updated."),
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('agritech_current_user');
    toast({
      title: languageT("Logged Out"),
      description: languageT("You have been successfully logged out."),
    });
    navigate('/login');
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const userPlan = plans[currentUser.plan as keyof typeof plans];

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-farm-primary to-farm-accent bg-clip-text text-transparent">
              {languageT("Profile")}
            </h1>
            <p className="text-muted-foreground mt-2">
              {languageT("Manage your account settings and preferences")}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            {languageT("Logout")}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {languageT("Personal Information")}
                  </CardTitle>
                  <CardDescription>
                    {languageT("Update your personal details and preferences")}
                  </CardDescription>
                </div>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (isEditing) {
                      form.handleSubmit(onSubmit)();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4" />
                      {languageT("Save")}
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4" />
                      {languageT("Edit")}
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{languageT("Full Name")}</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing}
                                className="h-12"
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
                            <FormLabel>{languageT("Email")}</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing}
                                type="email"
                                className="h-12"
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
                            <FormLabel>{languageT("Phone Number")}</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing}
                                type="tel"
                                className="h-12"
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
                            <FormLabel>{languageT("State")}</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing}
                                className="h-12"
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
                            <FormLabel>{languageT("District")}</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                disabled={!isEditing}
                                className="h-12"
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
                            <FormLabel>{languageT("Preferred Language")}</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              disabled={!isEditing}
                            >
                              <FormControl>
                                <SelectTrigger className="h-12">
                                  <SelectValue />
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
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Subscription & Quick Info */}
          <div className="space-y-6">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {languageT("Current Plan")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl">{userPlan.emoji}</div>
                  <div>
                    <h3 className="font-semibold text-lg">{languageT(userPlan.name)}</h3>
                    <div className="text-2xl font-bold text-farm-primary mt-2">{userPlan.price}</div>
                  </div>
                  <Badge variant="secondary" className="bg-farm-primary/10 text-farm-primary">
                    {languageT("Active")}
                  </Badge>
                  <Button variant="outline" className="w-full">
                    {languageT("Upgrade Plan")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Summary */}
            <Card>
              <CardHeader>
                <CardTitle>{languageT("Account Summary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{languageT("Role")}</span>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {currentUser.role === 'farmer' ? '🚜 Farmer' : 
                     currentUser.role === 'artifact_seller' ? '🏺 Artifact Seller' :
                     currentUser.role === 'administrator' ? '👨‍💼 Administrator' : 'User'}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{languageT("Member Since")}</span>
                  <span>{new Date(currentUser.createdAt).toLocaleDateString()}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{languageT("Account Status")}</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {languageT("Active")}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{languageT("Language")}</span>
                  <span className="flex items-center gap-1">
                    {languages.find(l => l.code === currentUser.language)?.flag}
                    {languages.find(l => l.code === currentUser.language)?.nativeName}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;