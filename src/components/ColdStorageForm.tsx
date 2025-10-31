import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { useToast } from './ui/use-toast';
import eventBus from '@/lib/eventBus';
import { apiService } from '@/services/apiService';
import { useLanguage } from '@/contexts/language-utils';

import { Snowflake, MapPin, Phone, Calendar, User } from 'lucide-react';

interface ColdStorageFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ColdStorageForm: React.FC<ColdStorageFormProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const { currentLanguage } = useLanguage();
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    farmerName: '',
    farmLocation: '',
    phoneNumber: '',
    email: '',
    farmSize: '',
    produceType: '',
    estimatedQuantity: '',
    preferredDuration: '',
    nearestFacility: '',
    specialRequirements: '',
    agreedToTerms: false
  });

  const handleInputChange = useCallback((field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionId) {
      toast({
        title: "Error",
        description: "Session not ready. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.agreedToTerms) {
      toast({
        title: "Terms & Conditions",
        description: "Please agree to the terms and conditions to proceed.",
        variant: "destructive"
      });
      return;
    }

    try {
      const userInput = `Book cold storage for ${formData.produceType}, quantity ${formData.estimatedQuantity} for ${formData.preferredDuration}. Farmer: ${formData.farmerName}, Location: ${formData.farmLocation}`;
      
      await apiService.executeTask(
        sessionId,
        'cold_storage_booking',
        userInput,
        null
      );

      toast({
        title: "Registration Successful! ✅",
        description: `Your cold storage request has been submitted. We'll contact you within 24 hours.`,
        duration: 5000
      });

      // Reset form and close
      setFormData({
        farmerName: '',
        farmLocation: '',
        phoneNumber: '',
        email: '',
        farmSize: '',
        produceType: '',
        estimatedQuantity: '',
        preferredDuration: '',
        nearestFacility: '',
        specialRequirements: '',
        agreedToTerms: false
      });
      onClose();

    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "An error occurred.",
        variant: "destructive"
      });
    }
  }, [sessionId, formData, toast, onClose, currentLanguage.code]);

  useEffect(() => {
    if (isOpen) {
      const initSession = async () => {
        try {
          const sessionData = await apiService.startSession('user-cold-storage', currentLanguage.code);
          setSessionId(sessionData.session_id);
          eventBus.dispatch('cold-storage-form-ready');
        } catch (error) {
          toast({
            title: "Error",
            description: "Could not connect to the agent.",
            variant: "destructive"
          });
        }
      };
      initSession();
    }
  }, [isOpen, currentLanguage.code, toast]);

  const handleAutofill = useCallback(({ field, value }: { field: string, value: string | boolean }) => {
    handleInputChange(field, value);
  }, [handleInputChange]);

  const handleSubmitForm = useCallback(() => {
    const syntheticEvent = {
      preventDefault: () => {},
    } as React.FormEvent;
    handleSubmit(syntheticEvent);
  }, [handleSubmit]);

  const handleClickElement = useCallback(({ target }: { target: string }) => {
    if (target === 'register button') {
      handleSubmitForm();
    }
  }, [handleSubmitForm]);

  useEffect(() => {
    eventBus.on('autofill-field', handleAutofill);
    eventBus.on('submit-form', handleSubmitForm);
    eventBus.on('click-element', handleClickElement);

    return () => {
      eventBus.remove('autofill-field', handleAutofill);
      eventBus.remove('submit-form', handleSubmitForm);
      eventBus.remove('click-element', handleClickElement);
    };
  }, [handleAutofill, handleSubmitForm, handleClickElement]);
  

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-background rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Snowflake className="h-8 w-8 text-blue-600" />
                <div>
                  <CardTitle className="text-2xl text-primary">Cold Storage Registration</CardTitle>
                  <p className="text-muted-foreground">Register for accessible cold storage facilities</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                ×
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="farmerName">Full Name *</Label>
                    <Input
                      id="farmerName"
                      value={formData.farmerName}
                      onChange={(e) => handleInputChange('farmerName', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com (optional)"
                  />
                </div>
              </div>

              {/* Farm Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Farm Details
                </h3>
                
                <div>
                  <Label htmlFor="farmLocation">Farm Location *</Label>
                  <Input
                    id="farmLocation"
                    value={formData.farmLocation}
                    onChange={(e) => handleInputChange('farmLocation', e.target.value)}
                    placeholder="Village, Taluk, District, State"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="farmSize">Farm Size (Acres) *</Label>
                    <Input
                      id="farmSize"
                      value={formData.farmSize}
                      onChange={(e) => handleInputChange('farmSize', e.target.value)}
                      placeholder="e.g., 5 acres"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="produceType">Primary Produce Type *</Label>
                    <Select onValueChange={(value) => handleInputChange('produceType', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select produce type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vegetables">🥦 Vegetables</SelectItem>
                        <SelectItem value="fruits">🍎 Fruits</SelectItem>
                        <SelectItem value="grains">🌾 Grains</SelectItem>
                        <SelectItem value="herbs">🌿 Herbs & Spices</SelectItem>
                        <SelectItem value="mixed">🌱 Mixed Produce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              

              {/* Storage Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <Snowflake className="h-5 w-5" />
                  Storage Requirements
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estimatedQuantity">Estimated Quantity *</Label>
                    <Input
                      id="estimatedQuantity"
                      value={formData.estimatedQuantity}
                      onChange={(e) => handleInputChange('estimatedQuantity', e.target.value)}
                      placeholder="e.g., 500 kg, 2 tons"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="preferredDuration">Storage Duration *</Label>
                    <Select onValueChange={(value) => handleInputChange('preferredDuration', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-week">1 Week</SelectItem>
                        <SelectItem value="2-weeks">2 Weeks</SelectItem>
                        <SelectItem value="1-month">1 Month</SelectItem>
                        <SelectItem value="2-months">2 Months</SelectItem>
                        <SelectItem value="3-months">3 Months</SelectItem>
                        <SelectItem value="6-months">6 Months</SelectItem>
                        <SelectItem value="custom">Custom Duration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="nearestFacility">Preferred Cold Storage Facility</Label>
                  <Select onValueChange={(value) => handleInputChange('nearestFacility', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose nearest facility (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bangalore">Bangalore Cold Storage Hub</SelectItem>
                      <SelectItem value="mysore">Mysore Agri Cold Chain</SelectItem>
                      <SelectItem value="hubli">Hubli Farmer Storage Center</SelectItem>
                      <SelectItem value="mangalore">Mangalore Coastal Storage</SelectItem>
                      <SelectItem value="any">Any Available Facility</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="specialRequirements">Special Requirements</Label>
                  <Textarea
                    id="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                    placeholder="Any specific temperature, humidity, or handling requirements..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Terms and Submit */}
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreedToTerms}
                    onCheckedChange={(checked) => handleInputChange('agreedToTerms', checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    I agree to the terms and conditions, and understand that storage charges will be based on space used and duration. I consent to receiving SMS alerts and updates about my stored produce.
                  </Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Snowflake className="h-4 w-4 mr-2" />
                    Register for Cold Storage
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};