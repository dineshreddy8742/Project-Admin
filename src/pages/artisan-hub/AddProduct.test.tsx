import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AddProduct from './AddProduct';
import { useLanguage } from '@/contexts/language-utils';
import { useToast } from '@/components/ui/use-toast';
import { artisanService } from '@/services/artisanService';
import { useSearchParams } from 'react-router-dom';

// Mock dependencies
vi.mock('@/contexts/language-utils', () => ({
  useLanguage: () => ({
    translateSync: (key: string) => key, // Simple mock: returns the key itself
    currentLanguage: { code: 'en' },
  }),
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/services/artisanService', () => ({
  artisanService: {
    getArtisanProduct: vi.fn(() => Promise.resolve({
      name: 'Test Product',
      price: 100,
      category: 'tools',
      description: 'Test Description',
      condition: 'excellent',
    })),
    createArtisanProduct: vi.fn(() => Promise.resolve()),
    updateArtisanProduct: vi.fn(() => Promise.resolve()),
    generateMarketingContent: vi.fn(() => Promise.resolve({
      description: 'AI Description',
      story: 'AI Story',
      socialMediaPosts: ['AI Post 1'],
    })),
    translateText: vi.fn((text) => Promise.resolve(`Translated ${text}`)),
    textToSpeech: vi.fn(() => Promise.resolve('base64audio')),
  },
}));

vi.mock('react-router-dom', () => ({
  useSearchParams: () => [
    new URLSearchParams(), // For no product ID
    vi.fn(),
  ],
}));

describe('AddProduct', () => {
  it('renders the Add New Product title when no product ID is provided', () => {
    render(<AddProduct />);
    expect(screen.getByText('Add New Product')).toBeInTheDocument();
  });

  it('renders the Edit Product title when a product ID is provided', async () => {
    // Mock useSearchParams to return a product ID
    vi.mocked(useSearchParams).mockReturnValueOnce([
      new URLSearchParams('id=123'),
      vi.fn(),
    ]);

    render(<AddProduct />);
    expect(await screen.findByText('Edit Product')).toBeInTheDocument();
    expect(artisanService.getArtisanProduct).toHaveBeenCalledWith('123');
  });

  it('displays artifact name input', () => {
    render(<AddProduct />);
    expect(screen.getByPlaceholderText('e.g., Vintage Brass Plow')).toBeInTheDocument();
  });

  it('displays price input', () => {
    render(<AddProduct />);
    expect(screen.getByPlaceholderText('15000')).toBeInTheDocument();
  });

  it('displays description textarea', () => {
    render(<AddProduct />);
    expect(screen.getByPlaceholderText('Describe your artifact, its history, condition, and unique features...')).toBeInTheDocument();
  });

  it('displays AI Marketing Assistant section', () => {
    render(<AddProduct />);
    expect(screen.getByText('AI Marketing Assistant')).toBeInTheDocument();
  });

  it('displays List Artifact button when no product ID is provided', () => {
    render(<AddProduct />);
    expect(screen.getByRole('button', { name: /List Artifact/i })).toBeInTheDocument();
  });

  it('displays Save Changes button when a product ID is provided', async () => {
    vi.mocked(useSearchParams).mockReturnValueOnce([
      new URLSearchParams('id=123'),
      vi.fn(),
    ]);
    render(<AddProduct />);
    expect(await screen.findByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
  });
});
