import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import MeasurementForm from '@/components/MeasurementForm';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { showError } from '@/utils/toast';

interface UserMeasurements {
  chest?: number;
  waist?: number;
  sleeve_length?: number;
  shoulder?: number;
  neck?: number;
}

const Measurement: React.FC = () => {
  const { session } = useSession();
  const [initialMeasurements, setInitialMeasurements] = useState<UserMeasurements | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeasurements = async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError, status } = await supabase
        .from('measurements')
        .select('chest, waist, sleeve_length, shoulder, neck')
        .eq('user_id', session.user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
        throw fetchError;
      }

      if (data) {
        setInitialMeasurements(data);
      } else {
        setInitialMeasurements({}); // No existing measurements
      }
    } catch (err) {
      console.error('Error fetching measurements:', err);
      setError('Failed to load measurements. Please try again.');
      showError('Failed to load measurements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, [session]);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-foreground text-center">Your Measurements</h1>
        <p className="text-lg text-muted-foreground mb-6 text-center">
          Save your measurements for a perfect fit.
        </p>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading measurements...</p>
        ) : error ? (
          <p className="text-center text-destructive">{error}</p>
        ) : (
          <MeasurementForm initialMeasurements={initialMeasurements} onSaveSuccess={fetchMeasurements} />
        )}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Measurement;