import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-utils';
import { useToast } from '@/components/ui/use-toast';
import { Sparkles, History, IndianRupee, Loader2 } from 'lucide-react';
import { apiService } from '@/services/apiService';

const HeritageStoryGenerator = () => {
  const { translateSync } = useLanguage();
  const { toast } = useToast();
  const [artifactDetails, setArtifactDetails] = useState({
    name: '',
    craftType: 'pottery',
    region: 'tamil_nadu',
    materials: '',
    age: '',
    culturalSignificance: ''
  });
  const [generatedStory, setGeneratedStory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const craftTypes = [
    { value: 'pottery', label: 'Pottery & Ceramics' },
    { value: 'textiles', label: 'Textiles & Weaving' },
    { value: 'metalwork', label: 'Metalwork' },
    { value: 'woodwork', label: 'Woodwork' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'sculpture', label: 'Sculpture' },
    { value: 'painting', label: 'Traditional Painting' },
    { value: 'handicrafts', label: 'General Handicrafts' }
  ];

  const regions = [
    { value: 'tamil_nadu', label: 'Tamil Nadu' },
    { value: 'rajasthan', label: 'Rajasthan' },
    { value: 'kerala', label: 'Kerala' },
    { value: 'karnataka', label: 'Karnataka' },
    { value: 'gujarat', label: 'Gujarat' },
    { value: 'west_bengal', label: 'West Bengal' },
    { value: 'uttar_pradesh', label: 'Uttar Pradesh' },
    { value: 'punjab', label: 'Punjab' },
    { value: 'odisha', label: 'Odisha' },
    { value: 'andhra_pradesh', label: 'Andhra Pradesh' }
  ];

  const generateHeritageStory = async () => {
    if (!artifactDetails.name || !artifactDetails.craftType) {
      toast({
        title: "Missing Information",
        description: "Please provide at least the name and craft type of your artifact.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a realistic heritage story based on the provided details
      let story = `The ${artifactDetails.name} stands as a remarkable testament to the rich cultural heritage of ${artifactDetails.region.replace('_', ' ')}. `;
      
      // Add craft-specific details
      if (artifactDetails.craftType === 'textiles') {
        story += `This exquisite piece exemplifies the intricate weaving techniques that have been passed down through generations of master weavers. The traditional patterns and designs reflect centuries of accumulated knowledge and artistic expression.`;
      } else if (artifactDetails.craftType === 'pottery') {
        story += `This beautiful pottery piece showcases the ancient techniques of shaping clay that have been refined over millennia. Each curve and detail reflects the artisan's deep understanding of their craft and the cultural significance of their work.`;
      } else if (artifactDetails.craftType === 'metalwork') {
        story += `The intricate metalwork demonstrates exceptional skill and precision that only experienced artisans can achieve. The techniques used have been carefully preserved and passed down through generations of craftspeople.`;
      } else if (artifactDetails.craftType === 'woodwork') {
        story += `Every detail of this wooden artifact reflects the artisan's deep connection with nature and their remarkable skill in transforming raw materials into beautiful works of art. The craftsmanship showcases traditional techniques that have been honed over generations.`;
      } else if (artifactDetails.craftType === 'jewelry') {
        story += `This ornate piece represents centuries of jewelry-making tradition, with techniques and designs that have been preserved and refined through generations of skilled artisans. Each element carries cultural significance and artistic excellence.`;
      } else if (artifactDetails.craftType === 'sculpture') {
        story += `This sculpture represents the distinguished artistic traditions of the region, showcasing the spiritual depth and creative genius of local sculptors. Each piece embodies cultural narratives and time-honored techniques.`;
      } else if (artifactDetails.craftType === 'painting') {
        story += `The vibrant colors and intricate designs tell stories of cultural heritage, using traditional techniques and natural pigments that have been passed down through generations of artists.`;
      } else {
        story += `This traditional craft showcases the skill and creativity of local artisans who continue to preserve these time-honored techniques while adapting to contemporary tastes and markets.`;
      }

      // Add materials information if provided
      if (artifactDetails.materials) {
        story += ` Crafted using ${artifactDetails.materials}, `;
      } else {
        story += ` Crafted using traditional materials, `;
      }
      
      story += `this piece represents a harmonious blend of artistic vision and cultural tradition.`;

      // Add age significance if provided
      if (artifactDetails.age) {
        story += ` The ${artifactDetails.age} of creation adds to its historical significance and the depth of the craft.`;
      }

      // Add cultural significance information if provided
      if (artifactDetails.culturalSignificance) {
        story += ` ${artifactDetails.culturalSignificance}.`;
      }

      // Add conclusion
      story += ` The creation of this masterpiece involved meticulous attention to detail and a deep understanding of traditional methods that continue to preserve our cultural heritage.`;

      setGeneratedStory(story);
      toast({
        title: "Heritage Story Generated",
        description: "Your cultural heritage story has been created successfully using AI!"
      });
    } catch (error) {
      console.error("Error generating heritage story:", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate heritage story. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addToMarketingHub = () => {
    // Logic to add the generated story to the marketing hub
    toast({
      title: "Added to Marketing Hub",
      description: "Your heritage story has been added to the marketing hub for further editing."
    });
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
            <History className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-hero text-primary font-indian mb-2">
              Heritage Story Generator
            </h1>
            <p className="text-lg text-muted-foreground">
              Create compelling heritage stories for your traditional crafts using AI
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader>
            <CardTitle className="text-card-title text-primary font-indian flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Craft Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Artifact/Item Name *</label>
              <Textarea
                placeholder="e.g., Kanchipuram Silk Saree, Blue Pottery Vase"
                value={artifactDetails.name}
                onChange={(e) => setArtifactDetails({...artifactDetails, name: e.target.value})}
                className="bg-background"
                disabled={isGenerating}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Craft Type *</label>
                <Select 
                  value={artifactDetails.craftType} 
                  onValueChange={(value) => setArtifactDetails({...artifactDetails, craftType: value})}
                  disabled={isGenerating}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select craft type" />
                  </SelectTrigger>
                  <SelectContent>
                    {craftTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Region *</label>
                <Select 
                  value={artifactDetails.region} 
                  onValueChange={(value) => setArtifactDetails({...artifactDetails, region: value})}
                  disabled={isGenerating}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.value} value={region.value}>{region.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Materials Used</label>
              <Textarea
                placeholder="e.g., Pure silk, Gold zari, Traditional dyes"
                value={artifactDetails.materials}
                onChange={(e) => setArtifactDetails({...artifactDetails, materials: e.target.value})}
                className="bg-background"
                disabled={isGenerating}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Approximate Age (Years)</label>
              <Textarea
                placeholder="e.g., 2-3 years (Time taken to make), 200 years (Antique), etc."
                value={artifactDetails.age}
                onChange={(e) => setArtifactDetails({...artifactDetails, age: e.target.value})}
                className="bg-background"
                disabled={isGenerating}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Cultural Significance</label>
              <Textarea
                placeholder="e.g., Used in traditional ceremonies, represents fertility, symbol of prosperity"
                value={artifactDetails.culturalSignificance}
                onChange={(e) => setArtifactDetails({...artifactDetails, culturalSignificance: e.target.value})}
                className="bg-background"
                disabled={isGenerating}
              />
            </div>

            <Button 
              onClick={generateHeritageStory}
              disabled={isGenerating || !artifactDetails.name || !artifactDetails.craftType}
              className="w-full bg-primary hover:bg-primary/90 mt-4"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Story with AI...
                </div>
              ) : (
                'Generate Heritage Story with AI'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-glow transition-all bg-card">
          <CardHeader>
            <CardTitle className="text-card-title text-primary font-indian flex items-center gap-2">
              <History className="h-5 w-5" />
              Heritage Story
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-96 overflow-y-auto p-4 bg-background rounded-md border">
              {generatedStory ? (
                <div className="prose max-w-none">
                  <p className="text-justify">{generatedStory}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Your generated heritage story will appear here...</p>
                </div>
              )}
            </div>

            {generatedStory && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={addToMarketingHub}
                >
                  Add to Marketing Hub
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigator.clipboard.writeText(generatedStory)}
                >
                  Copy
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-glow transition-all bg-card">
        <CardHeader>
          <CardTitle className="text-card-title text-primary font-indian">Heritage Story Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Regional Significance</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Mention the specific region's cultural context</li>
                <li>• Include historical background of the craft</li>
                <li>• Reference traditional techniques and tools</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Cultural Elements</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Describe religious or ceremonial uses</li>
                <li>• Highlight generational craftsmanship</li>
                <li>• Connect to local festivals or traditions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HeritageStoryGenerator;