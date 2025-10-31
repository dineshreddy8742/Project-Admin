import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/components/ui/use-toast';
import { governmentSchemesService, Scheme, HelpCenter } from '@/services/governmentSchemesService';
import { useLanguage } from '@/contexts/language-utils';
import eventBus from '@/lib/eventBus';
import {
  Building2,
  Mic,
  Search,
  ExternalLink,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  FileText,
  Users,
  Banknote,
  Mic2
} from 'lucide-react';

const GovernmentSchemes = () => {
  const { translateSync } = useLanguage();
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<string | null>(null);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [helpCenters, setHelpCenters] = useState<HelpCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [schemesData, helpCentersData] = await Promise.all([
          governmentSchemesService.fetchSchemes(),
          governmentSchemesService.fetchHelpCenters()
        ]);
        setSchemes(schemesData);
        setHelpCenters(helpCentersData);
      } catch (error) {
        toast({
          title: translateSync("Error"),
          description: translateSync("Failed to load government schemes data. Please try again."),
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [toast]);

  useEffect(() => {
    const handleFillField = (event: CustomEvent) => {
        const data = event.detail;
        if (data.field === 'query') {
            setQuery(data.value);
            searchSchemes(data.value);
        }
    };

    eventBus.on('fill-gov-schemes-field', handleFillField);

    return () => {
        eventBus.remove('fill-gov-schemes-field', handleFillField);
    };
  }, []);

  // Search schemes
  const searchSchemes = async (searchQuery: string) => {
    try {
      setSearchLoading(true);
      const searchResults = await governmentSchemesService.fetchSchemes({ 
        query: searchQuery,
        limit: 10 
      });
      setSchemes(searchResults);
      
      if (searchResults.length === 0) {
        toast({
          title: translateSync("No Results"),
          description: translateSync("No schemes found matching your search criteria."),
          variant: "default"
        });
      }
    } catch (error) {
        toast({
          title: translateSync("Search Error"),
          description: translateSync("Failed to search schemes. Please try again."),
          variant: "destructive"
        });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleVoiceSearch = async () => {
    setIsListening(true);
    try {
      // Start voice recognition for search
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'hi-IN'; // Hindi/Kannada
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);

        // Automatically trigger search after voice input
        await searchSchemes(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: translateSync("Voice Recognition Error"),
          description: translateSync("Could not recognize voice input. Please try again."),
          variant: "destructive"
        });
      };

      recognition.start();
    } catch (error) {
      setIsListening(false);
      // Fallback to mock voice search for demo
      setQuery('subsidy');
      await searchSchemes('subsidy');
    }
  };

  const handleVoiceQuery = async () => {
    setIsListening(true);
    try {
      // Start voice recognition
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'hi-IN'; // Hindi/Kannada
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);

        // Search schemes based on voice query
        await searchSchemes(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast({
          title: translateSync("Voice Recognition Error"),
          description: translateSync("Could not recognize voice input. Please try again."),
          variant: "destructive"
        });
      };

      recognition.start();
    } catch (error) {
      setIsListening(false);
      // Fallback to mock voice query for demo
      setQuery('ಡ್ರಿಪ್ ಇರಿಗೇಶನ್ ಸಬ್ಸಿಡಿ ಬಗ್ಗೆ ಹೇಳಿ');
      await searchSchemes('drip irrigation');
    }
  };

  const handleSearch = async () => {
    if (query.trim()) {
      await searchSchemes(query.trim());
    }
  };

  const handleApplyScheme = async (schemeId: string) => {
    try {
      const result = await governmentSchemesService.applyForScheme(schemeId, {});
      if (result.success) {
        toast({
          title: translateSync("Application Submitted"),
          description: translateSync(`Your application has been submitted successfully. Application ID: ${result.applicationId}`),
          variant: "default"
        });
      }
    } catch (error) {
      toast({
        title: translateSync("Application Error"),
        description: translateSync("Failed to submit application. Please try again later."),
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-hero text-primary font-indian mb-2">
            🏛️ {translateSync('Government Schemes')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {translateSync('Government schemes and subsidies for farmers')}
          </p>
        </motion.div>

        {/* Voice Query Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mic className="h-5 w-5 text-primary" />
                <span>{translateSync('Ask About Schemes')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder={translateSync("Search schemes or ask questions")}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={searchLoading || !query.trim()}
                    variant="outline"
                    className="h-auto px-4"
                  >
                    {searchLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Search className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    onClick={handleVoiceSearch}
                    disabled={isListening}
                    className={`voice-button h-auto px-4 ${isListening ? 'animate-pulse-soft' : ''}`}
                    title="Voice Search"
                  >
                    {isListening ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <Mic2 className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <Mic2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    onClick={handleVoiceQuery}
                    disabled={isListening}
                    className={`voice-button h-auto px-4 ${isListening ? 'animate-pulse-soft' : ''}`}
                    title="Ask About Schemes"
                  >
                    {isListening ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <Mic className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </div>

              <div className="flex flex-wrap gap-2">
                {['Subsidy', 'Loan', 'Insurance', 'Seeds'].map((topic) => (
                  <Button
                    key={topic}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {translateSync(topic)} {translateSync('Schemes')}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Schemes Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {loading ? (
            // Loading skeleton
            Array(6).fill(0).map((_, index) => (
              <Card key={index} className="h-[300px] animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-6 bg-muted rounded w-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                    <div className="h-8 bg-muted rounded w-full mt-4"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : schemes.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">{translateSync('No schemes found. Try a different search term.')}</p>
            </div>
          ) : (
            schemes.map((scheme, index) => (
            <motion.div
              key={scheme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => setSelectedScheme(scheme.id)}
            >
              <Card className={`h-full hover:shadow-glow transition-all ${
                selectedScheme === scheme.id ? 'ring-2 ring-accent' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {scheme.category}
                    </Badge>
                    <Badge variant={scheme.status === 'active' ? 'default' : 'destructive'}>
                      {scheme.status === 'active' ? translateSync('Active') : translateSync('Closed')}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{scheme.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{translateSync('Subsidy')}</p>
                      <p className="font-bold text-green-600">{scheme.subsidy}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{translateSync('Max Amount')}</p>
                      <p className="font-bold text-primary">{scheme.maxAmount}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{translateSync('Deadline')}: {scheme.deadline}</span>
                  </div>

                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                      onClick={() => setSelectedScheme(scheme.id)}
                    >
                      {translateSync('View Details')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            ))
          )}
        </motion.div>

        {/* Selected Scheme Details */}
        <AnimatePresence>
          {selectedScheme && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {(() => {
                const scheme = schemes.find(s => s.id === selectedScheme);
                if (!scheme) return null;

                return (
                  <Card className="border-accent shadow-glow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{scheme.name}</CardTitle>
                        <div className="flex space-x-2">
                          <Badge variant="secondary">{scheme.category}</Badge>
                          <Badge className="bg-green-500">{scheme.subsidy} {translateSync('Subsidy')}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="eligibility">
                          <AccordionTrigger className="flex items-center space-x-2">
                            <Users className="h-4 w-4" />
                            <span>{translateSync('Eligibility Criteria')}</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2">
                              {scheme.eligibility.map((criteria, index) => (
                                <motion.li
                                  key={index}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-start space-x-2"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                  <span className="text-sm">{criteria}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="documents">
                          <AccordionTrigger className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>{translateSync('Required Documents')}</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2">
                              {scheme.documents.map((doc, index) => (
                                <motion.li
                                  key={index}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-start space-x-2"
                                >
                                  <div className="w-4 h-4 bg-accent rounded-full mt-0.5" />
                                  <span className="text-sm">{doc}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="benefits">
                          <AccordionTrigger className="flex items-center space-x-2">
                            <Banknote className="h-4 w-4" />
                            <span>{translateSync('Benefits')}</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2">
                              {scheme.benefits.map((benefit, index) => (
                                <motion.li
                                  key={index}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-start space-x-2"
                                >
                                  <div className="w-4 h-4 bg-primary rounded-full mt-0.5" />
                                  <span className="text-sm">{benefit}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="process">
                          <AccordionTrigger className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4" />
                            <span>{translateSync('Application Process')}</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ol className="space-y-2">
                              {scheme.applicationProcess.map((step, index) => (
                                <motion.li
                                  key={index}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-start space-x-3"
                                >
                                  <div className="w-6 h-6 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                                    {index + 1}
                                  </div>
                                  <span className="text-sm">{step}</span>
                                </motion.li>
                              ))}
                            </ol>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <div className="mt-6 flex space-x-4">
                        <Button 
                          className="flex-1 bg-accent hover:bg-accent/90"
                          onClick={() => handleApplyScheme(scheme.id)}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {translateSync('Apply Now')}
                        </Button>
                        <Button variant="outline" className="flex-1">
                          {translateSync('Download Form')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Centers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{translateSync('Nearest Help Centers')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {helpCenters.map((center, index) => (
                  <motion.div
                    key={center.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start justify-between p-4 bg-accent/5 rounded-lg hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{center.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {center.address}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{center.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{center.distance}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button variant="outline" size="sm">
                        {translateSync('Call')}
                      </Button>
                      <Button variant="outline" size="sm">
                        {translateSync('Directions')}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default GovernmentSchemes;