import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';

interface MeasurementFormProps {
  initialMeasurements?: {
    chest?: number;
    waist?: number;
    sleeve_length?: number;
    shoulder?: number;
    neck?: number;
  };
  onSaveSuccess?: () => void;
}

const MeasurementForm: React.FC<MeasurementFormProps> = ({ initialMeasurements, onSaveSuccess }) => {
  const { session } = useSession();
  const [chest, setChest] = useState<string>('');
  const [waist, setWaist] = useState<string>('');
  const [sleeveLength, setSleeveLength] = useState<string>('');
  const [shoulder, setShoulder] = useState<string>('');
  const [neck, setNeck] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialMeasurements) {
      setChest(initialMeasurements.chest?.toString() || '');
      setWaist(initialMeasurements.waist?.toString() || '');
      setSleeveLength(initialMeasurements.sleeve_length?.toString() || '');
      setShoulder(initialMeasurements.shoulder?.toString() || '');
      setNeck(initialMeasurements.neck?.toString() || '');
    }
  }, [initialMeasurements]);

  const handleSaveMeasurements = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session?.user) {
      showError('You must be logged in to save measurements.');
      return;
    }

    setLoading(true);
    try {
      const updates = {
        user_id: session.user.id,
        chest: chest ? parseFloat(chest) : null,
        waist: waist ? parseFloat(waist) : null,
        sleeve_length: sleeveLength ? parseFloat(sleeveLength) : null,
        shoulder: shoulder ? parseFloat(shoulder) : null,
        neck: neck ? parseFloat(neck) : null,
        updated_at: new Date().toISOString(),
      };

      // Check if measurements already exist for the user
      const { data: existingMeasurements, error: fetchError } = await supabase
        .from('measurements')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle(); // Changed from .single() to .maybeSingle()

      if (fetchError) { // This will now only catch actual database errors
        throw fetchError;
      }

      let error;
      if (existingMeasurements) {
        // Update existing measurements
        const { error: updateError } = await supabase
          .from('measurements')
          .update(updates)
          .eq('user_id', session.user.id);
        error = updateError;
      } else {
        // Insert new measurements
        const { error: insertError } = await supabase
          .from('measurements')
          .insert(updates);
        error = insertError;
      }

      if (error) {
        throw error;
      }

      showSuccess('Measurements saved successfully!');
      onSaveSuccess?.(); // Call callback if provided
    } catch (err) {
      console.error('Failed to save measurements:', err);
      showError('Failed to save measurements.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">Your Measurements</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveMeasurements} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="chest">Chest (inches)</Label>
              <Input
                id="chest"
                type="number"
                value={chest}
                onChange={(e) => setChest(e.target.value)}
                placeholder="e.g., 40"
              />
            </div>
            <div>
              <Label htmlFor="waist">Waist (inches)</Label>
              <Input
                id="waist"
                type="number"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                placeholder="e.g., 32"
              />
            </div>
            <div>
              <Label htmlFor="sleeveLength">Sleeve Length (inches)</Label>
              <Input
                id="sleeveLength"
                type="number"
                value={sleeveLength}
                onChange={(e) => setSleeveLength(e.target.value)}
                placeholder="e.g., 25"
              />
            </div>
            <div>
              <Label htmlFor="shoulder">Shoulder (inches)</Label>
              <Input
                id="shoulder"
                type="number"
                value={shoulder}
                onChange={(e) => setShoulder(e.target.value)}
                placeholder="e.g., 18"
              />
            </div>
            <div>
              <Label htmlFor="neck">Neck (inches)</Label>
              <Input
                id="neck"
                type="number"
                value={neck}
                onChange={(e) => setNeck(e.target.value)}
                placeholder="e.g., 15"
              />
            </div>
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