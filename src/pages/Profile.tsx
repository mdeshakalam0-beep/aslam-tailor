import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { showSuccess, showError } from '@/utils/toast';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

const Profile: React.FC = () => {
  const { session } = useSession();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      getProfile();
      setEmail(session.user?.email || null);
    }
  }, [session]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { user } = session!;

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`first_name, last_name`)
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setFirstName(data.first_name);
        setLastName(data.last_name);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      showError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setLoading(true);
      const { user } = session!;

      const updates = {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        throw error;
      }
      showSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating user profile:', error);
      showError('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      showSuccess('Logged out successfully!');
    } catch (error) {
      console.error('Error logging out:', error);
      showError('Failed to log out.');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-foreground">Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Loading profile...</p>
            ) : (
              <form onSubmit={updateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email || ''} disabled className="bg-muted" />
                </div>
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName || ''}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName || ''}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                  {loading ? 'Saving...' : 'Update Profile'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full mt-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleLogout}
                  disabled={loading}
                >
                  Logout
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Profile;