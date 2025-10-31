import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, Share2, FileText, BookOpen, Mail, Upload, Check, Copy, Edit2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const AIContentGenerator = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentType, setContentType] = useState('social');
  const [customPrompt, setCustomPrompt] = useState('');

  const contentTypes = [
    { id: 'social', label: 'Social Media Post', icon: 'Share2' },
    { id: 'product', label: 'Product Description', icon: 'FileText' },
    { id: 'story', label: 'Artisan Story', icon: 'BookOpen' },
    { id: 'email', label: 'Email Campaign', icon: 'Mail' }
  ];

  const sampleImages = [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300',
      alt: 'Handwoven textile'
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=300',
      alt: 'Wooden craft'
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300',
      alt: 'Ceramic pottery'
    },
    {
      id: 4,
      url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300',
      alt: 'Metal jewelry'
    }
  ];

  const handleImageSelect = (image) => {
    setSelectedImage(image);
    setGeneratedContent('');
  };

  const handleImageUpload = (event) => {
    const file = event?.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage({
          id: 'uploaded',
          url: e?.target?.result,
          alt: file?.name
        });
        setGeneratedContent('');
      };
      reader?.readAsDataURL(file);
    }
  };

  const generateContent = async () => {
    if (!selectedImage) return;

    setIsGenerating(true);
    try {
      const formData = new FormData();
      // The selectedImage object has a url property which is a data URL
      // We need to convert it to a Blob to send it to the backend
      const response = await fetch(selectedImage.url);
      const blob = await response.blob();
      formData.append('image', blob, selectedImage.alt);
      formData.append('contentType', contentType);
      formData.append('customPrompt', customPrompt);

      const result = await axios.post('/api/artisan/generate-content', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (result.data.success) {
        setGeneratedContent(result.data.generated_text);
      } else {
        throw new Error('Failed to generate content');
      }
    } catch (error) {
      console.error("Error generating content:", error);
      // You could add a toast notification here to inform the user
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard?.writeText(generatedContent);
    // You could add a toast notification here
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-warm-sm">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-accent text-accent-foreground rounded-lg">
            <Sparkles size={20} />
          </div>
          <h3 className="text-lg font-heading font-semibold text-foreground">
            AI Content Generator
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Upload or select an image to generate promotional content using AI
        </p>
      </div>
      <div className="p-6">
        {/* Content Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-3">
            Content Type
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {contentTypes?.map((type) => (
              <button
                key={type?.id}
                onClick={() => setContentType(type?.id)}
                className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors duration-200 ${ 
                  contentType === type?.id
                    ? 'border-primary bg-primary/10 text-primary' :'border-border hover:border-primary/50 text-foreground'
                }`}
              >
                {type?.icon === 'Share2' && <Share2 size={16} />}
                {type?.icon === 'FileText' && <FileText size={16} />}
                {type?.icon === 'BookOpen' && <BookOpen size={16} />}
                {type?.icon === 'Mail' && <Mail size={16} />}
                <span className="text-sm font-medium">{type?.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Image Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-3">
            Select or Upload Image
          </label>
          
          {/* Upload Button */}
          <div className="mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button variant="outline" className="cursor-pointer">
                <Upload size={16} className="mr-2" />
                Upload Image
              </Button>
            </label>
          </div>

          {/* Sample Images */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sampleImages?.map((image) => (
              <div
                key={image?.id}
                onClick={() => handleImageSelect(image)}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${ 
                  selectedImage?.id === image?.id
                    ? 'border-primary shadow-warm-md'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="aspect-square">
                  <img
                    src={image?.url}
                    alt={image?.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                {selectedImage?.id === image?.id && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-primary text-primary-foreground rounded-full p-2">
                      <Check size={16} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Custom Prompt */}
        <div className="mb-6">
          <Input
            label="Custom Prompt (Optional)"
            type="text"
            placeholder="Add specific details or style preferences..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e?.target?.value)}
            description="Provide additional context to customize the generated content"
          />
        </div>

        {/* Generate Button */}
        <div className="mb-6">
          <Button
            variant="default"
            onClick={generateContent}
            disabled={!selectedImage || isGenerating}
            loading={isGenerating}
            className="w-full sm:w-auto"
          >
            <Sparkles size={16} className="mr-2" />
            {isGenerating ? 'Generating Content...' : 'Generate Content'}
          </Button>
        </div>

        {/* Generated Content */}
        {generatedContent && (
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-foreground">Generated Content</h4>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  <Copy size={16} className="mr-2" />
                  Copy
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit2 size={16} className="mr-2" />
                  Edit
                </Button>
              </div>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                {generatedContent}
              </pre>
            </div>
            {/* One-click share/download actions */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {/* WhatsApp Share */}
              <a href={`https://wa.me/?text=${encodeURIComponent(generatedContent)}`} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="sm"><Share2 size={14} className="mr-1" /> WhatsApp</Button>
              </a>
              {/* Facebook Share */}
              <a href={`https://www.facebook.com/sharer/sharer.php?u=&quote=${encodeURIComponent(generatedContent)}`} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="sm"><Share2 size={14} className="mr-1" /> Facebook</Button>
              </a>
              {/* Email Share */}
              <a href={`mailto:?subject=Check%20out%20this%20artisan%20product!&body=${encodeURIComponent(generatedContent)}`} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="sm"><Mail size={14} className="mr-1" /> Email</Button>
              </a>
              {/* Download as TXT */}
              <Button variant="outline" size="sm" onClick={() => {
                const blob = new Blob([generatedContent], {type: 'text/plain'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'artisan-promo.txt';
                a.click();
                URL.revokeObjectURL(url);
              }}>
                <FileText size={14} className="mr-1" /> Download
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIContentGenerator;
