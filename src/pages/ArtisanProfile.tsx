import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/language-utils';
import { useToast } from '@/components/ui/use-toast';
import { User, MapPin, Star, Package, Award, Calendar, IndianRupee, Mail, Phone, Globe, Camera } from 'lucide-react';

const ArtisanProfile = () => {
  const { t: languageT } = useLanguage();
  const { toast } = useToast();
  const [artisanData, setArtisanData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Mock artisan data
  const mockArtisanData = {
    id: 'artisan-001',
    name: 'Smt. Meenakshi Devi',
    profileImage: '/placeholder-avatar.jpg',
    coverImage: '/placeholder-cover.jpg',
    region: 'Tamil Nadu',
    craftSpecialty: 'Kanchipuram Silk Weaving',
    yearsOfExperience: 25,
    about: 'Master artisan specializing in traditional Kanchipuram silk weaving. Third generation in family business, preserving ancient techniques and patterns.',
    bio: 'Smt. Meenakshi Devi comes from a family of traditional weavers in Kanchipuram, Tamil Nadu. She has been weaving silk sarees for over 25 years, mastering the intricate techniques passed down through generations. Her expertise includes traditional zari work and complex weaving patterns unique to the Kanchipuram region.',
    education: [
      { year: '1998', description: 'Apprenticed under grandmother, traditional Kanchipuram weaver' },
      { year: '2001', description: 'Advanced training in traditional weaving techniques' },
      { year: '2010', description: 'Certified by Tamil Nadu Handloom Development Corporation' }
    ],
    achievements: [
      { year: '2018', title: 'National Award for Traditional Handicrafts', description: 'Recognized for preserving traditional weaving techniques' },
      { year: '2020', title: 'State Award for Excellence', description: 'Awarded by Tamil Nadu Government for craftsmanship' },
      { year: '2022', title: 'UNESCO Recognition', description: 'Featured in UNESCO\'s list of master craftspeople' }
    ],
    contact: {
      email: 'meenakshi.weaver@example.com',
      phone: '+91 98765 43210',
      address: 'Kanchipuram, Tamil Nadu, India'
    },
    products: [
      { id: 1, name: 'Kanchipuram Silk Saree - Royal Blue', price: 12000, rating: 4.8, sales: 45 },
      { id: 2, name: 'Kanchipuram Silk Saree - Emerald Green', price: 11500, rating: 4.7, sales: 38 },
      { id: 3, name: 'Kanchipuram Silk Dupatta', price: 4500, rating: 4.6, sales: 67 }
    ],
    socialMedia: {
      website: 'https://meenakshi-weaver.com',
      instagram: '@meenakshi_kanchipuram',
      facebook: 'Meenakshi Traditional Weaving'
    },
    ratings: {
      overall: 4.8,
      count: 124,
      breakdown: { 5: 85, 4: 30, 3: 5, 2: 3, 1: 1 }
    }
  };

  useEffect(() => {
    // Simulate loading artisan data
    setArtisanData(mockArtisanData);
  }, []);

  const handleEditProfile = () => {
    if (isEditing) {
      // Save changes
      toast({
        title: "Profile Updated",
        description: "Your artisan profile has been updated successfully."
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSendMessage = () => {
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the artisan."
    });
  };

  if (!artisanData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading artisan profile...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Cover Image */}
      <div className="relative h-64 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl overflow-hidden">
        <img 
          src={artisanData.coverImage} 
          alt="Cover" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-6 pt-24">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6">
              <div className="relative -mt-20">
                <img 
                  src={artisanData.profileImage} 
                  alt={artisanData.name}
                  className="w-32 h-32 rounded-full border-4 border-background object-cover"
                />
                <Button 
                  size="icon" 
                  className="absolute bottom-0 right-0 rounded-full"
                  variant="outline"
                >
                  <Camera className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1">
                <h1 className="text-hero text-primary font-indian">{artisanData.name}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{artisanData.region}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Award className="h-4 w-4 mr-1" />
                    <span>{artisanData.yearsOfExperience} years experience</span>
                  </div>
                  <Badge variant="outline">{artisanData.craftSpecialty}</Badge>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 fill-current text-amber-500" />
                    <span className="font-semibold ml-1">{artisanData.ratings.overall}</span>
                    <span className="text-muted-foreground ml-1">({artisanData.ratings.count} reviews)</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleSendMessage}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Message
                </Button>
                <Button 
                  variant="secondary" 
                  className="flex items-center gap-2"
                  onClick={handleEditProfile}
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="hover:shadow-glow transition-all bg-card">
                <CardHeader>
                  <CardTitle className="text-card-title text-primary font-indian">About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{artisanData.about}</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-glow transition-all bg-card">
                <CardHeader>
                  <CardTitle className="text-card-title text-primary font-indian">Biography</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{artisanData.bio}</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-glow transition-all bg-card">
                <CardHeader>
                  <CardTitle className="text-card-title text-primary font-indian">Education & Training</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {artisanData.education.map((edu: any, index: number) => (
                      <div key={index} className="flex">
                        <div className="mr-4">
                          <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center">
                            <Calendar className="h-5 w-5" />
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold">{edu.year}</div>
                          <div className="text-muted-foreground">{edu.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="hover:shadow-glow transition-all bg-card">
                <CardHeader>
                  <CardTitle className="text-card-title text-primary font-indian">Craft Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Primary:</span>
                      <span>{artisanData.craftSpecialty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Experience:</span>
                      <span>{artisanData.yearsOfExperience} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span>{artisanData.region}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-glow transition-all bg-card">
                <CardHeader>
                  <CardTitle className="text-card-title text-primary font-indian">Ratings & Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-primary">{artisanData.ratings.overall}</div>
                    <div className="flex justify-center items-center gap-1 my-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-5 w-5 ${i < Math.floor(artisanData.ratings.overall) ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'}`} 
                        />
                      ))}
                    </div>
                    <div className="text-muted-foreground">{artisanData.ratings.count} reviews</div>
                  </div>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center">
                        <span className="text-sm w-8">{star}★</span>
                        <div className="flex-1 h-2 bg-secondary rounded-full mx-2 overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full" 
                            style={{ 
                              width: `${(artisanData.ratings.breakdown[star] / artisanData.ratings.count) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm w-8 text-right">
                          {artisanData.ratings.breakdown[star]}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card className="hover:shadow-glow transition-all bg-card">
            <CardHeader>
              <CardTitle className="text-card-title text-primary font-indian">Artisan Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artisanData.products.map((product: any) => (
                  <Card key={product.id} className="hover:shadow-glow transition-all bg-card">
                    <div className="h-40 bg-secondary rounded-t-lg"></div>
                    <CardHeader>
                      <CardTitle className="text-card-title text-primary">
                        {product.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <div className="font-bold text-primary">
                            <IndianRupee className="h-4 w-4 inline mr-0.5" />
                            {product.price.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-current text-amber-500 mr-1" />
                          <span>{product.rating}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Sold: {product.sales}</span>
                        <span>Rating: {product.rating}</span>
                      </div>
                      <Button className="w-full mt-4">View Product</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-glow transition-all bg-card">
              <CardHeader>
                <CardTitle className="text-card-title text-primary font-indian">Awards & Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {artisanData.achievements.map((achievement: any, index: number) => (
                    <div key={index} className="flex">
                      <div className="mr-4">
                        <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center">
                          <Award className="h-6 w-6" />
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold">{achievement.title}</div>
                        <div className="text-sm text-muted-foreground">{achievement.year}</div>
                        <div className="text-muted-foreground mt-1">{achievement.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-glow transition-all bg-card">
              <CardHeader>
                <CardTitle className="text-card-title text-primary font-indian">Masterclass Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <div className="font-medium">Traditional Silk Weaving</div>
                      <div className="text-sm text-muted-foreground">Kanchipuram, 2019</div>
                    </div>
                    <Badge>Master</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <div className="font-medium">Zari Work Techniques</div>
                      <div className="text-sm text-muted-foreground">Tamil Nadu, 2020</div>
                    </div>
                    <Badge>Expert</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                      <div className="font-medium">Natural Dyeing</div>
                      <div className="text-sm text-muted-foreground">South India, 2021</div>
                    </div>
                    <Badge>Expert</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-glow transition-all bg-card">
              <CardHeader>
                <CardTitle className="text-card-title text-primary font-indian">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div>{artisanData.contact.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Phone</div>
                    <div>{artisanData.contact.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Address</div>
                    <div>{artisanData.contact.address}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-glow transition-all bg-card">
              <CardHeader>
                <CardTitle className="text-card-title text-primary font-indian">Social Media</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm text-muted-foreground">Website</div>
                        <div className="font-medium">{artisanData.socialMedia.website}</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Visit</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-primary font-semibold">@</span>
                      <div>
                        <div className="text-sm text-muted-foreground">Instagram</div>
                        <div className="font-medium">{artisanData.socialMedia.instagram}</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Follow</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-primary font-semibold">f</span>
                      <div>
                        <div className="text-sm text-muted-foreground">Facebook</div>
                        <div className="font-medium">{artisanData.socialMedia.facebook}</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Follow</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default ArtisanProfile;