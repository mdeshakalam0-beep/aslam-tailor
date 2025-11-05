import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { UserMeasurements } from '@/types/checkout';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { getMeasurementTypes, MeasurementType } from '@/utils/measurementTypes'; // Import getMeasurementTypes and MeasurementType

interface ProductMeasurementSelectorProps {
  session: Session | null;
  isActive: boolean;
  onToggle: (isActive: boolean) => void;
  isDisabled: boolean;
}

// Define a mapping from UserMeasurements keys to friendly labels and input types
const measurementFieldConfig: Record<keyof UserMeasurements, { label: string; type: 'number' | 'text' | 'select' | 'textarea'; options?: string[] }> = {
  ladies_size: { label: 'Ladies\' Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'] },
  men_shirt_length: { label: 'Shirt Length (inches)', type: 'number' },
  men_shirt_chest: { label: 'Shirt Chest (inches)', type: 'number' },
  men_shirt_waist: { label: 'Shirt Waist (inches)', type: 'number' },
  men_shirt_sleeve_length: { label: 'Shirt Sleeve Length (inches)', type: 'number' },
  men_shirt_shoulder: { label: 'Shirt Shoulder (inches)', type: 'number' },
  men_shirt_neck: { label: 'Shirt Neck (inches)', type: 'number' },
  men_pant_length: { label: 'Pant Length (inches)', type: 'number' },
  men_pant_waist: { label: 'Pant Waist (inches)', type: 'number' },
  men_pant_hip: { label: 'Pant Hip (inches)', type: 'number' },
  men_pant_thigh: { label: 'Pant Thigh (inches)', type: 'number' },
  men_pant_bottom: { label: 'Pant Bottom (inches)', type: 'number' },
  men_coat_length: { label: 'Coat Length (inches)', type: 'number' },
  men_coat_chest: { label: 'Coat Chest (inches)', type: 'number' },
  men_coat_waist: { label: 'Coat Waist (inches)', type: 'number' },
  men_coat_sleeve_length: { label: 'Coat Sleeve Length (inches)', type: 'number' },
  men_coat_shoulder: { label: 'Coat Shoulder (inches)', type: 'number' },
  notes: { label: 'Additional Notes / Specific Instructions', type: 'textarea' },
  // These fields are not for user input in this form, but are part of UserMeasurements
  id: { label: 'ID', type: 'text' },
  user_id: { label: 'User ID', type: 'text' },
  measurement_type: { label: 'Measurement Type', type: 'text' },
  updated_at: { label: 'Updated At', type: 'text' },
};

// Define all possible measurement fields from UserMeasurements with friendly labels and groups
const allMeasurementFields: Array<{ key: keyof UserMeasurements; label: string; group: string }> = [
  { key: 'ladies_size', label: 'Ladies\' Size', group: 'Women' },
  { key: 'men_shirt_length', label: 'Shirt Length', group: 'Men - Shirt/Kurta/Bandi' },
  { key: 'men_shirt_chest', label: 'Shirt Chest', group: 'Men - Shirt/Kurta/Bandi' },
  { key: 'men_shirt_waist', label: 'Shirt Waist', group: 'Men - Shirt/Kurta/Bandi' },
  { key: 'men_shirt_sleeve_length', label: 'Shirt Sleeve Length', group: 'Men - Shirt/Kurta/Bandi' },
  { key: 'men_shirt_shoulder', label: 'Shirt Shoulder', group: 'Men - Shirt/Kurta/Bandi' },
  { key: 'men_shirt_neck', label: 'Shirt Neck', group: 'Men - Shirt/Kurta/Bandi' },
  { key: 'men_pant_length', label: 'Pant Length', group: 'Men - Pant/Paijama' },
  { key: 'men_pant_waist', label: 'Pant Waist', group: 'Men - Pant/Paijama' },
  { key: 'men_pant_hip', label: 'Pant Hip', group: 'Men - Pant/Paijama' },
  { key: 'men_pant_thigh', label: 'Pant Thigh', group: 'Men - Pant/Paijama' },
  { key: 'men_pant_bottom', label: 'Pant Bottom', group: 'Men - Pant/Paijama' },
  { key: 'men_coat_length', label: 'Coat Length', group: 'Men - Coat/Washcoat/Bajezar' },
  { key: 'men_coat_chest', label: 'Coat Chest', group: 'Men - Coat/Washcoat/Bajezar' },
  { key: 'men_coat_waist', label: 'Coat Waist', group: 'Men - Coat/Washcoat/Bajezar' },
  { key: 'men_coat_sleeve_length', label: 'Coat Sleeve Length', group: 'Men - Coat/Washcoat/Bajezar' },
  { key: 'men_coat_shoulder', label: 'Coat Shoulder', group: 'Men - Coat/Washcoat/Bajezar' },
  { key: 'notes', label: 'Additional Notes', group: 'General' },
];


const ProductMeasurementSelector: React.FC<ProductMeasurementSelectorProps> = ({ session, isActive, onToggle, isDisabled }) => {
  const [currentMeasurements, setCurrentMeasurements] = useState<UserMeasurements | undefined>(undefined);
  const [selectedMeasurementTypeId, setSelectedMeasurementTypeId] = useState<string | undefined>(undefined);
  const [currentMeasurementType, setCurrentMeasurementType] = useState<MeasurementType | undefined>(undefined);
  const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>([]);
  const [formValues, setFormValues] = useState<Partial<UserMeasurements>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTypes = async () => {
      const types = await getMeasurementTypes();
      setMeasurementTypes(types);
    };
    fetchTypes();
  }, []);

  const fetchUserMeasurements = async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch user's gender from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('gender')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        throw profileError;
      }
      const userGender = profileData.gender || 'not_specified';

      // Fetch user's most recent measurements
      const { data: measurementsData, error: fetchError } = await supabase
        .from('measurements')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false }) // Order by most recent
        .limit(1) // Get only one result
        .maybeSingle(); // Use maybeSingle after limiting to 1

      if (fetchError) {
        throw fetchError;
      }

      if (measurementsData) {
        setCurrentMeasurements(measurementsData as UserMeasurements);
        // Initialize form values from fetched measurements
        const initialFormValues: Partial<UserMeasurements> = {};
        for (const key in measurementsData) {
          if (Object.prototype.hasOwnProperty.call(measurementsData, key)) {
            initialFormValues[key as keyof UserMeasurements] = measurementsData[key as keyof UserMeasurements];
          }
        }
        setFormValues(initialFormValues);

        // Find the measurement type by name
        const type = measurementTypes.find(t => t.name === measurementsData.measurement_type);
        setSelectedMeasurementTypeId(type?.id || undefined);
      } else {
        setCurrentMeasurements(undefined);
        setFormValues({});
        // Set default measurement type based on user gender if no measurements exist
        const defaultType = measurementTypes.find(type => type.name.toLowerCase().includes(userGender));
        setSelectedMeasurementTypeId(defaultType?.id || undefined);
      }
    } catch (err) {
      console.error('Error fetching user data or measurements:', err);
      setError('Failed to load measurements. Please try again.');
      showError('Failed to load measurements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (measurementTypes.length > 0) { // Only fetch measurements once types are loaded
      fetchUserMeasurements();
    }
  }, [session, measurementTypes]);

  useEffect(() => {
    if (selectedMeasurementTypeId) {
      const type = measurementTypes.find(t => t.id === selectedMeasurementTypeId);
      setCurrentMeasurementType(type);
    } else {
      setCurrentMeasurementType(undefined);
    }
  }, [selectedMeasurementTypeId, measurementTypes]);

  const handleInputChange = (key: keyof UserMeasurements, value: string | number | boolean | null) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveMeasurements = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session?.user) {
      showError('You must be logged in to save measurements.');
      return;
    }
    if (!selectedMeasurementTypeId) {
      showError('Please select a measurement type.');
      return;
    }

    setSaving(true);
    try {
      const updates: Partial<UserMeasurements> = {
        user_id: session.user.id,
        measurement_type: currentMeasurementType?.name || null,
        updated_at: new Date().toISOString(),
      };

      currentMeasurementType?.relevant_fields.forEach(fieldKey => {
        const config = measurementFieldConfig[fieldKey];
        if (config) {
          let value = formValues[fieldKey];
          if (config.type === 'number') {
            updates[fieldKey] = value ? parseFloat(value as string) : null;
          } else if (config.type === 'text' || config.type === 'select' || config.type === 'textarea') {
            updates[fieldKey] = (value as string)?.trim() || null;
          } else {
            updates[fieldKey] = value;
          }
        }
      });

      // Ensure notes are always included if present in formValues, even if not explicitly in relevant_fields
      if (formValues.notes !== undefined) {
        updates.notes = (formValues.notes as string)?.trim() || null;
      }

      // Update user's gender in profiles table based on selected measurement type
      if (currentMeasurementType?.name && session.user) {
        const genderToSet = currentMeasurementType.name.toLowerCase().includes('men') ? 'men' :
                           currentMeasurementType.name.toLowerCase().includes('women') || currentMeasurementType.name.toLowerCase().includes('ladies') ? 'women' : 'not_specified';
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ gender: genderToSet })
          .eq('id', session.user.id);
        if (profileUpdateError) throw profileUpdateError;
      }

      let error;
      if (currentMeasurements?.id) {
        const { error: updateError } = await supabase
          .from('measurements')
          .update(updates)
          .eq('id', currentMeasurements.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('measurements')
          .insert(updates);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      showSuccess('Measurements saved successfully!');
      fetchUserMeasurements();
    } catch (err) {
      console.error('Failed to save measurements:', err);
      showError('Failed to save measurements.');
    } finally {
      setSaving(false);
    }
  };

  const renderCurrentMeasurementsSummary = () => {
    if (!currentMeasurements || !currentMeasurementType || !currentMeasurementType.relevant_fields) return null;

    const displayedFields = currentMeasurementType.relevant_fields.filter(key => key !== 'notes'); // Notes handled separately

    if (displayedFields.length === 0 && !currentMeasurements.notes) return null;

    return (
      <div className="text-sm text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1">
        {displayedFields.map((fieldKey, idx) => {
          const config = measurementFieldConfig[fieldKey];
          const value = currentMeasurements[fieldKey];
          if (value === null || value === undefined) return null;
          return (
            <p key={idx}><span className="font-semibold">{config?.label || fieldKey}:</span> {value} {config?.type === 'number' ? 'in' : ''}</p>
          );
        })}
      </div>
    );
  };

  const renderMeasurementInputs = () => {
    if (!currentMeasurementType || !currentMeasurementType.relevant_fields) {
      return <p className="text-muted-foreground">Please select a measurement type to see relevant fields.</p>;
    }

    const groupedRelevantFields: Record<string, Array<keyof UserMeasurements>> = {};
    currentMeasurementType.relevant_fields.forEach(fieldKey => {
      const fieldInfo = allMeasurementFields.find(f => f.key === fieldKey);
      if (fieldInfo) {
        (groupedRelevantFields[fieldInfo.group] = groupedRelevantFields[fieldInfo.group] || []).push(fieldKey);
      }
    });

    return (
      <Accordion type="multiple" className="w-full space-y-4">
        {Object.entries(groupedRelevantFields).map(([group, fieldKeys]) => {
          if (group === 'General' && fieldKeys.includes('notes')) return null; // Notes handled separately

          return (
            <AccordionItem key={group} value={`item-${group}`} className="rounded-md border bg-card shadow-sm transition-all duration-200">
              <AccordionTrigger className="flex w-full items-center justify-between px-4 py-3 text-lg font-semibold text-foreground transition-all hover:bg-muted hover:no-underline [&[data-state=open]>svg]:rotate-180" disabled={isDisabled || !isActive}>
                {group}
              </AccordionTrigger>
              <AccordionContent className="p-4 border-t bg-background rounded-b-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fieldKeys.map((fieldKey) => {
                    const config = measurementFieldConfig[fieldKey];
                    if (!config || fieldKey === 'notes') return null;

                    const value = (formValues[fieldKey] ?? '').toString();

                    return (
                      <div key={fieldKey}>
                        <Label htmlFor={fieldKey}>{config.label}</Label>
                        {config.type === 'number' && (
                          <Input
                            id={fieldKey}
                            type="number"
                            value={value}
                            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                            placeholder={`e.g., ${config.label.includes('Length') ? '28' : config.label.includes('Chest') ? '40' : '32'}`}
                            min="0"
                            step="0.1"
                            disabled={isDisabled || !isActive}
                          />
                        )}
                        {config.type === 'text' && (
                          <Input
                            id={fieldKey}
                            type="text"
                            value={value}
                            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                            placeholder={`Enter ${config.label.toLowerCase()}`}
                            disabled={isDisabled || !isActive}
                          />
                        )}
                        {config.type === 'select' && config.options && (
                          <Select onValueChange={(val) => handleInputChange(fieldKey, val)} value={value} disabled={isDisabled || !isActive}>
                            <SelectTrigger id={fieldKey} className="w-full">
                              <SelectValue placeholder={`Select ${config.label.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {config.options.map(option => (
                                <SelectItem key={option} value={option}>{option}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    );
  };

  if (!session) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6 text-center text-muted-foreground">
          Please log in to manage your measurements.
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6 text-center text-muted-foreground flex items-center justify-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading your measurements...
        </CardContent>
      </Card>
    );
  }

  const isFormDisabled = isDisabled || !isActive;

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold text-foreground">Your Measurements</CardTitle>
        <div className="flex items-center space-x-2">
          <Label htmlFor="measurement-toggle">Enable Custom Measurements</Label>
          <Switch
            id="measurement-toggle"
            checked={isActive}
            onCheckedChange={onToggle}
            disabled={isDisabled}
          />
        </div>
      </CardHeader>
      <CardContent className={cn(isFormDisabled && "opacity-50 pointer-events-none")}>
        <form onSubmit={handleSaveMeasurements} className="space-y-6">
          {/* Measurement Type Selection */}
          <div className="space-y-2">
            <Label className="text-base font-semibold text-foreground">Select Measurement Type</Label>
            <Select onValueChange={setSelectedMeasurementTypeId} value={selectedMeasurementTypeId} disabled={isFormDisabled}>
              <SelectTrigger id="measurementType" className="w-full">
                <SelectValue placeholder="Select your measurement type" />
              </SelectTrigger>
              <SelectContent>
                {measurementTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Display current measurements summary */}
          {renderCurrentMeasurementsSummary() && (
            <div className="p-4 border rounded-md bg-muted/50">
              <h3 className="font-semibold text-foreground mb-2">Currently Saved:</h3>
              {renderCurrentMeasurementsSummary()}
              {currentMeasurements?.notes && (
                <p className="text-sm text-muted-foreground mt-2">Notes: {currentMeasurements.notes}</p>
              )}
            </div>
          )}

          {renderMeasurementInputs()}

          {/* Additional Notes Box - always available if 'notes' is a relevant field */}
          {currentMeasurementType?.relevant_fields.includes('notes') && (
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-semibold text-foreground">
                {measurementFieldConfig.notes.label}
              </Label>
              <Textarea
                id="notes"
                value={(formValues.notes as string) || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="e.g., Please make the shirt slightly loose, or provide specific measurements not listed above."
                rows={5}
                disabled={isFormDisabled}
              />
            </div>
          )}

          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={saving || isFormDisabled}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Measurements'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductMeasurementSelector;