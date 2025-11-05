import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import MeasurementForm from '@/components/MeasurementForm';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { showError } from '@/utils/toast';
import { UserMeasurements } from '@/types/checkout';

const Measurement: React.FC = () => {
  const { session } = useSession();
  const location = useLocation();
  const [initialMeasurements, setInitialMeasurements] = useState<UserMeasurements | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch user's most recent measurement
      const { data: measurementsData, error: fetchError } = await supabase
        .from('measurements')
        .select('*')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false }) // Order by most recent
        .limit(1); // Get only one result

      if (fetchError) {
        throw fetchError;
      }

      if (measurementsData && measurementsData.length > 0) {
        setInitialMeasurements(measurementsData[0] as UserMeasurements);
      } else {
        setInitialMeasurements(undefined); // No existing measurements
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
    fetchUserData();
  }, [session]);

  // A simple onCancel handler for this page
  const handleCancel = () => {
    console.log("Measurement form cancelled.");
    // In this context, we might just re-fetch or do nothing, as it's a dedicated page.
    // If there was a list of measurements, we might navigate back.
  };

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
          <MeasurementForm
            measurementId={initialMeasurements?.id} // Pass the ID if available
            onSave={fetchUserData} // Re-fetch data on save
            onCancel={handleCancel} // Provide a cancel handler
          />
        )}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Measurement;