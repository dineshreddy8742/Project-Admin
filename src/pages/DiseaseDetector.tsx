
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Image as ImageIcon, 
  Upload, 
  Camera as CameraIcon, 
  X, 
  ChevronLeft,
  Microscope,
  Scan,
  Brain,
  Globe
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { languages } from '@/contexts/language-utils';
import AnalysisReport from '@/components/AnalysisReport';
import LoadingReport from '@/components/LoadingReport';

// Import crop images
import riceImage from '@/assets/crops/rice.jpg';
import cottonImage from '@/assets/crops/cotton.jpg';
import hotpepperImage from '@/assets/crops/hotpepper.jpg';
import cornImage from '@/assets/crops/corn.jpg';
import tomatoImage from '@/assets/crops/tomato.jpg';
import onionImage from '@/assets/crops/onion.jpg';
import potatoImage from '@/assets/crops/potato.jpg';
import grapesImage from '@/assets/crops/grapes.jpg';

// Import disease reference images
import riceBlightImage from '@/assets/diseases/rice-blight.jpg';
import tomatoBlightImage from '@/assets/diseases/tomato-blight.jpg';
import cornSpotImage from '@/assets/diseases/corn-spot.jpg';
import cottonBollwormImage from '@/assets/diseases/cotton-bollworm.jpg';

const crops: Crop[] = [
  {
    id: 'rice',
    name: 'Rice',
    image: riceImage,
    diseases: [
      { name: 'Rice Blight', image: riceBlightImage, description: 'Fungal disease causing brown spots on leaves' }
    ]
  },
  {
    id: 'wheat',
    name: 'Wheat',
    image: '/src/assets/commodities/wheat.jpg', // No image for wheat
    diseases: []
  },
  {
    id: 'tomato',
    name: 'Tomato',
    image: tomatoImage,
    diseases: [
      { name: 'Tomato Blight', image: tomatoBlightImage, description: 'Late blight affecting tomato plants' }
    ]
  },
  {
    id: 'cotton',
    name: 'Cotton',
    image: cottonImage,
    diseases: [
      { name: 'Cotton Bollworm', image: cottonBollwormImage, description: 'Insect pest damaging cotton bolls' }
    ]
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    image: '/src/assets/crops/corn.jpg', // No image for sugarcane
    diseases: []
  },
  {
    id: 'potato',
    name: 'Potato',
    image: potatoImage,
    diseases: []
  },
  {
    id: 'pulses',
    name: 'Pulses',
    image: '/src/assets/commodities/beans.jpg', // No image for pulses
    diseases: []
  },
  {
    id: 'other',
    name: 'other',
    image: '', // No image for other
    diseases: []
  }
];

type DetectorMode = 'normal' | 'advanced' | 'hyperspectral';

interface Crop {
  id: string;
  name: string;
  image: string;
  diseases: { name: string; image: string; description: string }[];
}

interface Metadata {
  crop_type: string;
  language: string;
  ai_source: string;
  confidence: string;
  timestamp: string;
}

// Function to parse the analysis result string into structured data
const parseAnalysisResult = (analysisText: string) => {
  console.log('Raw analysis text:', analysisText);

  const result: any = {
    recommendation: {
      title: '',
      description: '',
      treatment: '',
      next_steps: [],
      advanced_treatment: '',
      severity_level: 'High',
      urgency: 'High'
    },
    severity_score: 8,
    hyperspectral_data: {
      chlorophyll_content: 'N/A',
      water_stress: 'N/A',
      nutrient_deficiency: 'N/A',
      disease_stress_index: 'N/A',
      photosynthetic_efficiency: 'N/A',
      leaf_temperature: 'N/A',
      stomatal_conductance: 'N/A',
      ndvi: 'N/A',
      pri: 'N/A',
      ari: 'N/A',
      cri: 'N/A'
    },
    actions: [],
    recommendations: [],
    spectral_analysis: '',
    confidence_map_url: ''
  };

  try {
    // If the text is empty or not a string, return defaults
    if (!analysisText || typeof analysisText !== 'string') {
      console.log('Analysis text is empty or not a string');
      return result;
    }

    // Extract disease name - try multiple patterns
    let diseaseMatch = analysisText.match(/This is a .* disease called ([^\.]+)\./i);
    if (!diseaseMatch) {
      diseaseMatch = analysisText.match(/disease called ([^\.]+)\./i);
    }
    if (!diseaseMatch) {
      diseaseMatch = analysisText.match(/DISEASE ASSESSMENT[\s\S]*?([^\n]+)[\s\S]*?This is/i);
    }
    if (!diseaseMatch) {
      // Try to find any disease name in the text
      diseaseMatch = analysisText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*) disease/i);
    }
    if (diseaseMatch) {
      result.recommendation.title = diseaseMatch[1].trim();
      console.log('Disease title found:', result.recommendation.title);
    } else {
      result.recommendation.title = 'Disease analysis not available';
    }

    // Extract description - more flexible pattern
    const descPatterns = [
      /This is a .* disease called [^\.]+\.([\s\S]*?)(?:TREATMENT RECOMMENDATIONS|For immediate actions|PREVENTION GUIDANCE)/i,
      /disease called [^\.]+\.([\s\S]*?)(?:TREATMENT RECOMMENDATIONS|For immediate actions|PREVENTION GUIDANCE)/i,
      /DISEASE ASSESSMENT[\s\S]*?This is[\s\S]*?\.([\s\S]*?)(?:TREATMENT RECOMMENDATIONS|For immediate actions|PREVENTION GUIDANCE)/i,
      /Key visible symptoms[\s\S]*?(.*?)(?:TREATMENT RECOMMENDATIONS|For immediate actions|PREVENTION GUIDANCE)/i
    ];

    for (const pattern of descPatterns) {
      const descMatch = analysisText.match(pattern);
      if (descMatch && descMatch[1].trim()) {
        result.recommendation.description = descMatch[1].trim();
        console.log('Description found:', result.recommendation.description);
        break;
      }
    }

    if (!result.recommendation.description) {
      // Fallback: use the entire text as description
      result.recommendation.description = analysisText;
      console.log('Using full text as description');
    }

    // Extract treatment section
    const treatmentPatterns = [
      /TREATMENT RECOMMENDATIONS([\s\S]*?)(?:For immediate actions|PREVENTION GUIDANCE)/i,
      /TREATMENT([\s\S]*?)(?:For immediate actions|PREVENTION GUIDANCE)/i,
      /TREATMENT RECOMMENDATIONS([\s\S]*?)$/i,
      /TREATMENT([\s\S]*?)$/i
    ];

    for (const pattern of treatmentPatterns) {
      const treatmentMatch = analysisText.match(pattern);
      if (treatmentMatch && treatmentMatch[1].trim()) {
        result.recommendation.treatment = treatmentMatch[1].trim();
        console.log('Treatment found:', result.recommendation.treatment);
        break;
      }
    }

    if (!result.recommendation.treatment) {
      result.recommendation.treatment = 'Treatment information not available';
    }

    // Extract next steps
    const nextStepsPatterns = [
      /For immediate actions,([\s\S]*?)(?:PREVENTION GUIDANCE|$)/i,
      /immediate actions([\s\S]*?)(?:PREVENTION GUIDANCE|$)/i,
      /Immediate actions([\s\S]*?)(?:PREVENTION GUIDANCE|$)/i,
      /For immediate actions([\s\S]*?)(?:PREVENTION GUIDANCE|$)/i
    ];

    for (const pattern of nextStepsPatterns) {
      const nextStepsMatch = analysisText.match(pattern);
      if (nextStepsMatch && nextStepsMatch[1].trim()) {
        result.recommendation.next_steps = [nextStepsMatch[1].trim()];
        console.log('Next steps found:', result.recommendation.next_steps);
        break;
      }
    }

    if (!result.recommendation.next_steps.length) {
      result.recommendation.next_steps = ['Next steps not available'];
    }

    // Extract prevention guidance
    const preventionPatterns = [
      /PREVENTION GUIDANCE([\s\S]*)$/i,
      /PREVENTION([\s\S]*)$/i
    ];

    for (const pattern of preventionPatterns) {
      const preventionMatch = analysisText.match(pattern);
      if (preventionMatch && preventionMatch[1].trim()) {
        result.recommendation.advanced_treatment = preventionMatch[1].trim();
        console.log('Prevention found:', result.recommendation.advanced_treatment);
        break;
      }
    }

    // Try to extract hyperspectral data if present
    const chlorophyllMatch = analysisText.match(/Chlorophyll[^:]*:?\s*([^\n,]+)/i);
    if (chlorophyllMatch) {
      result.hyperspectral_data.chlorophyll_content = chlorophyllMatch[1].trim();
    }

    const waterStressMatch = analysisText.match(/Water Stress[^:]*:?\s*([^\n,]+)/i);
    if (waterStressMatch) {
      result.hyperspectral_data.water_stress = waterStressMatch[1].trim();
    }

    const nutrientMatch = analysisText.match(/Nutrient Deficiency[^:]*:?\s*([^\n,]+)/i);
    if (nutrientMatch) {
      result.hyperspectral_data.nutrient_deficiency = nutrientMatch[1].trim();
    }

    const diseaseStressMatch = analysisText.match(/Disease Stress Index[^:]*:?\s*([^\n,]+)/i);
    if (diseaseStressMatch) {
      result.hyperspectral_data.disease_stress_index = diseaseStressMatch[1].trim();
    }

    // Set severity based on text
    if (analysisText.toLowerCase().includes('high')) {
      result.severity_score = 8;
      result.recommendation.severity_level = 'High';
      result.recommendation.urgency = 'High';
    }

    console.log('Final parsed result:', result);

  } catch (error) {
    console.error('Error parsing analysis result:', error);
    // Return default structure if parsing fails
  }

  return result;
};

const DiseaseDetector: React.FC = () => {
  const { translateSync, currentLanguage } = useLanguage();
  const [mode, setMode] = useState<DetectorMode>('normal');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [parsedAnalysisResult, setParsedAnalysisResult] = useState<any | null>(null);
  const [analysisMetadata, setAnalysisMetadata] = useState<Metadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(currentLanguage.code);
  const [apiStatus, setApiStatus] = useState<string>('Checking API status...');
  const [timer, setTimer] = useState<number>(40);
  const videoRef = useRef<HTMLVideoElement>(null);

  const API_BASE_URL = 'https://krishi-rakshak-2.onrender.com';

  useEffect(() => {
    const checkAPIStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.status === 'healthy') {
          setApiStatus(`✅ API is healthy | Gemini Available: ${data.gemini_available}`);
        } else {
          setApiStatus('⚠ API is running but health check failed');
        }
      } catch (error) {
        console.error('API Status Error:', error);
        setApiStatus('❌ Cannot connect to API');
      }
    };
    checkAPIStatus();
    const interval = setInterval(checkAPIStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isAnalyzing) {
      setTimer(40);
      interval = setInterval(() => {
        setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAnalyzing]);

  const modeConfig = {
    normal: { icon: Brain, label: 'Normal', color: 'bg-primary' },
    advanced: { icon: Microscope, label: 'Advanced', color: 'bg-secondary' },
    hyperspectral: { icon: Scan, label: 'Hyperspectral', color: 'bg-accent' }
  };

  const handleCameraOpen = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access camera. Please ensure you have a camera and have granted permissions.");
    }
  };

  const handleCapturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "captured_image.png", { type: "image/png" });
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            handleCameraClose();
          }
        }, 'image/png');
      }
    }
  };

  const handleCameraClose = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.gif'] },
    multiple: false,
  });

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setAnalysisMetadata(null);

    const formData = new FormData();
    formData.append('image', selectedImage);
    // For advanced and hyperspectral modes, use 'other' if no crop is selected
    const cropType = selectedCrop ? selectedCrop.name : 'other';
    formData.append('crop_type', cropType);
    formData.append('language', languages.find(l => l.code === selectedLanguage)?.name || 'English');
    formData.append('use_ai', 'true');

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Could not parse error response', status: response.status }));
        console.error('Server Error Response:', errorData);
        throw new Error(errorData.detail || errorData.message || `Server error: ${response.status}. Please try again later.`);
      }

      const result = await response.json();

      if (result.success) {
        // Use the raw analysis string directly from AI
        setAnalysisResult(result.analysis);
        setParsedAnalysisResult(parseAnalysisResult(result.analysis));
        setAnalysisMetadata(result.metadata);
        console.log("Analysis Result:", result.analysis);
        console.log("Analysis Metadata:", result.metadata);
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetState = () => {
    setSelectedCrop(null);
    setSelectedImage(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setAnalysisMetadata(null);
    setError(null);
    setIsAnalyzing(false);
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 mb-6"
        >
          <motion.h1 
            className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
            animate={{ 
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Crop Disease Detection
          </motion.h1>
          <motion.p 
            className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Identify and diagnose crop diseases using advanced AI technology. Upload images of your crops to get instant analysis and treatment recommendations.
          </motion.p>
          <Badge variant="outline">{apiStatus}</Badge>
        </motion.div>

        <Card>
          <CardContent className="p-2 sm:p-3">
            <div className="flex justify-center space-x-0.5 sm:space-x-1">
              {Object.entries(modeConfig).map(([key, config]) => (
                <motion.button
                  key={key}
                  className={`relative px-2 sm:px-3 py-1.5 sm:py-2 rounded-md font-medium transition-all text-xs sm:text-sm ${
                    mode === key ? 'text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => {
                    setMode(key as DetectorMode);
                    resetState();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {mode === key && (
                    <motion.div
                      className={`absolute inset-0 rounded-md ${config.color}`}
                      layoutId="activeMode"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                  <div className="relative flex items-center space-x-1 sm:space-x-2">
                    <config.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{config.label}</span>
                    <span className="sm:hidden">{config.label.slice(0, 4)}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          {mode === 'normal' && !selectedCrop && (
            <motion.div
              key="crop-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Select the crop you are having issues with</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                    {crops.map((crop) => (
                      <motion.button
                        key={crop.id}
                        className="p-2 sm:p-3 border rounded-lg hover:border-primary transition-colors"
                        onClick={() => setSelectedCrop(crop)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="aspect-square rounded-lg overflow-hidden mb-2 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto">
                          {crop.image ? (
                            <img
                              src={crop.image}
                              alt={crop.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <Upload className="w-8 h-8 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-medium text-center text-xs sm:text-sm">{crop.name}</h3>
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {mode === 'normal' && selectedCrop && (
            <motion.div
              key="normal-analysis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center space-x-2">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={resetState}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <CardTitle className="text-primary">Upload Image</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent>
                                {languages.map(lang => (
                                    <SelectItem key={lang.code} value={lang.code}>
                                        <div className="flex items-center gap-2">
                                            <span>{lang.flag}</span>
                                            <span>{lang.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm">Drop images here or click to browse</p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleCameraOpen}
                      className="flex-1"
                    >
                      <CameraIcon className="w-4 h-4 mr-2" />
                      Open Camera
                    </Button>
                    {isCameraOpen && (
                      <Button
                        onClick={handleCapturePhoto}
                        className="flex-1"
                      >
                        📸 Capture
                      </Button>
                    )}
                  </div>

                  {isCameraOpen && (
                    <div className="relative flex justify-center">
                      <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg max-h-64 max-w-sm" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleCameraClose}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {previewUrl && (
                    <div className="relative flex justify-center">
                      <img src={previewUrl} alt="Preview" className="w-full rounded-lg max-h-64 max-w-sm object-cover" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <Button
                    onClick={handleAnalyze}
                    className="w-full"
                    disabled={!selectedImage || isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                        <span>🧠 Predicting...</span>
                      </div>
                    ) : (
                      <span>🧠 Predict</span>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">AI/ML Prediction Output</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isAnalyzing && <LoadingReport timer={timer} />}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive"
                    >
                      <h3 className="font-medium mb-2">Error</h3>
                      <p className="text-sm">{error}</p>
                    </motion.div>
                  )}
                  
                  {parsedAnalysisResult && analysisMetadata && !isAnalyzing && (
                    <AnalysisReport analysis={parsedAnalysisResult} metadata={analysisMetadata} mode={mode} />
                  )}

                  {!analysisResult && !error && !isAnalyzing && (
                    <div>
                      <h3 className="font-medium mb-3">Common {selectedCrop.name} Issues:</h3>
                      <div className="space-y-3">
                        {selectedCrop.diseases.length > 0 ? (
                          selectedCrop.diseases.map((disease, index) => (
                            <div key={index} className="flex space-x-3 p-3 border rounded-lg">
                              <img
                                src={disease.image}
                                alt={disease.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                              <div>
                                <h4 className="font-medium text-sm">{disease.name}</h4>
                                <p className="text-xs text-muted-foreground">{disease.description}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No common diseases data available for {selectedCrop.name}</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Advanced Mode */}
          {mode === 'advanced' && (
            <motion.div
              key="advanced-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6"
            >
              <Card className="border-secondary/20 bg-secondary/5">
                <CardHeader>
                  <CardTitle className="text-secondary">Advanced Crop Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Upload your crop images directly for advanced AI analysis
                  </div>
                  
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive ? 'border-secondary bg-secondary/5' : 'border-secondary/30 hover:border-secondary/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="mx-auto h-10 w-10 text-secondary mb-3" />
                    <p className="text-lg font-medium text-secondary">Drop crop images here or click to browse</p>
                    <p className="text-sm text-muted-foreground mt-2">Advanced analysis with detailed reports</p>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    Capture from camera:
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleCameraOpen}
                      className="flex-1 border-secondary/30 text-secondary hover:bg-secondary/10"
                    >
                      <CameraIcon className="w-4 h-4 mr-2" />
                      Open Camera
                    </Button>
                    {isCameraOpen && (
                      <Button
                        onClick={handleCapturePhoto}
                        className="flex-1 bg-secondary hover:bg-secondary/90"
                      >
                        📸 Capture
                      </Button>
                    )}
                  </div>


                  {isCameraOpen && (
                    <div className="relative">
                      <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg max-h-64" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-background/80"
                        onClick={handleCameraClose}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  {previewUrl && (
                    <div className="relative">
                      <img src={previewUrl} alt="Preview" className="w-full rounded-lg max-h-64 object-cover" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-background/80"
                        onClick={handleRemoveImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <Button
                    onClick={handleAnalyze}
                    className="w-full bg-secondary hover:bg-secondary/90"
                    disabled={!selectedImage || isAnalyzing}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Run Advanced Analysis'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-secondary/20 bg-secondary/5">
                <CardHeader>
                  <CardTitle className="text-secondary">Advanced Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {isAnalyzing && <LoadingReport timer={timer} />}
                  {parsedAnalysisResult && analysisMetadata && !isAnalyzing && (
                    <AnalysisReport analysis={parsedAnalysisResult} metadata={analysisMetadata} mode={mode} />
                  )}
                  {!analysisResult && !isAnalyzing && (
                    <p className="text-sm text-muted-foreground">Upload an image to see advanced analysis results</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Hyperspectral Mode */}
          {mode === 'hyperspectral' && (
            <motion.div
              key="hyperspectral-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-accent-foreground">Hyperspectral Imaging</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Upload hyperspectral images for specialized analysis
                  </div>
                  
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Scan className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Drop hyperspectral images here</p>
                    <p className="text-sm text-muted-foreground mt-2">No crop selection required</p>
                  </div>

                  {previewUrl && (
                    <div className="relative">
                      <img src={previewUrl} alt="Preview" className="w-full rounded-lg" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <Button
                    onClick={handleAnalyze}
                    className="w-full bg-accent hover:bg-accent/90"
                    disabled={!selectedImage || isAnalyzing}
                  >
                    {isAnalyzing ? 'Processing Hyperspectral Data...' : 'Analyze Hyperspectral Image'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-accent-foreground">Hyperspectral Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  {isAnalyzing && <LoadingReport timer={timer} />}
                  {analysisResult && analysisMetadata && !isAnalyzing && (
                    <AnalysisReport analysis={analysisResult} metadata={analysisMetadata} mode={mode} />
                  )}
                  {!analysisResult && !isAnalyzing && (
                    <p className="text-sm text-muted-foreground">Upload a hyperspectral image to see detailed spectral analysis</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default DiseaseDetector;
