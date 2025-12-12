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
import { UserCircle2, MessageCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getAppSettings } from '@/utils/appSettings';

const Profile: React.FC = () => {
  const { session } = useSession();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [phone, setPhone] = useState<string | null>(null);
  const [streetAddress, setStreetAddress] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [pincode, setPincode] = useState<string | null>(null);
  const [postOffice, setPostOffice] = useState<string | null>(null);
  const [landmark, setLandmark] = useState<string | null>(null);

  const [whatsappNumber1, setWhatsappNumber1] = useState<string | null>(null);
  const [whatsappNumber2, setWhatsappNumber2] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      getProfile();
      setEmail(session.user?.email || null);
    }
    fetchAppSettingsForContact();
  }, [session]);

  const fetchAppSettingsForContact = async () => {
    try {
      const settings = await getAppSettings();
      const num1 = settings.find(setting => setting.key === 'whatsapp_number_1')?.value || null;
      const num2 = settings.find(setting => setting.key === 'whatsapp_number_2')?.value || null;
      setWhatsappNumber1(num1);
      setWhatsappNumber2(num2);
    } catch (error) {
      console.error('Error fetching WhatsApp numbers:', error);
      showError('Failed to load contact numbers.');
    }
  };

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
        avatar_url: newAvatarUrl !== undefined ? newAvatarUrl : avatarUrl,
        updated_at: new Date().toISOString(),
        phone: phone,
        street_address: streetAddress,
        city: city,
        state: state,
        pincode: pincode,
        post_office: postOffice,
        landmark: landmark,
      };

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
      setAvatarUrl(uploadedAvatarUrl);
      showSuccess('Avatar uploaded successfully!');
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
        if (error.message.includes('Auth session missing') || error.status === 403) {
          console.warn('Logout failed with Auth session missing or 403, forcing client-side logout.');
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
    <div className="min-h-screen bg-off-white-page-bg pb-16 md:pb-0">
      <Header />
      <main className="container mx-auto p-4">
        <Card className="max-w-md mx-auto shadow-elev border border-card-border rounded-default">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-text-primary-heading">Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-text-secondary-body">Loading profile...</p>
            ) : (
              <form onSubmit={updateProfile} className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-contain border-2 border-accent-rose p-1"
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
                  <Input id="email" type="email" value={email || ''} disabled className="bg-muted border-card-border rounded-small" />
                </div>
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName || ''}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    className="border border-card-border rounded-small focus:ring-accent-rose"
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
                    className="border border-card-border rounded-small focus:ring-accent-rose"
                  />
                </div>

                {/* Address Section using Accordion */}
                <Accordion type="single" collapsible className="w-full border-t border-card-border pt-4 mt-4">
                  <AccordionItem value="address-section" className="border-b-0">
                    <AccordionTrigger className="text-xl font-semibold text-text-primary-heading hover:no-underline py-2">
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
                          className="border border-card-border rounded-small focus:ring-accent-rose"
                        />
                      </div>
                      <div>
                        <Label htmlFor="streetAddress">Street Address / Village / Road</Label>
                        <Textarea
                          id="streetAddress"
                          value={streetAddress || ''}
                          onChange={(e) => setStreetAddress(e.target.value)}
                          placeholder="House No., Building Name, Street, Village, Road"
                          className="border border-card-border rounded-small focus:ring-accent-rose"
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
                            className="border border-card-border rounded-small focus:ring-accent-rose"
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
                            className="border border-card-border rounded-small focus:ring-accent-rose"
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
                            className="border border-card-border rounded-small focus:ring-accent-rose"
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
                            className="border border-card-border rounded-small focus:ring-accent-rose"
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
                          className="border border-card-border rounded-small focus:ring-accent-rose"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* New: Contact Admin Section */}
                {(whatsappNumber1 || whatsappNumber2) && (
                  <Accordion type="single" collapsible className="w-full border-t border-card-border pt-4 mt-4">
                    <AccordionItem value="contact-admin-section" className="border-b-0">
                      <AccordionTrigger className="text-xl font-semibold text-text-primary-heading hover:no-underline py-2">
                        Contact Admin
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-4">
                        <p className="text-text-secondary-body text-sm">
                          किसी भी समस्या या प्रश्न के लिए, आप हमारे एडमिन से WhatsApp पर संपर्क कर सकते हैं:
                        </p>
                        {whatsappNumber1 && (
                          <Button asChild variant="outline" className="w-full justify-start bg-green-500 text-white hover:bg-green-600 rounded-small">
                            <a href={`https://wa.me/${whatsappNumber1.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                              <MessageCircle className="h-5 w-5 mr-2" />
                              WhatsApp Admin 1: {whatsappNumber1}
                            </a>
                          </Button>
                        )}
                        {whatsappNumber2 && (
                          <Button asChild variant="outline" className="w-full justify-start bg-green-500 text-white hover:bg-green-600 rounded-small">
                            <a href={`https://wa.me/${whatsappNumber2.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center">
                              <MessageCircle className="h-5 w-5 mr-2" />
                              WhatsApp Admin 2: {whatsappNumber2}
                            </a>
                          </Button>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}

                <Button type="submit" className="w-full bg-accent-rose text-white hover:bg-accent-dark rounded-small" disabled={loading || uploading}>
                  {loading ? 'Saving...' : 'Update Profile'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full mt-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-small"
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