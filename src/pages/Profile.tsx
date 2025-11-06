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
import { UserCircle2 } from 'lucide-react'; // For a placeholder avatar
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'; // Import Accordion components

const Profile: React.FC = () => {
  const { session } = useSession();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // New state for address fields
  const [phone, setPhone] = useState<string | null>(null);
  const [streetAddress, setStreetAddress] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [pincode, setPincode] = useState<string | null>(null);
  const [postOffice, setPostOffice] = useState<string | null>(null);
  const [landmark, setLandmark] = useState<string | null>(null);

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
        .select(`first_name, last_name, avatar_url, phone, street_address, city, state, pincode, post_office, landmark`)
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setAvatarUrl(data.avatar_url);
        // Set new address fields
        setPhone(data.phone);
        setStreetAddress(data.street_address);
        setCity(data.city);
        setState(data.state);
        setPincode(data.pincode);
        setPostOffice(data.post_office);
        setLandmark(data.landmark);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      showError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (event: React.FormEvent, newAvatarUrl?: string | null) => {
    event.preventDefault();
    try {
      setLoading(true);
      const { user } = session!;

      const updates = {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        avatar_url: newAvatarUrl !== undefined ? newAvatarUrl : avatarUrl, // Use newAvatarUrl if provided, otherwise current state
        updated_at: new Date().toISOString(),
        // Include new address fields
        phone: phone,
        street_address: streetAddress,
        city: city,
        state: state,
        pincode: pincode,
        post_office: postOffice,
        landmark: landmark,
      };

      // Explicitly specify onConflict for upsert to ensure it uses the primary key for conflict resolution
      const { error } = await supabase.from('profiles').upsert(updates, { onConflict: 'id' });

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

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${session!.user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const uploadedAvatarUrl = data.publicUrl;
      setAvatarUrl(uploadedAvatarUrl); // Update local state
      showSuccess('Avatar uploaded successfully!');
      // Automatically update profile with new avatar URL, passing it directly
      await updateProfile({ preventDefault: () => {} } as React.FormEvent, uploadedAvatarUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showError('Failed to upload avatar.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    if (!session) {
      showSuccess('You are already logged out.');
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        // If the error indicates a missing session or forbidden,
        // treat it as a successful logout from the client's perspective
        // and let SessionContextProvider handle the redirect.
        if (error.message.includes('Auth session missing') || error.status === 403) {
          console.warn('Logout failed with Auth session missing or 403, forcing client-side logout.');
          // Manually clear session data if signOut failed with 403
          // This will trigger onAuthStateChange with null in SessionContextProvider
          await supabase.auth.setSession(null); 
          showSuccess('Logged out successfully!');
          return;
        }
        throw error;
      }
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
                <div className="flex flex-col items-center space-y-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-contain border-2 border-primary p-1"
                    />
                  ) : (
                    <UserCircle2 className="w-24 h-24 text-muted-foreground" />
                  )}
                  <Label htmlFor="avatar" className="cursor-pointer text-primary hover:underline">
                    {uploading ? 'Uploading...' : 'Upload Avatar'}
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={uploadAvatar}
                      disabled={uploading}
                      className="hidden"
                    />
                  </Label>
                </div>
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

                {/* Address Section using Accordion */}
                <Accordion type="single" collapsible className="w-full border-t pt-4 mt-4">
                  <AccordionItem value="address-section" className="border-b-0">
                    <AccordionTrigger className="text-xl font-semibold text-foreground hover:no-underline py-2">
                      Your Saved Address
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone || ''}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="streetAddress">Street Address / Village / Road</Label>
                        <Textarea
                          id="streetAddress"
                          value={streetAddress || ''}
                          onChange={(e) => setStreetAddress(e.target.value)}
                          placeholder="House No., Building Name, Street, Village, Road"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            type="text"
                            value={city || ''}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            type="text"
                            value={state || ''}
                            onChange={(e) => setState(e.target.value)}
                            placeholder="State"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="pincode">Pincode</Label>
                          <Input
                            id="pincode"
                            type="text"
                            value={pincode || ''}
                            onChange={(e) => setPincode(e.target.value)}
                            placeholder="Pincode"
                          />
                        </div>
                        <div>
                          <Label htmlFor="postOffice">Post Office (Optional)</Label>
                          <Input
                            id="postOffice"
                            type="text"
                            value={postOffice || ''}
                            onChange={(e) => setPostOffice(e.target.value)}
                            placeholder="Post Office"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="landmark">Landmark / Near / Famous (Optional)</Label>
                        <Input
                          id="landmark"
                          type="text"
                          value={landmark || ''}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder="e.g., Near XYZ Temple"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading || uploading}>
                  {loading ? 'Saving...' : 'Update Profile'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full mt-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleLogout}
                  disabled={loading || uploading}
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