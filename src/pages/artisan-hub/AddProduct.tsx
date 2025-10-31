import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/language-utils';
import { useToast } from '@/components/ui/use-toast';
import { Package } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
import { artisanService } from '@/services/artisanService';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const { t: languageT } = useLanguage();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');

  const [artifactImages, setArtifactImages] = useState<File[]>([]);
  const [newArtifact, setNewArtifact] = useState({
    name: '',
    price: '',
    category: 'tools',
    description: '',
    condition: 'excellent'
  });

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [isGeneratingAIContent, setIsGeneratingAIContent] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState({ description: '', story: '', socialMediaPosts: [] });

  const conditions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  const navigate = useNavigate();

  useEffect(() => {
    if (productId) {
      const fetchArtifact = async () => {
        try {
          const artifact = await artisanService.getArtisanProduct(productId);
          setNewArtifact({
            name: artifact.name,
            price: artifact.price.toString(),
            category: artifact.category,
            description: artifact.description,
            condition: artifact.condition,
          });
        } catch (error) {
          console.error("Failed to fetch artifact:", error);
          toast({
            title: languageT("Error"),
            description: languageT("Failed to load product details."),
            variant: "destructive",
          });
        }
      };
      fetchArtifact();
    }
  }, [productId, toast, languageT]);

  const handleGenerateAIContent = async () => {
    if (artifactImages.length === 0) {
      toast({
        title: languageT("No image uploaded"),
        description: languageT("Please upload an image of your artifact first."),
        variant: "destructive"
      });
      return;
    }
    if (!newArtifact.name) {
      toast({
        title: languageT("Missing artifact name"),
        description: languageT("Please enter the artifact name."),
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingAIContent(true);
    try {
      const imageUrl = URL.createObjectURL(artifactImages[0]);
      const generated = await artisanService.generateMarketingContent(
        imageUrl,
        {
          name: newArtifact.name,
          category: newArtifact.category,
          materials: newArtifact.description || "various traditional materials",
        }
      );
      setAiGeneratedContent(generated);
      toast({
        title: languageT("AI Content Generated"),
        description: languageT("Marketing content successfully generated!"),
      });
    } catch (error) {
      console.error("Error generating AI content:", error);
      toast({
        title: languageT("AI Generation Failed"),
        description: languageT("Could not generate content. Please try again."),
        variant: "destructive"
      });
    } finally {
      setIsGeneratingAIContent(false);
    }
  };

  const handleTranslate = async (field: 'description' | 'story', text: string) => {
    try {
      const translatedText = await artisanService.translateText(text, useLanguage().currentLanguage.code);
      setAiGeneratedContent(prev => ({
        ...prev,
        [field]: translatedText,
      }));
      toast({
        title: languageT("Text Translated"),
        description: languageT("Content has been translated."),
      });
    } catch (error) {
      console.error("Error translating text:", error);
      toast({
        title: languageT("Translation Failed"),
        description: languageT("Could not translate content. Please try again."),
        variant: "destructive"
      });
    } 
  };

  const handleTextToSpeech = async (text: string) => {
    if (isSpeaking && audioUrl) {
      const audio = new Audio(audioUrl);
      audio.pause();
      setAudioUrl(null);
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      const audioBase64 = await artisanService.textToSpeech(text, useLanguage().currentLanguage.code);
      const audioBlob = await fetch(`data:audio/mp3;base64,${audioBase64}`).then(res => res.blob());
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => {
        setIsSpeaking(false);
        setAudioUrl(null);
      };
      toast({
        title: languageT("Playing Audio"),
        description: languageT("Text-to-speech initiated."),
      });
    } catch (error) {
      console.error("Error with text-to-speech:", error);
      toast({
        title: languageT("Text-to-Speech Failed"),
        description: languageT("Could not generate audio. Please try again."),
        variant: "destructive"
      });
    } finally {
      // setIsSpeaking(false); // This will be set by audio.onended
    }
  };

  const [isAddingArtifact, setIsAddingArtifact] = useState(false);

  const handleSaveArtifact = async () => {
    if (!newArtifact.name || !newArtifact.price) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsAddingArtifact(true);
    try {
      const artifactData = {
        name: newArtifact.name,
        price: parseFloat(newArtifact.price),
        category: newArtifact.category,
        description: aiGeneratedContent.description || newArtifact.description,
        condition: newArtifact.condition,
        images: artifactImages.map(file => URL.createObjectURL(file)),
        aiDescription: aiGeneratedContent.description,
        aiStory: aiGeneratedContent.story,
        aiSocialMediaPosts: aiGeneratedContent.socialMediaPosts,
      };

      if (productId) {
        await artisanService.updateArtisanProduct(productId, artifactData);
      } else {
        await artisanService.createArtisanProduct(artifactData);
      }

      setNewArtifact({
        name: '',
        price: '',
        category: 'tools',
        description: '',
        condition: 'excellent'
      });
      setArtifactImages([]);
      setAiGeneratedContent({ description: '', story: '', socialMediaPosts: [] });
      setAudioUrl(null);
      setIsSpeaking(false);

      toast({
        title: productId ? "Artifact updated" : "Artifact listed",
        description: `Your artifact has been ${productId ? 'updated' : 'listed'} successfully!`,
      });
      // Redirect back to dashboard after short delay
      setTimeout(() => {
        navigate('/artisans/dashboard');
      }, 1000);
    } catch (error) {
      console.error("Error saving artifact:", error);
      toast({
        title: `Failed to ${productId ? 'update' : 'list'} artifact`,
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsAddingArtifact(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-full"
    >
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-section-title text-primary font-indian">
            {productId ? languageT("Edit Product") : languageT("Add New Product")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm font-medium mb-3 block">Artifact Images</Label>
            <ImageUpload
              onImagesChange={setArtifactImages}
              maxImages={5}
              onRemoveExisting={() => {}}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Artifact Name *</Label>
              <Input
                value={newArtifact.name}
                onChange={(e) => setNewArtifact({...newArtifact, name: e.target.value})}
                placeholder="e.g., Vintage Brass Plow"
                className="mt-1 bg-background"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Category *</Label>
              <Select
                value={newArtifact.category}
                onValueChange={(value) => setNewArtifact({...newArtifact, category: value})}
              >
                <SelectTrigger className="mt-1 bg-background">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tools">Farm Tools</SelectItem>
                  <SelectItem value="pottery">Pottery</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                  <SelectItem value="decorative">Decorative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Price (₹) *</Label>
              <Input
                type="number"
                value={newArtifact.price}
                onChange={(e) => setNewArtifact({...newArtifact, price: e.target.value})}
                placeholder="15000"
                className="mt-1 bg-background"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Condition *</Label>
              <Select
                value={newArtifact.condition}
                onValueChange={(value) => setNewArtifact({...newArtifact, condition: value})}
              >
                <SelectTrigger className="mt-1 bg-background">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map(condition => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              value={newArtifact.description}
              onChange={(e) => setNewArtifact({...newArtifact, description: e.target.value})}
              placeholder="Describe your artifact, its history, condition, and unique features..."
              rows={4}
              className="mt-1 bg-background"
            />
          </div>

          <Card className="border-dashed border-2 border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 font-indian text-primary">
                ✨ {languageT("AI Marketing Assistant")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {languageT("Generate compelling descriptions, stories, and social media posts using AI.")}
              </p>
              <Button
                onClick={handleGenerateAIContent}
                disabled={isGeneratingAIContent || artifactImages.length === 0 || !newArtifact.name}
                className="w-full bg-accent hover:bg-accent/90"
              >
                {isGeneratingAIContent ? languageT("Generating...") : languageT("Generate with AI")}
              </Button>

              {aiGeneratedContent.description && (
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="text-sm font-medium">{t("AI-Generated Description")}</Label>
                    <Textarea
                      value={aiGeneratedContent.description}
                      onChange={(e) => setAiGeneratedContent(prev => ({...prev, description: e.target.value}))}
                      rows={5}
                      className="mt-1 bg-background"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => handleTranslate('description', aiGeneratedContent.description)}>{t("Translate")}</Button>
                      <Button size="sm" variant="outline" onClick={() => handleTextToSpeech(aiGeneratedContent.description)}>{isSpeaking ? t("Stop Speaking") : t("Speak")}</Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t("AI-Generated Story")}</Label>
                    <Textarea
                      value={aiGeneratedContent.story}
                      onChange={(e) => setAiGeneratedContent(prev => ({...prev, story: e.target.value}))}
                      rows={5}
                      className="mt-1 bg-background"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => handleTranslate('story', aiGeneratedContent.story)}>{t("Translate")}</Button>
                      <Button size="sm" variant="outline" onClick={() => handleTextToSpeech(aiGeneratedContent.story)}>{isSpeaking ? t("Stop Speaking") : t("Speak")}</Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t("AI-Generated Social Media Posts")}</Label>
                    <Textarea
                      value={aiGeneratedContent.socialMediaPosts.join('\n\n')}
                      onChange={(e) => setAiGeneratedContent(prev => ({...prev, socialMediaPosts: e.target.value.split('\n\n')}))}
                      rows={5}
                      className="mt-1 bg-background"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex space-x-2 pt-4">
            <Button onClick={handleSaveArtifact} className="flex-1 bg-primary hover:bg-primary/90">
              <Package className="h-4 w-4 mr-2" />
              {productId ? t("Save Changes") : t("List Artifact")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AddProduct;
