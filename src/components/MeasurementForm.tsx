import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { UserMeasurements } from '@/types/checkout';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { getMeasurementTypes, MeasurementType } from '@/utils/measurementTypes'; // Import getMeasurementTypes and MeasurementType

interface MeasurementFormProps {
  initialMeasurements?: UserMeasurements;
  onSaveSuccess?: () => void;
  userGender: 'men' | 'women' | 'not_specified';
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

const MeasurementForm: React.FC<MeasurementFormProps> = ({ initialMeasurements, onSaveSuccess, userGender }) => {
  const { session } = useSession();
  const [selectedMeasurementTypeId, setSelectedMeasurementTypeId] = useState<string | undefined>(undefined);
  const [currentMeasurementType, setCurrentMeasurementType] = useState<MeasurementType | undefined>(undefined);
  const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>([]);
  const [formValues, setFormValues] = useState<Partial<UserMeasurements>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTypes = async () => {
      const types = await getMeasurementTypes();
      setMeasurementTypes(types);
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    if (initialMeasurements && measurementTypes.length > 0) { // Ensure measurementTypes are loaded
      // Initialize form values from initialMeasurements
      const initialFormValues: Partial<UserMeasurements> = {};
      for (const key in initialMeasurements) {
        if (Object.prototype.hasOwnProperty.call(initialMeasurements, key)) {
          initialFormValues[key as keyof UserMeasurements] = initialMeasurements[key as keyof UserMeasurements];
        }
      }
      setFormValues(initialFormValues);

      // Find the ID based on the name stored in initialMeasurements.measurement_type
      const typeByName = measurementTypes.find(type => type.name === initialMeasurements.measurement_type);
      setSelectedMeasurementTypeId(typeByName?.id || undefined);
    } else if (!initialMeasurements) {
      setFormValues({});
      setSelectedMeasurementTypeId(undefined);
    }
  }, [initialMeasurements, measurementTypes]); // Add measurementTypes to dependency array

  useEffect(() => {
    // Set initial measurement type based on user's gender if not already set
    if (!selectedMeasurementTypeId && userGender !== 'not_specified' && measurementTypes.length > 0) {
      const defaultType = measurementTypes.find(type => type.name.toLowerCase().includes(userGender));
      if (defaultType) {
        setSelectedMeasurementTypeId(defaultType.id);
      }
    }
  }, [userGender, selectedMeasurementTypeId, measurementTypes]);

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

    setLoading(true);
    try {
      const updates: Partial<UserMeasurements> = {
        user_id: session.user.id,
        measurement_type: currentMeasurementType?.name || null, // Store the name of the selected type
        updated_at: new Date().toISOString(),
      };

      // Only include relevant fields from formValues
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


      const { data: existingMeasurements, error: fetchError } = await supabase
        .from('measurements')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      let error;
      if (existingMeasurements) {
        const { error: updateError } = await supabase
          .from('measurements')
          .update(updates)
          .eq('user_id', session.user.id);
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
      onSaveSuccess?.();
    } catch (err) {
      console.error('Failed to save measurements:', err);
      showError('Failed to save measurements.');
    } finally {
      setLoading(false);
    }
  };

  const renderMeasurementInputs = () => {
    if (!currentMeasurementType || !currentMeasurementType.relevant_fields) {
      return <p className="text-muted-foreground">Please select a measurement type to see relevant fields.</p>;
    }

    // Group fields by their original categories for better display in the accordion
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
          // Filter out 'notes' from accordion groups if it's handled separately
          if (group === 'General' && fieldKeys.includes('notes')) return null;

          return (
            <AccordionItem key={group} value={`item-${group}`} className="rounded-md border bg-card shadow-sm transition-all duration-200">
              <AccordionTrigger className="flex w-full items-center justify-between px-4 py-3 text-lg font-semibold text-foreground transition-all hover:bg-muted hover:no-underline [&[data-state=open]>svg]:rotate-180">
                {group}
              </AccordionTrigger>
              <AccordionContent className="p-4 border-t bg-background rounded-b-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fieldKeys.map((fieldKey) => {
                    const config = measurementFieldConfig[fieldKey];
                    if (!config || fieldKey === 'notes') return null; // Skip notes here

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
                          />
                        )}
                        {config.type === 'text' && (
                          <Input
                            id={fieldKey}
                            type="text"
                            value={value}
                            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                            placeholder={`Enter ${config.label.toLowerCase()}`}
                          />
                        )}
                        {config.type === 'select' && config.options && (
                          <Select onValueChange={(val) => handleInputChange(fieldKey, val)} value={value}>
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

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">Your Measurements</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveMeasurements} className="space-y-6">
          {/* Measurement Type Selection */}
          <div className="space-y-2">
            <Label className="text-base font-semibold text-foreground">Select Measurement Type</Label>
            <Select onValueChange={setSelectedMeasurementTypeId} value={selectedMeasurementTypeId}>
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
              />
            </div>
          )}

          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
            {loading ? 'Saving...' : 'Save Measurements'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MeasurementForm;