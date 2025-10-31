import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/language-utils';
import { useToast } from '@/components/ui/use-toast';
import { BookOpen, Award, Clock, Users, MapPin, IndianRupee, Star, Play, Eye, Download } from 'lucide-react';

const CraftEducationModules = () => {
  const { t: languageT } = useLanguage();
  const { toast } = useToast();
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [courseProgress, setCourseProgress] = useState<Record<string, number>>({});

  // Craft education modules data
  const craftModules = [
    {
      id: 'pottery',
      title: 'Traditional Pottery Making',
      region: 'Uttar Pradesh, Tamil Nadu',
      duration: '2 weeks',
      difficulty: 'Beginner',
      description: 'Learn the ancient art of pottery making using traditional techniques passed down through generations.',
      modules: [
        {
          id: 'pottery-1',
          title: 'Introduction to Clay',
          duration: '2 hours',
          content: 'Understanding different types of clay, their properties, and preparation for pottery making. Learn about the cultural significance of clay in Indian traditions.',
          type: 'video'
        },
        {
          id: 'pottery-2',
          title: 'Wheel Techniques',
          duration: '4 hours',
          content: 'Master the traditional potter\'s wheel techniques used in different regions of India. Practice centering, opening, and forming clay.',
          type: 'practical'
        },
        {
          id: 'pottery-3',
          title: 'Glazing & Firing',
          duration: '3 hours',
          content: 'Learn traditional glazing methods and firing techniques. Understand the science behind ceramic transformation.',
          type: 'tutorial'
        }
      ]
    },
    {
      id: 'textiles',
      title: 'Textile Weaving & Dyeing',
      region: 'Gujarat, Rajasthan, Andhra Pradesh',
      duration: '3 weeks',
      difficulty: 'Intermediate',
      description: 'Explore the rich tradition of Indian textile weaving and natural dyeing techniques.',
      modules: [
        {
          id: 'textiles-1',
          title: 'Natural Dyeing',
          duration: '3 hours',
          content: 'Extract dyes from plants, roots, and flowers. Learn about traditional color preparation methods.',
          type: 'practical'
        },
        {
          id: 'textiles-2',
          title: 'Weaving Patterns',
          duration: '5 hours',
          content: 'Master traditional weaving patterns unique to different regions of India.',
          type: 'video'
        },
        {
          id: 'textiles-3',
          title: 'Quality Control',
          duration: '2 hours',
          content: 'Learn to assess quality, check for defects, and ensure durability of handwoven fabrics.',
          type: 'tutorial'
        }
      ]
    },
    {
      id: 'metalwork',
      title: 'Traditional Metalwork',
      region: 'Kerala, West Bengal, Rajasthan',
      duration: '4 weeks',
      difficulty: 'Advanced',
      description: 'Discover the intricate art of metalwork including brass, copper, and bell metal techniques.',
      modules: [
        {
          id: 'metalwork-1',
          title: 'Metal Preparation',
          duration: '4 hours',
          content: 'Understanding different metals and their preparation for crafting.',
          type: 'tutorial'
        },
        {
          id: 'metalwork-2',
          title: 'Traditional Tools',
          duration: '3 hours',
          content: 'Use of traditional tools and techniques in metalwork.',
          type: 'video'
        },
        {
          id: 'metalwork-3',
          title: 'Engraving & Embossing',
          duration: '6 hours',
          content: 'Master decorative techniques used in traditional metalwork.',
          type: 'practical'
        }
      ]
    }
  ];

  const handleModuleSelect = (module: any) => {
    setSelectedModule(module);
  };

  const handleCourseStart = (moduleId: string) => {
    toast({
      title: "Course Started",
      description: `Started ${craftModules.find(m => m.id === moduleId)?.title} course.`
    });
    setCourseProgress({ ...courseProgress, [moduleId]: 10 });
  };

  const handleLessonComplete = (moduleId: string, lessonId: string) => {
    if (!courseProgress[moduleId]) setCourseProgress({ ...courseProgress, [moduleId]: 0 });
    
    const currentProgress = courseProgress[moduleId] || 0;
    const newProgress = Math.min(100, currentProgress + 25);
    setCourseProgress({ ...courseProgress, [moduleId]: newProgress });
    
    if (newProgress === 100) {
      toast({
        title: "Course Completed!",
        description: `Congratulations! You have completed the ${craftModules.find(m => m.id === moduleId)?.title} course.`
      });
    } else {
      toast({
        title: "Lesson Completed",
        description: `Added to your progress: ${craftModules.find(m => m.id === moduleId)?.title}`
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="text-center py-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full mr-4">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-hero text-primary font-indian mb-2">
              Traditional Craft Education
            </h1>
            <p className="text-lg text-muted-foreground">
              Learn and preserve India's traditional artisan crafts through interactive modules
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {craftModules.map((module) => (
          <motion.div
            key={module.id}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.2 }}
          >
            <Card 
              className={`hover:shadow-glow transition-all bg-card cursor-pointer ${
                selectedModule?.id === module.id ? 'border-primary border-2' : ''
              }`}
              onClick={() => handleModuleSelect(module)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-card-title text-primary font-indian">
                    {module.title}
                  </CardTitle>
                  <Badge variant="outline">{module.difficulty}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{module.region}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{module.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{module.modules.length} modules</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${courseProgress[module.id] || 0}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {courseProgress[module.id] || 0}% completed
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (courseProgress[module.id] && courseProgress[module.id] === 100) {
                        toast({
                          title: "Course Complete",
                          description: "You've already completed this course!"
                        });
                      } else {
                        handleCourseStart(module.id);
                      }
                    }}
                  >
                    {courseProgress[module.id] === 100 ? 'Completed' : courseProgress[module.id] && courseProgress[module.id] > 0 ? 'Continue' : 'Start Learning'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedModule && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="hover:shadow-glow transition-all bg-card">
            <CardHeader>
              <CardTitle className="text-card-title text-primary font-indian flex items-center justify-between">
                <span>{selectedModule.title}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedModule.difficulty}</Badge>
                  <Badge variant="secondary">{selectedModule.duration}</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="modules">Learning Modules</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">About this Course</h3>
                      <p className="text-muted-foreground">{selectedModule.description}</p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          <span>Region: {selectedModule.region}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          <span>Duration: {selectedModule.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-2 text-primary" />
                          <span>Difficulty: {selectedModule.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Course Modules</h3>
                      <div className="space-y-3">
                        {selectedModule.modules.map((lesson: any) => (
                          <div key={lesson.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                            <div>
                              <div className="font-medium">{lesson.title}</div>
                              <div className="text-sm text-muted-foreground">{lesson.duration}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {lesson.type === 'video' ? <Play className="h-3 w-3 mr-1" /> : 
                                 lesson.type === 'practical' ? <Eye className="h-3 w-3 mr-1" /> : 
                                 <BookOpen className="h-3 w-3 mr-1" />}
                                {lesson.type}
                              </Badge>
                              <Button 
                                size="sm" 
                                variant="secondary"
                                onClick={() => handleLessonComplete(selectedModule.id, lesson.id)}
                              >
                                Complete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="modules" className="space-y-4">
                  <div className="space-y-4">
                    {selectedModule.modules.map((lesson: any) => (
                      <Card key={lesson.id} className="hover:shadow-glow transition-all bg-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="text-card-title text-primary">
                            {lesson.title}
                          </CardTitle>
                          <Badge variant="outline">
                            {lesson.type === 'video' ? <Play className="h-3 w-3 mr-1" /> : 
                             lesson.type === 'practical' ? <Eye className="h-3 w-3 mr-1" /> : 
                             <BookOpen className="h-3 w-3 mr-1" />}
                            {lesson.type}
                          </Badge>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{lesson.content}</p>
                          <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                              Duration: {lesson.duration}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => handleLessonComplete(selectedModule.id, lesson.id)}
                              >
                                Mark Complete
                              </Button>
                              <Button 
                                variant="secondary"
                                size="sm"
                                onClick={() => toast({
                                  title: "Demo Mode",
                                  description: "This would open the learning content in a real implementation."
                                })}
                              >
                                {lesson.type === 'video' ? <Play className="h-4 w-4 mr-2" /> : 
                                 lesson.type === 'practical' ? <Eye className="h-4 w-4 mr-2" /> : 
                                 <BookOpen className="h-4 w-4 mr-2" />}
                                {lesson.type === 'video' ? 'Watch Video' : 
                                 lesson.type === 'practical' ? 'View Demo' : 'Read Content'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card className="hover:shadow-glow transition-all bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian">Craft Education Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 text-center">
              <div className="p-3 bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Preserve Heritage</h3>
              <p className="text-sm text-muted-foreground mt-1">Keep traditional crafts alive for future generations</p>
            </div>
            <div className="p-4 text-center">
              <div className="p-3 bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <IndianRupee className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Economic Empowerment</h3>
              <p className="text-sm text-muted-foreground mt-1">Create sustainable livelihoods for artisans</p>
            </div>
            <div className="p-4 text-center">
              <div className="p-3 bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Skill Development</h3>
              <p className="text-sm text-muted-foreground mt-1">Learn from master artisans in your region</p>
            </div>
            <div className="p-4 text-center">
              <div className="p-3 bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Quality Assurance</h3>
              <p className="text-sm text-muted-foreground mt-1">Maintain traditional standards and techniques</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CraftEducationModules;