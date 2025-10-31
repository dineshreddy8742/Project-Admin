import React from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Shield, Leaf, TestTube, Microscope, Volume2, Droplets, Map, Brain, BarChart, Calendar, Clock, Info } from 'lucide-react';
import eventBus from '@/lib/eventBus';
import { Button } from './ui/button';

interface Metadata {
  crop_type: string;
  language: string;
  ai_source: string;
  confidence: string;
  timestamp: string;
}

interface AnalysisReportProps {
  analysis: any;
  metadata: Metadata;
  mode: 'normal' | 'advanced' | 'hyperspectral';
}

import { Markdown } from './Markdown';

const Section: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <AccordionItem value={title} className="border-b-0 mb-2 bg-white rounded-lg shadow-sm">
    <AccordionTrigger className="hover:bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <span className="font-semibold text-xl text-gray-800">{title}</span>
        </div>
    </AccordionTrigger>
    <AccordionContent className="prose prose-lg max-w-none p-6 bg-white rounded-b-lg">
      {typeof children === 'string' ? <Markdown content={children} /> : children}
    </AccordionContent>
  </AccordionItem>
);



const parseAnalysisString = (analysisString: string) => {
  if (!analysisString || typeof analysisString !== 'string') {
    return null;
  }

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
    // Extract disease name - try multiple patterns
    let diseaseMatch = analysisString.match(/This is a .* disease called ([^\.]+)\./i);
    if (!diseaseMatch) {
      diseaseMatch = analysisString.match(/disease called ([^\.]+)\./i);
    }
    if (!diseaseMatch) {
      diseaseMatch = analysisString.match(/DISEASE ASSESSMENT[\s\S]*?([^\n]+)[\s\S]*?This is/i);
    }
    if (!diseaseMatch) {
      // Try to find any disease name in the text
      diseaseMatch = analysisString.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*) disease/i);
    }
    if (diseaseMatch) {
      result.recommendation.title = diseaseMatch[1].trim();
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
      const descMatch = analysisString.match(pattern);
      if (descMatch && descMatch[1].trim()) {
        result.recommendation.description = descMatch[1].trim();
        break;
      }
    }

    if (!result.recommendation.description) {
      // Fallback: use the entire text as description
      result.recommendation.description = analysisString;
    }

    // Extract treatment section
    const treatmentPatterns = [
      /TREATMENT RECOMMENDATIONS([\s\S]*?)(?:For immediate actions|PREVENTION GUIDANCE)/i,
      /TREATMENT([\s\S]*?)(?:For immediate actions|PREVENTION GUIDANCE)/i,
      /TREATMENT RECOMMENDATIONS([\s\S]*?)$/i,
      /TREATMENT([\s\S]*?)$/i
    ];

    for (const pattern of treatmentPatterns) {
      const treatmentMatch = analysisString.match(pattern);
      if (treatmentMatch && treatmentMatch[1].trim()) {
        result.recommendation.treatment = treatmentMatch[1].trim();
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
      const nextStepsMatch = analysisString.match(pattern);
      if (nextStepsMatch && nextStepsMatch[1].trim()) {
        result.recommendation.next_steps = [nextStepsMatch[1].trim()];
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
      const preventionMatch = analysisString.match(pattern);
      if (preventionMatch && preventionMatch[1].trim()) {
        result.recommendation.advanced_treatment = preventionMatch[1].trim();
        break;
      }
    }

    // Try to extract hyperspectral data if present
    const chlorophyllMatch = analysisString.match(/Chlorophyll[^:]*:?\s*([^\n,]+)/i);
    if (chlorophyllMatch) {
      result.hyperspectral_data.chlorophyll_content = chlorophyllMatch[1].trim();
    }

    const waterStressMatch = analysisString.match(/Water Stress[^:]*:?\s*([^\n,]+)/i);
    if (waterStressMatch) {
      result.hyperspectral_data.water_stress = waterStressMatch[1].trim();
    }

    const nutrientMatch = analysisString.match(/Nutrient Deficiency[^:]*:?\s*([^\n,]+)/i);
    if (nutrientMatch) {
      result.hyperspectral_data.nutrient_deficiency = nutrientMatch[1].trim();
    }

    const diseaseStressMatch = analysisString.match(/Disease Stress Index[^:]*:?\s*([^\n,]+)/i);
    if (diseaseStressMatch) {
      result.hyperspectral_data.disease_stress_index = diseaseStressMatch[1].trim();
    }

    // Set severity based on text
    if (analysisString.toLowerCase().includes('high')) {
      result.severity_score = 8;
      result.recommendation.severity_level = 'High';
      result.recommendation.urgency = 'High';
    }

  } catch (error) {
    console.error('Error parsing analysis result:', error);
    // Return default structure if parsing fails
  }

  return result;
};

const AnalysisReport: React.FC<AnalysisReportProps> = ({ analysis, metadata, mode }) => {
  const parsedAnalysis = typeof analysis === 'string' ? parseAnalysisString(analysis) : analysis;

  const handleSpeak = () => {
    let textToSpeak = parsedAnalysis?.recommendation?.description || "No description available";
    console.log("Dispatching speak event with text:", textToSpeak);
    eventBus.dispatch("speak", textToSpeak);
  };

  const getConfidenceValue = (confidence: string) => {
    const confidenceMap: { [key: string]: number } = {
      'low': 0.3,
      'medium': 0.6,
      'high': 0.9,
      'very high': 0.95
    };
    return confidenceMap[confidence.toLowerCase()] || parseFloat(confidence) || 0.8;
  };

  const renderNormalReport = () => {
    if (typeof analysis === 'string') {
      return (
        <Accordion type="multiple" defaultValue={["AI Analysis Report"]} className="w-full space-y-3">
          <Section title="AI Analysis Report" icon={Brain}>{analysis}</Section>
        </Accordion>
      );
    }
    return (
      <Accordion type="multiple" defaultValue={["Disease", "Description", "Treatment"]} className="w-full space-y-3">
        <Section title="Disease" icon={TestTube}>{analysis?.recommendation?.title || "Disease analysis not available"}</Section>
        <Section title="Description" icon={Info}>{analysis?.recommendation?.description || "Description not available"}</Section>
        <Section title="Treatment" icon={Shield}>{analysis?.recommendation?.treatment || "Treatment information not available"}</Section>
        <Section title="Next Steps" icon={CheckCircle}><ul>{analysis?.recommendation?.next_steps?.map((step: string, i: number) => <li key={i}>{step}</li>) || <li>No next steps available</li>}</ul></Section>
      </Accordion>
    );
  };

  const renderAdvancedReport = () => (
    <Accordion type="multiple" defaultValue={["Disease", "Description", "Treatment", "Severity Score", "Detailed Treatment"]} className="w-full space-y-3">
      <Section title="Disease" icon={TestTube}>{analysis?.recommendation?.title || "Disease analysis not available"}</Section>
      <Section title="Description" icon={Info}>{analysis?.recommendation?.description || "Description not available"}</Section>
      <Section title="Treatment" icon={Shield}>{analysis?.recommendation?.treatment || "Treatment information not available"}</Section>
      <Section title="Detailed Treatment" icon={Shield}>{analysis?.recommendation?.advanced_treatment || "Advanced treatment information not available"}</Section>
      <Section title="Severity Score" icon={Leaf}>{`${analysis?.severity_score || 0}/10`}</Section>
      <Section title="Hyperspectral Data" icon={BarChart}>
        <div className="grid grid-cols-2 gap-4">
          <div><strong>Chlorophyll:</strong> {analysis?.hyperspectral_data?.chlorophyll_content || "N/A"}</div>
          <div><strong>Water Stress:</strong> {analysis?.hyperspectral_data?.water_stress || "N/A"}</div>
          <div><strong>Nutrient Deficiency:</strong> {analysis?.hyperspectral_data?.nutrient_deficiency || "N/A"}</div>
          <div><strong>Disease Stress Index:</strong> {analysis?.hyperspectral_data?.disease_stress_index || "N/A"}</div>
        </div>
      </Section>
      <Section title="Next Steps" icon={CheckCircle}><ul>{analysis?.recommendation?.next_steps?.map((step: string, i: number) => <li key={i}>{step}</li>) || <li>No next steps available</li>}</ul></Section>
      {analysis?.actions?.find((a: any) => a.action === 'schedule_followup') && (
        <Section title="Follow-up Schedule" icon={Calendar}>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>{analysis.actions.find((a: any) => a.action === 'schedule_followup').message}</span>
          </div>
        </Section>
      )}
    </Accordion>
  );

  const renderHyperspectralReport = () => (
    <Accordion type="multiple" defaultValue={["Chlorophyll Content", "Water Stress", "Nutrient Deficiency", "Analysis", "Confidence Map"]} className="w-full space-y-3">
      <Section title="Spectral Analysis" icon={Brain}>{analysis?.spectral_analysis || "Spectral analysis not available"}</Section>
      <Section title="Hyperspectral Data" icon={BarChart}>
        <div className="grid grid-cols-2 gap-4">
          <div><strong>Chlorophyll:</strong> {analysis?.hyperspectral_data?.chlorophyll_content || "N/A"}</div>
          <div><strong>Water Stress:</strong> {analysis?.hyperspectral_data?.water_stress || "N/A"}</div>
          <div><strong>Nutrient Deficiency:</strong> {analysis?.hyperspectral_data?.nutrient_deficiency || "N/A"}</div>
          <div><strong>Disease Stress Index:</strong> {analysis?.hyperspectral_data?.disease_stress_index || "N/A"}</div>
          <div><strong>Photosynthetic Efficiency:</strong> {analysis?.hyperspectral_data?.photosynthetic_efficiency || "N/A"}</div>
          <div><strong>Leaf Temperature:</strong> {analysis?.hyperspectral_data?.leaf_temperature || "N/A"}</div>
          <div><strong>Stomatal Conductance:</strong> {analysis?.hyperspectral_data?.stomatal_conductance || "N/A"}</div>
          <div><strong>NDVI:</strong> {analysis?.hyperspectral_data?.ndvi || "N/A"}</div>
          <div><strong>PRI:</strong> {analysis?.hyperspectral_data?.pri || "N/A"}</div>
          <div><strong>ARI:</strong> {analysis?.hyperspectral_data?.ari || "N/A"}</div>
          <div><strong>CRI:</strong> {analysis?.hyperspectral_data?.cri || "N/A"}</div>
        </div>
      </Section>
      <Section title="Confidence Map" icon={Map}><img src={analysis?.confidence_map_url || ""} alt="Confidence Map" className="rounded-lg shadow-md" /></Section>
      <Section title="Spectral Recommendations" icon={Shield}>
        <ul className="list-disc list-inside">
          {analysis?.recommendations?.map((rec: any, index: number) => (
            <li key={index}><strong>{rec.type}:</strong> {rec.action} (Priority: {rec.priority})</li>
          )) || <li>No recommendations available</li>}
        </ul>
      </Section>
      {analysis?.actions?.find((a: any) => a.action === 'spectral_monitoring_schedule') && (
        <Section title="Spectral Monitoring Schedule" icon={Calendar}>
          <ul className="list-disc list-inside">
            {analysis.actions.find((a: any) => a.action === 'spectral_monitoring_schedule').schedule.map((item: any, index: number) => (
              <li key={index}>{item.day}: {item.type}</li>
            ))}
          </ul>
        </Section>
      )}
    </Accordion>
  );

  const renderReport = () => {
    switch (mode) {
      case 'advanced':
        return renderAdvancedReport();
      case 'hyperspectral':
        return renderHyperspectralReport();
      default:
        return renderNormalReport();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-4 bg-gray-50 rounded-lg"
    >
      <Alert className="bg-blue-100 border-blue-300 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-blue-700" />
          <AlertTitle className="text-blue-900 ml-3 font-semibold">Analysis Complete!</AlertTitle>
        </div>
        <Button onClick={handleSpeak} size="icon" variant="ghost" className="text-blue-700 hover:bg-blue-200">
          <Volume2 className="h-6 w-6" />
        </Button>
      </Alert>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-white rounded-lg border shadow-sm">
              <p className="text-md text-gray-500">Crop</p>
              <p className="font-bold text-xl text-gray-800">{metadata.crop_type}</p>
          </div>
          <div className="p-4 bg-white rounded-lg border shadow-sm">
              <p className="text-md text-gray-500">Confidence</p>
              <Badge className="mt-1 text-lg" variant={getConfidenceValue(metadata.confidence) > 0.9 ? 'default' : 'secondary'}>{(getConfidenceValue(metadata.confidence) * 100).toFixed(0)}%</Badge>
          </div>
          {parsedAnalysis && parsedAnalysis.severity_score && (
            <div className="p-4 bg-white rounded-lg border shadow-sm">
                <p className="text-md text-gray-500">Severity</p>
                <p className="font-bold text-xl text-gray-800">{parsedAnalysis.severity_score}/10</p>
            </div>
          )}
          {parsedAnalysis && parsedAnalysis.recommendation && (
            <div className="p-4 bg-white rounded-lg border shadow-sm">
                <p className="text-md text-gray-500">Urgency</p>
                <Badge className="mt-1 text-lg" variant={parsedAnalysis.recommendation.severity_level === 'High' ? 'destructive' : 'default'}>{parsedAnalysis.recommendation.urgency}</Badge>
            </div>
          )}
      </div>

      {renderReport()}

      <div className="text-sm text-gray-500 text-center pt-4">
        Report generated at {new Date(metadata.timestamp).toLocaleString()}
      </div>
    </motion.div>
  );
};

export default AnalysisReport;
