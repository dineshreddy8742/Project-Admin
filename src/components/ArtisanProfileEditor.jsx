import React, { useState, useEffect } from 'react';
import ArtisanProfile from './ArtisanProfile';
import { Button } from './ui/button';
import Input from './ui/Input';
import Textarea from './ui/textarea';
import ImageUpload from './ImageUpload';
import { artisanService } from '../services/artisanService';

const defaultArtisan = {
  profileImage: '',
  name: '',
  location: '',
  craftSpecialization: '',
  yearsExperience: '',
  bio: '',
  trustScore: 94,
  totalProducts: 0,
  totalReviews: 0,
  verificationBadges: ['Verified Artisan'],
};

const ARTISAN_ID = 'test-artisan-1'; // Replace with real user id as needed

const ArtisanProfileEditor = () => {
  const [profile, setProfile] = useState(defaultArtisan);
  const [editMode, setEditMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle/saving/saved/error/loading

  // Load profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setStatus('loading');
      try {
        const data = await artisanService.getArtisanProfile(ARTISAN_ID);
        setProfile({ ...defaultArtisan, ...data });
        setStatus('idle');
      } catch (err) {
        setStatus('error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
    // Note: eventually get current artisan ID from auth context
  }, []);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  // Save/upsert profile
  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('saving');
    try {
      await artisanService.updateArtisanProfile(ARTISAN_ID, profile);
      setEditMode(false);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // AI improved bio generator (unchanged, can plug real endpoint later)
  const generateAIBio = async () => {
    setIsLoading(true);
    setStatus('loading');
    const prompt = `Rewrite and enhance this artisan biography to be warm, inviting, and highlight traditional craftsmanship.\nBio: ${profile.bio}\nCraft: ${profile.craftSpecialization}`;
    try {
      const response = await fetch('/api/artisan/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType: 'story', customPrompt: prompt }),
      });
      const data = await response.json();
      if (data.generated_text) {
        setProfile({ ...profile, bio: data.generated_text });
      }
      setStatus('idle');
    } catch (e) {
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 lg:p-8 shadow-warm-md mb-8">
      <h2 className="text-2xl font-bold mb-6">Edit My Story / Profile</h2>

      {/* Feedback bar */}
      {status === 'loading' && <div className="mb-4 text-blue-700">Loading profile...</div>}
      {status === 'saving' && <div className="mb-4 text-blue-700">Saving...</div>}
      {status === 'saved' && <div className="mb-4 text-green-600">Profile saved!</div>}
      {status === 'error' && <div className="mb-4 text-red-600">Error loading or saving. Please try again.</div>}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form Fields */}
        <form className="flex-1 space-y-4" onSubmit={handleSave}>
          <div className="mb-2">
            <ImageUpload value={profile.profileImage} onChange={file => handleChange('profileImage', file)} />
          </div>
          <Input label="Name" value={profile.name} onChange={e => handleChange('name', e.target.value)} required />
          <Input label="Location" value={profile.location} onChange={e => handleChange('location', e.target.value)} required />
          <Input label="Craft Specialization" value={profile.craftSpecialization} onChange={e => handleChange('craftSpecialization', e.target.value)} required />
          <Input label="Years of Experience" type="number" value={profile.yearsExperience} onChange={e => handleChange('yearsExperience', e.target.value)} required />
          <Textarea label="Bio / Story" value={profile.bio} onChange={e => handleChange('bio', e.target.value)} rows={5} required />
          <div className="flex flex-col gap-y-2 sm:flex-row sm:gap-x-3">
            <Button type="button" onClick={generateAIBio} disabled={isLoading} loading={isLoading}>
              Improve My Story with AI
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>Save</Button>
            <Button type="button" variant="secondary" onClick={() => setEditMode(!editMode)}>
              {editMode ? 'Preview' : 'Edit'}
            </Button>
          </div>
        </form>

        {/* Preview Section */}
        {!editMode && (
          <div className="flex-1">
            <ArtisanProfile artisan={profile} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtisanProfileEditor;
