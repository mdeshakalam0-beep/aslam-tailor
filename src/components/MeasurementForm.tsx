import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';

const MeasurementForm: React.FC = () => {
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [sleeveLength, setSleeveLength] = useState('');
  const [shoulder, setShoulder] = useState('');
  const [neck, setNeck] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveMeasurements = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    // In a real application, you would save these measurements to Supabase
    // For now, we'll just simulate a save and show a toast.
    console.log('Saving measurements:', { chest, waist, sleeveLength, shoulder, neck });

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSuccess('Measurements saved successfully!');
      // Optionally clear form or update user profile
    } catch (error) {
      console.error('Failed to save measurements:', error);
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