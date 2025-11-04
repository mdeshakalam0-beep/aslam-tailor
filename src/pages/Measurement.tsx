import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import useLocation
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import MeasurementForm from '@/components/MeasurementForm';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { showError } from '@/utils/toast';
import { UserMeasurements } from '@/types/checkout'; // Import updated UserMeasurements type

const Measurement: React.FC = () => {
  const { session } = useSession();
  const location = useLocation(); // Use useLocation hook
  const [initialMeasurements, setInitialMeasurements] = useState<UserMeasurements | undefined>(undefined);
  const [userGender, setUserGender] = useState<'men' | 'women' | 'not_specified'>('not_specified');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Removed preselectedType state as it's no longer needed here

  // Removed useEffect for reading URL params as preselectedType is no longer used

  const fetchUserData = async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch user's gender from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('gender')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        throw profileError;
      }
      setUserGender(profileData.gender || 'not_specified');

      // Fetch user's measurements
      const { data: measurementsData, error: fetchError } = await supabase
        .from('measurements')
        .select('*') // Select all columns now
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (measurementsData) {
        setInitialMeasurements(measurementsData as UserMeasurements);
      } else {
        setInitialMeasurements({}); // No existing measurements
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
            initialMeasurements={initialMeasurements} 
            onSaveSuccess={fetchUserData} 
            userGender={userGender}
            // Removed preselectedType prop
          />
        )}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Measurement;