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

interface ProductMeasurementSelectorProps {
  session: Session | null;
  onInteraction: () => void; // New prop to notify parent of interaction
  isDisabled: boolean; // New prop to disable the component
}

const ProductMeasurementSelector: React.FC<ProductMeasurementSelectorProps> = ({ session, onInteraction, isDisabled }) => {
  const [currentMeasurements, setCurrentMeasurements] = useState<UserMeasurements | undefined>(undefined);
  const [selectedMeasurementType, setSelectedMeasurementType] = useState<'men' | 'women' | ''>('');
  const [notes, setNotes] = useState('');
  const [ladiesSize, setLadiesSize] = useState('');

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Fetch user's measurements
      const { data: measurementsData, error: fetchError } = await supabase
        .from('measurements')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (measurementsData) {
        setCurrentMeasurements(measurementsData as UserMeasurements);
        setSelectedMeasurementType(measurementsData.measurement_type || userGender === 'not_specified' ? '' : userGender);
        setNotes(measurementsData.notes || '');
        setLadiesSize(measurementsData.ladies_size || '');

        setMenShirtLength(measurementsData.men_shirt_length?.toString() || '');
        setMenShirtChest(measurementsData.men_shirt_chest?.toString() || '');
        setMenShirtWaist(measurementsData.men_shirt_waist?.toString() || '');
        setMenShirtSleeveLength(measurementsData.men_shirt_sleeve_length?.toString() || '');
        setMenShirtShoulder(measurementsData.men_shirt_shoulder?.toString() || '');
        setMenShirtNeck(measurementsData.men_shirt_neck?.toString() || '');

        setMenPantLength(measurementsData.men_pant_length?.toString() || '');
        setMenPantWaist(measurementsData.men_pant_waist?.toString() || '');
        setMenPantHip(measurementsData.men_pant_hip?.toString() || '');
        setMenPantThigh(measurementsData.men_pant_thigh?.toString() || '');
        setMenPantBottom(measurementsData.men_pant_bottom?.toString() || '');

        setMenCoatLength(measurementsData.men_coat_length?.toString() || '');
        setMenCoatChest(measurementsData.men_coat_chest?.toString() || '');
        setMenCoatWaist(measurementsData.men_coat_waist?.toString() || '');
        setMenCoatSleeveLength(measurementsData.men_coat_sleeve_length?.toString() || '');
        setMenCoatShoulder(measurementsData.men_coat_shoulder?.toString() || '');
      } else {
        setCurrentMeasurements(undefined);
        setSelectedMeasurementType(userGender === 'not_specified' ? '' : userGender);
        setNotes('');
        setLadiesSize('');
        // Clear all men's measurements
        setMenShirtLength(''); setMenShirtChest(''); setMenShirtWaist(''); setMenShirtSleeveLength(''); setMenShirtShoulder(''); setMenShirtNeck('');
        setMenPantLength(''); setMenPantWaist(''); setMenPantHip(''); setMenPantThigh(''); setMenPantBottom('');
        setMenCoatLength(''); setMenCoatChest(''); setMenCoatWaist(''); setMenCoatSleeveLength(''); setMenCoatShoulder('');
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
    fetchUserMeasurements();
  }, [session]);

  const handleSaveMeasurements = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session?.user) {
      showError('You must be logged in to save measurements.');
      return;
    }

    setSaving(true);
    try {
      const updates: UserMeasurements = {
        user_id: session.user.id,
        measurement_type: selectedMeasurementType || null,
        notes: notes.trim() || null,
        ladies_size: null,
        men_shirt_length: null, men_shirt_chest: null, men_shirt_waist: null, men_shirt_sleeve_length: null, men_shirt_shoulder: null, men_shirt_neck: null,
        men_pant_length: null, men_pant_waist: null, men_pant_hip: null, men_pant_thigh: null, men_pant_bottom: null,
        men_coat_length: null, men_coat_chest: null, men_coat_waist: null, men_coat_sleeve_length: null, men_coat_shoulder: null,
        updated_at: new Date().toISOString(),
      };

      if (selectedMeasurementType === 'men') {
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
      } else if (selectedMeasurementType === 'women') {
        updates.ladies_size = ladiesSize || null;
      }

      // Update user's gender in profiles table
      if (selectedMeasurementType && session.user) {
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ gender: selectedMeasurementType })
          .eq('id', session.user.id);
        if (profileUpdateError) throw profileUpdateError;
      }

      let error;
      if (currentMeasurements?.id) { // If existing measurements, update
        const { error: updateError } = await supabase
          .from('measurements')
          .update(updates)
          .eq('id', currentMeasurements.id);
        error = updateError;
      } else { // Otherwise, insert new measurements
        const { error: insertError } = await supabase
          .from('measurements')
          .insert(updates);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      showSuccess('Measurements saved successfully!');
      fetchUserMeasurements(); // Re-fetch to update local state
    } catch (err) {
      console.error('Failed to save measurements:', err);
      showError('Failed to save measurements.');
    } finally {
      setSaving(false);
    }
  };

  const renderCurrentMeasurementsSummary = () => {
    if (!currentMeasurements || !selectedMeasurementType) return null;

    if (selectedMeasurementType === 'women' && currentMeasurements.ladies_size) {
      return (
        <p className="text-sm text-muted-foreground">
          Current Ladies' Size: <span className="font-semibold">{currentMeasurements.ladies_size}</span>
        </p>
      );
    }

    if (selectedMeasurementType === 'men') {
      const menMeasurements = [
        { label: 'Shirt Length', value: currentMeasurements.men_shirt_length },
        { label: 'Chest', value: currentMeasurements.men_shirt_chest },
        { label: 'Waist', value: currentMeasurements.men_shirt_waist },
        { label: 'Sleeve', value: currentMeasurements.men_shirt_sleeve_length },
        { label: 'Shoulder', value: currentMeasurements.men_shirt_shoulder },
        { label: 'Neck', value: currentMeasurements.men_shirt_neck },
        { label: 'Pant Length', value: currentMeasurements.men_pant_length },
        { label: 'Pant Waist', value: currentMeasurements.men_pant_waist },
        { label: 'Pant Hip', value: currentMeasurements.men_pant_hip },
        { label: 'Pant Thigh', value: currentMeasurements.men_pant_thigh },
        { label: 'Pant Bottom', value: currentMeasurements.men_pant_bottom },
        { label: 'Coat Length', value: currentMeasurements.men_coat_length },
        { label: 'Coat Chest', value: currentMeasurements.men_coat_chest },
        { label: 'Coat Waist', value: currentMeasurements.men_coat_waist },
        { label: 'Coat Sleeve', value: currentMeasurements.men_coat_sleeve_length },
        { label: 'Coat Shoulder', value: currentMeasurements.men_coat_shoulder },
      ].filter(m => m.value !== null && m.value !== undefined);

      if (menMeasurements.length === 0) return null;

      return (
        <div className="text-sm text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1">
          {menMeasurements.map((m, idx) => (
            <p key={idx}><span className="font-semibold">{m.label}:</span> {m.value} in</p>
          ))}
        </div>
      );
    }
    return null;
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

  return (
    <Card className={cn("mt-6", isDisabled && "opacity-50 pointer-events-none")}>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">Your Measurements</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveMeasurements} className="space-y-6">
          {/* Gender/Measurement Type Selection */}
          <div className="space-y-2">
            <Label className="text-base font-semibold text-foreground">Select Measurement Type</Label>
            <RadioGroup onValueChange={(value: 'men' | 'women') => { setSelectedMeasurementType(value); onInteraction(); }} value={selectedMeasurementType} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Label
                htmlFor="men-product-detail"
                className={cn(
                  "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 text-popover-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all duration-200",
                  selectedMeasurementType === 'men' && "border-primary ring-2 ring-primary shadow-md"
                )}
              >
                <RadioGroupItem value="men" id="men-product-detail" className="sr-only" />
                <span className="text-lg font-medium">Men's Measurements</span>
                <span className="text-sm text-muted-foreground text-center mt-1">Shirt, Pant, Coat, etc.</span>
              </Label>

              <Label
                htmlFor="women-product-detail"
                className={cn(
                  "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 text-popover-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all duration-200",
                  selectedMeasurementType === 'women' && "border-primary ring-2 ring-primary shadow-md"
                )}
              >
                <RadioGroupItem value="women" id="women-product-detail" className="sr-only" />
                <span className="text-lg font-medium">Ladies' Size</span>
                <span className="text-sm text-muted-foreground text-center mt-1">Standard sizes (XS, S, M, L, XL, XXL)</span>
              </Label>
            </RadioGroup>
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

          {selectedMeasurementType === 'men' && (
            <Accordion type="multiple" className="w-full space-y-4">
              <AccordionItem value="item-1" className="rounded-md border bg-card shadow-sm transition-all duration-200">
                <AccordionTrigger className="flex w-full items-center justify-between px-4 py-3 text-lg font-semibold text-foreground transition-all hover:bg-muted hover:no-underline [&[data-state=open]>svg]:rotate-180">
                  Shirt / Kurta / Bandi Measurements (inches)
                </AccordionTrigger>
                <AccordionContent className="p-4 border-t bg-background rounded-b-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label htmlFor="menShirtLength">Length</Label><Input id="menShirtLength" type="number" value={menShirtLength} onChange={(e) => {setMenShirtLength(e.target.value); onInteraction();}} placeholder="e.g., 28" /></div>
                    <div><Label htmlFor="menShirtChest">Chest</Label><Input id="menShirtChest" type="number" value={menShirtChest} onChange={(e) => {setMenShirtChest(e.target.value); onInteraction();}} placeholder="e.g., 40" /></div>
                    <div><Label htmlFor="menShirtWaist">Waist</Label><Input id="menShirtWaist" type="number" value={menShirtWaist} onChange={(e) => {setMenShirtWaist(e.target.value); onInteraction();}} placeholder="e.g., 38" /></div>
                    <div><Label htmlFor="menShirtSleeveLength">Sleeve Length</Label><Input id="menShirtSleeveLength" type="number" value={menShirtSleeveLength} onChange={(e) => {setMenShirtSleeveLength(e.target.value); onInteraction();}} placeholder="e.g., 24" /></div>
                    <div><Label htmlFor="menShirtShoulder">Shoulder</Label><Input id="menShirtShoulder" type="number" value={menShirtShoulder} onChange={(e) => {setMenShirtShoulder(e.target.value); onInteraction();}} placeholder="e.g., 18" /></div>
                    <div><Label htmlFor="menShirtNeck">Neck</Label><Input id="menShirtNeck" type="number" value={menShirtNeck} onChange={(e) => {setMenShirtNeck(e.target.value); onInteraction();}} placeholder="e.g., 15" /></div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="rounded-md border bg-card shadow-sm transition-all duration-200">
                <AccordionTrigger className="flex w-full items-center justify-between px-4 py-3 text-lg font-semibold text-foreground transition-all hover:bg-muted hover:no-underline [&[data-state=open]>svg]:rotate-180">
                  Pant / Paijama Measurements (inches)
                </AccordionTrigger>
                <AccordionContent className="p-4 border-t bg-background rounded-b-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label htmlFor="menPantLength">Length</Label><Input id="menPantLength" type="number" value={menPantLength} onChange={(e) => {setMenPantLength(e.target.value); onInteraction();}} placeholder="e.g., 40" /></div>
                    <div><Label htmlFor="menPantWaist">Waist</Label><Input id="menPantWaist" type="number" value={menPantWaist} onChange={(e) => {setMenPantWaist(e.target.value); onInteraction();}} placeholder="e.g., 32" /></div>
                    <div><Label htmlFor="menPantHip">Hip</Label><Input id="menPantHip" type="number" value={menPantHip} onChange={(e) => {setMenPantHip(e.target.value); onInteraction();}} placeholder="e.g., 38" /></div>
                    <div><Label htmlFor="menPantThigh">Thigh</Label><Input id="menPantThigh" type="number" value={menPantThigh} onChange={(e) => {setMenPantThigh(e.target.value); onInteraction();}} placeholder="e.g., 22" /></div>
                    <div><Label htmlFor="menPantBottom">Bottom</Label><Input id="menPantBottom" type="number" value={menPantBottom} onChange={(e) => {setMenPantBottom(e.target.value); onInteraction();}} placeholder="e.g., 14" /></div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="rounded-md border bg-card shadow-sm transition-all duration-200">
                <AccordionTrigger className="flex w-full items-center justify-between px-4 py-3 text-lg font-semibold text-foreground transition-all hover:bg-muted hover:no-underline [&[data-state=open]>svg]:rotate-180">
                  Coat / Washcoat / Bajezar Measurements (inches)
                </AccordionTrigger>
                <AccordionContent className="p-4 border-t bg-background rounded-b-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label htmlFor="menCoatLength">Length</Label><Input id="menCoatLength" type="number" value={menCoatLength} onChange={(e) => {setMenCoatLength(e.target.value); onInteraction();}} placeholder="e.g., 28" /></div>
                    <div><Label htmlFor="menCoatChest">Chest</Label><Input id="menCoatChest" type="number" value={menCoatChest} onChange={(e) => {setMenCoatChest(e.target.value); onInteraction();}} placeholder="e.g., 40" /></div>
                    <div><Label htmlFor="menCoatWaist">Waist</Label><Input id="menCoatWaist" type="number" value={menCoatWaist} onChange={(e) => {setMenCoatWaist(e.target.value); onInteraction();}} placeholder="e.g., 36" /></div>
                    <div><Label htmlFor="menCoatSleeveLength">Sleeve Length</Label><Input id="menCoatSleeveLength" type="number" value={menCoatSleeveLength} onChange={(e) => {setMenCoatSleeveLength(e.target.value); onInteraction();}} placeholder="e.g., 25" /></div>
                    <div><Label htmlFor="menCoatShoulder">Shoulder</Label><Input id="menCoatShoulder" type="number" value={menCoatShoulder} onChange={(e) => {setMenCoatShoulder(e.target.value); onInteraction();}} placeholder="e.g., 18" /></div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {selectedMeasurementType === 'women' && (
            <div className="space-y-2">
              <Label htmlFor="ladiesSize" className="text-base font-semibold text-foreground">Select Size</Label>
              <Select onValueChange={(value) => {setLadiesSize(value); onInteraction();}} value={ladiesSize}>
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
              onChange={(e) => {setNotes(e.target.value); onInteraction();}}
              placeholder="e.g., Please make the shirt slightly loose, or provide specific measurements not listed above."
              rows={5}
            />
          </div>

          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={saving}>
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