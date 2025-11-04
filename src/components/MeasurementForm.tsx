import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { UserMeasurements } from '@/types/checkout'; // Import updated UserMeasurements type
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface MeasurementFormProps {
  initialMeasurements?: UserMeasurements;
  onSaveSuccess?: () => void;
  userGender: 'men' | 'women' | 'not_specified';
}

const MeasurementForm: React.FC<MeasurementFormProps> = ({ initialMeasurements, onSaveSuccess, userGender }) => {
  const { session } = useSession();
  const [measurementType, setMeasurementType] = useState<'men' | 'women' | ''>(initialMeasurements?.measurement_type || '');
  const [notes, setNotes] = useState(initialMeasurements?.notes || '');
  const [ladiesSize, setLadiesSize] = useState(initialMeasurements?.ladies_size || '');

  // Men's Shirt/Kurta/Bandi Measurements
  const [menShirtLength, setMenShirtLength] = useState<string>('');
  const [menShirtChest, setMenShirtChest] = useState<string>('');
  const [menShirtWaist, setMenShirtWaist] = useState<string>('');
  const [menShirtSleeveLength, setMenShirtSleeveLength] = useState<string>('');
  const [menShirtShoulder, setMenShirtShoulder] = useState<string>('');
  const [menShirtNeck, setMenShirtNeck] = useState<string>('');

  // Men's Pant/Paijama Measurements
  const [menPantLength, setMenPantLength] = useState<string>('');
  const [menPantWaist, setMenPantWaist] = useState<string>('');
  const [menPantHip, setMenPantHip] = useState<string>('');
  const [menPantThigh, setMenPantThigh] = useState<string>('');
  const [menPantBottom, setMenPantBottom] = useState<string>('');

  // Men's Coat/Washcoat/Bajezar Measurements
  const [menCoatLength, setMenCoatLength] = useState<string>('');
  const [menCoatChest, setMenCoatChest] = useState<string>('');
  const [menCoatWaist, setMenCoatWaist] = useState<string>('');
  const [menCoatSleeveLength, setMenCoatSleeveLength] = useState<string>('');
  const [menCoatShoulder, setMenCoatShoulder] = useState<string>('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialMeasurements) {
      setMeasurementType(initialMeasurements.measurement_type || '');
      setNotes(initialMeasurements.notes || '');
      setLadiesSize(initialMeasurements.ladies_size || '');

      setMenShirtLength(initialMeasurements.men_shirt_length?.toString() || '');
      setMenShirtChest(initialMeasurements.men_shirt_chest?.toString() || '');
      setMenShirtWaist(initialMeasurements.men_shirt_waist?.toString() || '');
      setMenShirtSleeveLength(initialMeasurements.men_shirt_sleeve_length?.toString() || '');
      setMenShirtShoulder(initialMeasurements.men_shirt_shoulder?.toString() || '');
      setMenShirtNeck(initialMeasurements.men_shirt_neck?.toString() || '');

      setMenPantLength(initialMeasurements.men_pant_length?.toString() || '');
      setMenPantWaist(initialMeasurements.men_pant_waist?.toString() || '');
      setMenPantHip(initialMeasurements.men_pant_hip?.toString() || '');
      setMenPantThigh(initialMeasurements.men_pant_thigh?.toString() || '');
      setMenPantBottom(initialMeasurements.men_pant_bottom?.toString() || '');

      setMenCoatLength(initialMeasurements.men_coat_length?.toString() || '');
      setMenCoatChest(initialMeasurements.men_coat_chest?.toString() || '');
      setMenCoatWaist(initialMeasurements.men_coat_waist?.toString() || '');
      setMenCoatSleeveLength(initialMeasurements.men_coat_sleeve_length?.toString() || '');
      setMenCoatShoulder(initialMeasurements.men_coat_shoulder?.toString() || '');
    }
  }, [initialMeasurements]);

  // Set initial measurement type based on user's gender if not already set
  useEffect(() => {
    if (!measurementType && userGender !== 'not_specified') {
      setMeasurementType(userGender);
    }
  }, [userGender, measurementType]);

  const handleSaveMeasurements = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session?.user) {
      showError('You must be logged in to save measurements.');
      return;
    }

    setLoading(true);
    try {
      const updates: UserMeasurements = {
        user_id: session.user.id,
        measurement_type: measurementType || null,
        notes: notes.trim() || null,
        ladies_size: null, // Reset ladies_size if not women's type
        men_shirt_length: null, men_shirt_chest: null, men_shirt_waist: null, men_shirt_sleeve_length: null, men_shirt_shoulder: null, men_shirt_neck: null,
        men_pant_length: null, men_pant_waist: null, men_pant_hip: null, men_pant_thigh: null, men_pant_bottom: null,
        men_coat_length: null, men_coat_chest: null, men_coat_waist: null, men_coat_sleeve_length: null, men_coat_shoulder: null,
        updated_at: new Date().toISOString(),
      };

      if (measurementType === 'men') {
        updates.men_shirt_length = menShirtLength ? parseFloat(menShirtLength) : null;
        updates.men_shirt_chest = menShirtChest ? parseFloat(menShirtChest) : null;
        updates.men_shirt_waist = menShirtWaist ? parseFloat(menShirtWaist) : null;
        updates.men_shirt_sleeve_length = menShirtSleeveLength ? parseFloat(menShirtSleeveLength) : null;
        updates.men_shirt_shoulder = menShirtShoulder ? parseFloat(menShirtShoulder) : null;
        updates.men_shirt_neck = menShirtNeck ? parseFloat(menShirtNeck) : null;

        updates.men_pant_length = menPantLength ? parseFloat(menPantLength) : null;
        updates.men_pant_waist = menPantWaist ? parseFloat(menPantWaist) : null;
        updates.men_pant_hip = menPantHip ? parseFloat(menPantHip) : null;
        updates.men_pant_thigh = menPantThigh ? parseFloat(menPantThigh) : null;
        updates.men_pant_bottom = menPantBottom ? parseFloat(menPantBottom) : null;

        updates.men_coat_length = menCoatLength ? parseFloat(menCoatLength) : null;
        updates.men_coat_chest = menCoatChest ? parseFloat(menCoatChest) : null;
        updates.men_coat_waist = menCoatWaist ? parseFloat(menCoatWaist) : null;
        updates.men_coat_sleeve_length = menCoatSleeveLength ? parseFloat(menCoatSleeveLength) : null;
        updates.men_coat_shoulder = menCoatShoulder ? parseFloat(menCoatShoulder) : null;
      } else if (measurementType === 'women') {
        updates.ladies_size = ladiesSize || null;
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

  const handleGenderChange = async (value: 'men' | 'women') => {
    setMeasurementType(value);
    // Also update user's gender in profiles table
    if (session?.user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ gender: value })
          .eq('id', session.user.id);
        if (error) throw error;
        showSuccess('Gender preference updated!');
      } catch (err) {
        console.error('Error updating gender preference:', err);
        showError('Failed to update gender preference.');
      }
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">Your Measurements</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveMeasurements} className="space-y-6">
          {/* Gender/Measurement Type Selection */}
          <div className="space-y-2">
            <Label className="text-base font-semibold text-foreground">Select Measurement Type</Label>
            <RadioGroup onValueChange={handleGenderChange} value={measurementType} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="men" id="men" />
                <Label htmlFor="men">Men's Measurements</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="women" id="women" />
                <Label htmlFor="women">Ladies' Size</Label>
              </div>
            </RadioGroup>
          </div>

          {measurementType === 'men' && (
            <Accordion type="multiple" className="w-full space-y-4">
              <AccordionItem value="item-1" className="border rounded-md">
                <AccordionTrigger className="px-4 py-3 text-lg font-semibold text-foreground hover:no-underline">Shirt / Kurta / Bandi Measurements (inches)</AccordionTrigger>
                <AccordionContent className="p-4 border-t">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label htmlFor="menShirtLength">Length</Label><Input id="menShirtLength" type="number" value={menShirtLength} onChange={(e) => setMenShirtLength(e.target.value)} placeholder="e.g., 28" /></div>
                    <div><Label htmlFor="menShirtChest">Chest</Label><Input id="menShirtChest" type="number" value={menShirtChest} onChange={(e) => setMenShirtChest(e.target.value)} placeholder="e.g., 40" /></div>
                    <div><Label htmlFor="menShirtWaist">Waist</Label><Input id="menShirtWaist" type="number" value={menShirtWaist} onChange={(e) => setMenShirtWaist(e.target.value)} placeholder="e.g., 38" /></div>
                    <div><Label htmlFor="menShirtSleeveLength">Sleeve Length</Label><Input id="menShirtSleeveLength" type="number" value={menShirtSleeveLength} onChange={(e) => setMenShirtSleeveLength(e.target.value)} placeholder="e.g., 24" /></div>
                    <div><Label htmlFor="menShirtShoulder">Shoulder</Label><Input id="menShirtShoulder" type="number" value={menShirtShoulder} onChange={(e) => setMenShirtShoulder(e.target.value)} placeholder="e.g., 18" /></div>
                    <div><Label htmlFor="menShirtNeck">Neck</Label><Input id="menShirtNeck" type="number" value={menShirtNeck} onChange={(e) => setMenShirtNeck(e.target.value)} placeholder="e.g., 15" /></div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border rounded-md">
                <AccordionTrigger className="px-4 py-3 text-lg font-semibold text-foreground hover:no-underline">Pant / Paijama Measurements (inches)</AccordionTrigger>
                <AccordionContent className="p-4 border-t">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label htmlFor="menPantLength">Length</Label><Input id="menPantLength" type="number" value={menPantLength} onChange={(e) => setMenPantLength(e.target.value)} placeholder="e.g., 40" /></div>
                    <div><Label htmlFor="menPantWaist">Waist</Label><Input id="menPantWaist" type="number" value={menPantWaist} onChange={(e) => setMenPantWaist(e.target.value)} placeholder="e.g., 32" /></div>
                    <div><Label htmlFor="menPantHip">Hip</Label><Input id="menPantHip" type="number" value={menPantHip} onChange={(e) => setMenPantHip(e.target.value)} placeholder="e.g., 38" /></div>
                    <div><Label htmlFor="menPantThigh">Thigh</Label><Input id="menPantThigh" type="number" value={menPantThigh} onChange={(e) => setMenPantThigh(e.target.value)} placeholder="e.g., 22" /></div>
                    <div><Label htmlFor="menPantBottom">Bottom</Label><Input id="menPantBottom" type="number" value={menPantBottom} onChange={(e) => setMenPantBottom(e.target.value)} placeholder="e.g., 14" /></div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border rounded-md">
                <AccordionTrigger className="px-4 py-3 text-lg font-semibold text-foreground hover:no-underline">Coat / Washcoat / Bajezar Measurements (inches)</AccordionTrigger>
                <AccordionContent className="p-4 border-t">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label htmlFor="menCoatLength">Length</Label><Input id="menCoatLength" type="number" value={menCoatLength} onChange={(e) => setMenCoatLength(e.target.value)} placeholder="e.g., 28" /></div>
                    <div><Label htmlFor="menCoatChest">Chest</Label><Input id="menCoatChest" type="number" value={menCoatChest} onChange={(e) => setMenCoatChest(e.target.value)} placeholder="e.g., 40" /></div>
                    <div><Label htmlFor="menCoatWaist">Waist</Label><Input id="menCoatWaist" type="number" value={menCoatWaist} onChange={(e) => setMenCoatWaist(e.target.value)} placeholder="e.g., 36" /></div>
                    <div><Label htmlFor="menCoatSleeveLength">Sleeve Length</Label><Input id="menCoatSleeveLength" type="number" value={menCoatSleeveLength} onChange={(e) => setMenCoatSleeveLength(e.target.value)} placeholder="e.g., 25" /></div>
                    <div><Label htmlFor="menCoatShoulder">Shoulder</Label><Input id="menCoatShoulder" type="number" value={menCoatShoulder} onChange={(e) => setMenCoatShoulder(e.target.value)} placeholder="e.g., 18" /></div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {measurementType === 'women' && (
            <div className="space-y-2">
              <Label htmlFor="ladiesSize" className="text-base font-semibold text-foreground">Select Size</Label>
              <Select onValueChange={setLadiesSize} value={ladiesSize}>
                <SelectTrigger id="ladiesSize" className="w-full">
                  <SelectValue placeholder="Select your size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XS">XS</SelectItem>
                  <SelectItem value="S">S</SelectItem>
                  <SelectItem value="M">M</SelectItem>
                  <SelectItem value="L">L</SelectItem>
                  <SelectItem value="XL">XL</SelectItem>
                  <SelectItem value="XXL">XXL</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Additional Notes Box */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base font-semibold text-foreground">Additional Notes / Specific Instructions</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Please make the shirt slightly loose, or provide specific measurements not listed above."
              rows={5}
            />
          </div>

          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
            {loading ? 'Saving...' : 'Save Measurements'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MeasurementForm;