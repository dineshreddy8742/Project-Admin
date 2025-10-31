import { aiAssistantService } from './aiAssistantService';
// @ts-ignore
import schemesData from '@/lib/schemes.json';

export interface Scheme {
  id: string;
  name: string;
  category: string;
  subsidy: string;
  maxAmount: string;
  status: 'active' | 'closed';
  deadline: string;
  eligibility: string[];
  documents: string[];
  benefits: string[];
  applicationProcess: string[];
  description?: string;
  targetState?: string;
}

export interface HelpCenter {
  name: string;
  address: string;
  phone: string;
  distance: string;
  email?: string;
  services?: string[];
}

export interface SchemeSearchParams {
  query?: string;
  category?: string;
  state?: string;
  limit?: number;
}

class GovernmentSchemesService {
  private schemes: Scheme[] = [];

  constructor() {
    this.loadSchemesFromData();
  }

  private loadSchemesFromData() {
    this.schemes = schemesData.map((item: any, index: number) => ({
      id: `scheme_${index + 1}`,
      name: item.scheme_name,
      category: this.determineCategory(item.scheme_name, item.scheme_details),
      subsidy: this.extractSubsidy(item.scheme_details),
      maxAmount: this.extractMaxAmount(item.scheme_details),
      status: 'active' as const,
      deadline: 'Ongoing',
      eligibility: this.extractEligibility(item.target_beneficiary, item.scheme_details),
      documents: this.extractDocuments(item.scheme_details),
      benefits: this.extractBenefits(item.scheme_details),
      applicationProcess: this.extractApplicationProcess(item.scheme_details),
      description: item.scheme_details,
      targetState: item.geography
    }));
  }

  private determineCategory(name: string, details: string): string {
    const lowerName = name.toLowerCase();
    const lowerDetails = details.toLowerCase();

    if (lowerName.includes('kisan') || lowerName.includes('farmer')) return 'Farmer Support';
    if (lowerName.includes('insurance') || lowerName.includes('bima')) return 'Insurance';
    if (lowerName.includes('credit') || lowerName.includes('loan')) return 'Credit';
    if (lowerName.includes('irrigation') || lowerName.includes('water')) return 'Irrigation';
    if (lowerName.includes('seed') || lowerName.includes('planting')) return 'Seeds';
    if (lowerName.includes('soil') || lowerName.includes('health')) return 'Soil Health';
    if (lowerName.includes('organic') || lowerName.includes('paramparagat')) return 'Organic Farming';
    if (lowerName.includes('market') || lowerName.includes('nam')) return 'Market Access';
    if (lowerName.includes('pest') || lowerName.includes('disease')) return 'Pest Management';
    if (lowerName.includes('horticulture') || lowerName.includes('falbaug')) return 'Horticulture';

    return 'General Agriculture';
  }

  private extractSubsidy(details: string): string {
    if (details.toLowerCase().includes('100 per cent subsidy')) return '100%';
    if (details.toLowerCase().includes('subsidy')) return 'Up to 100%';
    return 'Varies';
  }

  private extractMaxAmount(details: string): string {
    // Extract amounts from details if available
    const amountMatch = details.match(/₹\s*[\d,]+(?:\s*lakh)?/i);
    return amountMatch ? amountMatch[0] : 'Varies';
  }

  private extractEligibility(beneficiary: string, details: string): string[] {
    const eligibility = [];

    if (beneficiary) {
      eligibility.push(`Target Beneficiary: ${beneficiary}`);
    }

    // Extract additional eligibility criteria from details
    if (details.toLowerCase().includes('small & marginal farmers')) {
      eligibility.push('Small and marginal farmers');
    }
    if (details.toLowerCase().includes('landholding')) {
      const landMatch = details.match(/landholding?\s*(?:up to|of)?\s*[\d.]+\s*ha?/i);
      if (landMatch) eligibility.push(landMatch[0]);
    }
    if (details.toLowerCase().includes('income upto')) {
      const incomeMatch = details.match(/income\s*(?:upto|up to)\s*₹?\s*[\d.]+\s*lakh?/i);
      if (incomeMatch) eligibility.push(incomeMatch[0]);
    }

    return eligibility.length > 0 ? eligibility : ['Farmers and agricultural stakeholders'];
  }

  private extractDocuments(details: string): string[] {
    // Common documents for agricultural schemes
    return [
      'Land documents/ownership proof',
      'Identity proof (Aadhaar/PAN)',
      'Bank account details',
      'Income certificate (if applicable)',
      'Caste certificate (if applicable)'
    ];
  }

  private extractBenefits(details: string): string[] {
    const benefits = [];

    if (details.toLowerCase().includes('financial assistance')) {
      benefits.push('Financial assistance for agricultural activities');
    }
    if (details.toLowerCase().includes('subsidy')) {
      benefits.push('Subsidy on agricultural inputs/equipment');
    }
    if (details.toLowerCase().includes('insurance')) {
      benefits.push('Crop insurance coverage');
    }
    if (details.toLowerCase().includes('credit')) {
      benefits.push('Easy credit access');
    }
    if (details.toLowerCase().includes('training')) {
      benefits.push('Capacity building and training');
    }
    if (details.toLowerCase().includes('pension')) {
      benefits.push('Pension benefits');
    }

    return benefits.length > 0 ? benefits : ['Agricultural support and development'];
  }

  private extractApplicationProcess(details: string): string[] {
    return [
      'Visit nearest agriculture office or online portal',
      'Submit required documents',
      'Fill application form',
      'Verification and approval',
      'Receive benefits/subsidy'
    ];
  }

  async fetchSchemes(params: SchemeSearchParams = {}): Promise<Scheme[]> {
    try {
      let filteredSchemes = [...this.schemes];

      // Filter by query
      if (params.query) {
        const query = params.query.toLowerCase();
        filteredSchemes = filteredSchemes.filter(scheme =>
          scheme.name.toLowerCase().includes(query) ||
          scheme.description?.toLowerCase().includes(query) ||
          scheme.category.toLowerCase().includes(query)
        );
      }

      // Filter by category
      if (params.category) {
        filteredSchemes = filteredSchemes.filter(scheme =>
          scheme.category.toLowerCase().includes(params.category!.toLowerCase())
        );
      }

      // Filter by state
      if (params.state) {
        filteredSchemes = filteredSchemes.filter(scheme =>
          scheme.targetState?.toLowerCase().includes(params.state!.toLowerCase())
        );
      }

      // Apply limit
      if (params.limit) {
        filteredSchemes = filteredSchemes.slice(0, params.limit);
      }

      return filteredSchemes;
    } catch (error) {
      console.error('Error fetching schemes:', error);
      throw new Error('Failed to fetch government schemes');
    }
  }

  async fetchHelpCenters(location?: string): Promise<HelpCenter[]> {
    // Mock help centers data - in a real implementation, this would come from a database or API
    const helpCenters: HelpCenter[] = [
      {
        name: "District Agriculture Office",
        address: "Agriculture Complex, Main Road, District HQ",
        phone: "+91-12345-67890",
        distance: "2.5 km",
        email: "dao@district.gov.in",
        services: ["Scheme Applications", "Crop Advisory", "Subsidy Claims"]
      },
      {
        name: "Krishi Vigyan Kendra",
        address: "Agricultural University Campus, Research Center",
        phone: "+91-12345-67891",
        distance: "5.2 km",
        email: "kvk@agriuni.edu.in",
        services: ["Technical Training", "Seed Distribution", "Equipment Demo"]
      },
      {
        name: "Common Service Center",
        address: "Village Panchayat Building, Block Office",
        phone: "+91-12345-67892",
        distance: "1.8 km",
        email: "csc@village.gov.in",
        services: ["Online Applications", "Document Processing", "Digital Services"]
      }
    ];

    return helpCenters;
  }

  async searchSchemesWithVoice(voiceQuery: string): Promise<Scheme[]> {
    try {
      const response = await aiAssistantService.executeTask(
        'default-session', // Session ID needs to be managed properly
        'gov_scheme_application',
        voiceQuery
      );

      const schemes: Scheme[] = response.actions.map((action: any) => ({
        id: action.summary || 'unknown',
        name: action.summary || 'Unknown Scheme',
        category: 'Unknown',
        subsidy: 'N/A',
        maxAmount: 'N/A',
        status: 'active',
        deadline: 'N/A',
        eligibility: [],
        documents: [],
        benefits: [action.summary],
        applicationProcess: [],
      }));

      return schemes;
    } catch (error) {
      console.error('Error processing voice query:', error);
      throw new Error('Failed to process voice query');
    }
  }

  async applyForScheme(schemeId: string, applicationData: any): Promise<{ success: boolean; applicationId?: string }> {
    try {
      const response = await aiAssistantService.executeTask(
        'default-session', // Session ID needs to be managed properly
        'gov_scheme_application',
        `apply for ${schemeId}`
      );

      return {
        success: true,
        applicationId: response.session_id,
      };
    } catch (error) {
      console.error('Error applying for scheme:', error);
      throw new Error('Failed to submit application');
    }
  }
}

export const governmentSchemesService = new GovernmentSchemesService();
