import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  sellerCoachingAgent,
  culturalFootnoteAgent,
  conversationAgent
} from '@/lib/aiAgents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MarketingHub = () => {
  // Storytelling Assistant State
  const [storyInput, setStoryInput] = useState('');
  const [generatedStory, setGeneratedStory] = useState('');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);

  // Social Media Post Generator State
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);

  // AI Chat Assistant State
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isChatting, setIsChatting] = useState(false);

  // Storytelling Assistant Functions
  const handleGenerateStory = async () => {
    if (!storyInput.trim()) {
      alert('Please enter some details about your craft or product');
      return;
    }

    setIsGeneratingStory(true);
    try {
      const productData = {
        name: storyInput,
        category: 'craft',
        description: storyInput
      };

      const footnote = await culturalFootnoteAgent(
        productData,
        'India', // Default region - can be made configurable
        'english'
      );

      setGeneratedStory(footnote.footnote);
    } catch (error) {
      console.error('Story generation failed:', error);
      alert('Failed to generate story. Please try again.');
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // Social Media Post Generator Functions
  const handleGeneratePost = async () => {
    if (!productName.trim() || !productDescription.trim()) {
      alert('Please enter product name and description');
      return;
    }

    setIsGeneratingPost(true);
    try {
      const coaching = await sellerCoachingAgent(
        {
          name: productName,
          description: productDescription,
          category: 'craft',
          price: 0,
          images: []
        },
        {}
      );

      setGeneratedPost(coaching.caption || 'Could not generate a post.');
    } catch (error) {
      console.error('Social media post generation failed:', error);
      alert('Failed to generate social media post. Please try again.');
    } finally {
      setIsGeneratingPost(false);
    }
  };

  // AI Chat Assistant Functions
  const handleSendChatMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatMessage('');
    setIsChatting(true);

    const newHistory = [...chatHistory, { role: 'user', content: userMessage }];
    setChatHistory(newHistory);

    try {
      const userContext = {
        region: 'India',
        language: 'english',
        artisan_type: 'handicrafts'
      };

      const response = await conversationAgent(
        userMessage,
        newHistory.slice(-3),
        userContext
      );

      setChatHistory([...newHistory, { role: 'assistant', content: response.response }]);
    } catch (error) {
      console.error('Chat failed:', error);
      const errorResponse = 'Sorry, I\'m having trouble responding right now. Please try again.';
      setChatHistory([...newHistory, { role: 'assistant', content: errorResponse }]);
    } finally {
      setIsChatting(false);
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
        <h1 className="text-hero text-primary font-indian mb-4">
          Marketing & Storytelling Hub
        </h1>
        <p className="text-lg text-muted-foreground">
          Create compelling stories and marketing content for your artisan products
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Storytelling Assistant */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="hover:shadow-glow transition-all bg-card h-full">
            <CardHeader>
              <CardTitle className="text-card-title text-primary font-indian">Storytelling Assistant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                rows={4}
                placeholder="Describe your artisan product, its origins, or your crafting journey..."
                value={storyInput}
                onChange={(e) => setStoryInput(e.target.value)}
                className="bg-background"
              />
              <Button
                onClick={handleGenerateStory}
                disabled={isGeneratingStory || !storyInput.trim()}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isGeneratingStory ? 'Crafting Story...' : 'Craft Your Story'}
              </Button>
              {generatedStory && (
                <div className="mt-4 p-4 bg-background rounded-md">
                  <h3 className="font-semibold">Your Craft's Story:</h3>
                  <p className="text-sm mt-2">{generatedStory}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Social Media Post Generator */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="hover:shadow-glow transition-all bg-card h-full">
            <CardHeader>
              <CardTitle className="text-card-title text-primary font-indian">Social Media Post Generator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Product Name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="bg-background"
              />
              <Textarea
                rows={4}
                placeholder="Product Description"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                className="bg-background"
              />
              <Button
                onClick={handleGeneratePost}
                disabled={isGeneratingPost || !productName.trim() || !productDescription.trim()}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isGeneratingPost ? 'Generating Post...' : 'Generate Post'}
              </Button>
              {generatedPost && (
                <div className="mt-4 p-4 bg-background rounded-md">
                  <h3 className="font-semibold">Generated Post:</h3>
                  <p className="text-sm mt-2">{generatedPost}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Chat Assistant */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card className="hover:shadow-glow transition-all bg-card h-full">
            <CardHeader>
              <CardTitle className="text-card-title text-primary font-indian">AI Chat Assistant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-64 overflow-y-auto border rounded-md p-4 bg-background">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <span className={`inline-block px-3 py-1 rounded-lg ${
                      msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {msg.content}
                    </span>
                  </div>
                ))}
                {isChatting && (
                  <div className="text-left">
                    <span className="inline-block px-3 py-1 rounded-lg bg-muted text-muted-foreground">
                      Thinking...
                    </span>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  placeholder="Ask about marketing, pricing, or artisan tips..."
                  className="bg-background"
                />
                <Button
                  onClick={handleSendChatMessage}
                  disabled={isChatting || !chatMessage.trim()}
                  className="bg-primary hover:bg-primary/90"
                >
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MarketingHub;