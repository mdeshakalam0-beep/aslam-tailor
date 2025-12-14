import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { showSuccess, showError } from '@/utils/toast';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import { 
  UserCircle2, 
  MessageCircle, 
  Camera, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  LogOut, 
  Save, 
  Home, 
  Building2 
} from 'lucide-react';
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
    <div className="min-h-screen bg-off-white-page-bg pb-24 md:pb-8">
      <Header />
      
      <main className="container mx-auto px-4 pt-6 max-w-lg">
        {loading ? (
          <div className="flex justify-center items-center h-64">
             <p className="text-text-secondary-body animate-pulse">Loading profile...</p>
          </div>
        ) : (
          <form onSubmit={updateProfile} className="space-y-6 relative">
            
            {/* 1. Header & Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                       <UserCircle2 className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Camera Icon Button */}
                <Label 
                  htmlFor="avatar" 
                  className="absolute bottom-1 right-1 bg-accent-rose text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-accent-dark transition-colors"
                >
                  <Camera size={16} />
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

              <div className="mt-4 text-center">
                 <h2 className="text-2xl font-bold text-text-primary-heading">
                    {firstName || 'User'} {lastName || ''}
                 </h2>
                 <p className="text-text-secondary-body flex items-center justify-center gap-1.5 mt-1 text-sm">
                    <Mail size={14} />
                    {email}
                 </p>
              </div>
            </div>

            {/* 2. Personal Info Section */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-card-border/60">
                <h3 className="text-sm font-semibold text-text-secondary-body uppercase tracking-wider mb-4 flex items-center gap-2">
                    <User size={16} className="text-accent-rose"/> Personal Info
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="firstName" className="text-xs text-muted-foreground">First Name</Label>
                            <Input
                                id="firstName"
                                type="text"
                                value={firstName || ''}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="bg-gray-50 border-gray-200 rounded-xl focus:ring-accent-rose focus:border-accent-rose"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="lastName" className="text-xs text-muted-foreground">Last Name</Label>
                            <Input
                                id="lastName"
                                type="text"
                                value={lastName || ''}
                                onChange={(e) => setLastName(e.target.value)}
                                className="bg-gray-50 border-gray-200 rounded-xl focus:ring-accent-rose focus:border-accent-rose"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Address Section (Clean Accordion) */}
            <div className="bg-white rounded-2xl shadow-sm border border-card-border/60 overflow-hidden">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="address-section" className="border-b-0">
                    <AccordionTrigger className="px-5 py-4 hover:bg-gray-50 hover:no-underline transition-colors group">
                        <div className="flex items-center gap-3 text-left">
                            <div className="p-2 bg-pink-50 rounded-lg text-accent-rose group-hover:bg-pink-100 transition-colors">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-text-primary-heading">Saved Address</h3>
                                <p className="text-xs text-text-secondary-body">Manage delivery location</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 pb-5 space-y-4">
                      
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-xs text-muted-foreground">Phone Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                            id="phone"
                            type="tel"
                            value={phone || ''}
                            onChange={(e) => setPhone(e.target.value)}
                            className="pl-9 bg-gray-50 border-gray-200 rounded-xl"
                            placeholder="Phone number"
                            />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="streetAddress" className="text-xs text-muted-foreground">Street Address / Road</Label>
                        <Textarea
                          id="streetAddress"
                          value={streetAddress || ''}
                          onChange={(e) => setStreetAddress(e.target.value)}
                          placeholder="House No, Street, Area"
                          className="bg-gray-50 border-gray-200 rounded-xl min-h-[80px]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="city" className="text-xs text-muted-foreground">City</Label>
                          <Input
                            id="city"
                            value={city || ''}
                            onChange={(e) => setCity(e.target.value)}
                            className="bg-gray-50 border-gray-200 rounded-xl"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="state" className="text-xs text-muted-foreground">State</Label>
                          <Input
                            id="state"
                            value={state || ''}
                            onChange={(e) => setState(e.target.value)}
                            className="bg-gray-50 border-gray-200 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="pincode" className="text-xs text-muted-foreground">Pincode</Label>
                          <Input
                            id="pincode"
                            value={pincode || ''}
                            onChange={(e) => setPincode(e.target.value)}
                            className="bg-gray-50 border-gray-200 rounded-xl"
                          />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="landmark" className="text-xs text-muted-foreground">Landmark</Label>
                            <Input
                                id="landmark"
                                value={landmark || ''}
                                onChange={(e) => setLandmark(e.target.value)}
                                className="bg-gray-50 border-gray-200 rounded-xl"
                            />
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                          <Label htmlFor="postOffice" className="text-xs text-muted-foreground">Post Office (Optional)</Label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                id="postOffice"
                                value={postOffice || ''}
                                onChange={(e) => setPostOffice(e.target.value)}
                                className="pl-9 bg-gray-50 border-gray-200 rounded-xl"
                            />
                          </div>
                      </div>

                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
            </div>

            {/* 4. Support Section */}
            {(whatsappNumber1 || whatsappNumber2) && (
             <div className="bg-white rounded-2xl shadow-sm border border-card-border/60 overflow-hidden">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="contact-section" className="border-b-0">
                        <AccordionTrigger className="px-5 py-4 hover:bg-gray-50 hover:no-underline transition-colors group">
                            <div className="flex items-center gap-3 text-left">
                                <div className="p-2 bg-green-50 rounded-lg text-green-600 group-hover:bg-green-100 transition-colors">
                                    <MessageCircle size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-text-primary-heading">Help & Support</h3>
                                    <p className="text-xs text-text-secondary-body">Contact us on WhatsApp</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-5 pb-5 space-y-3">
                            {whatsappNumber1 && (
                            <Button asChild variant="outline" className="w-full justify-start h-auto py-3 px-4 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl">
                                <a href={`https://wa.me/${whatsappNumber1.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                                <div className="bg-green-500 rounded-full p-1 text-white"><MessageCircle size={14} fill="currentColor" /></div>
                                <span className="font-medium">Chat with Admin 1</span>
                                </a>
                            </Button>
                            )}
                            {whatsappNumber2 && (
                            <Button asChild variant="outline" className="w-full justify-start h-auto py-3 px-4 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl">
                                <a href={`https://wa.me/${whatsappNumber2.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                                <div className="bg-green-500 rounded-full p-1 text-white"><MessageCircle size={14} fill="currentColor" /></div>
                                <span className="font-medium">Chat with Admin 2</span>
                                </a>
                            </Button>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
             </div>
            )}

            {/* 5. Action Buttons */}
            <div className="pt-4 flex flex-col gap-3">
                <Button 
                    type="submit" 
                    className="w-full h-12 text-base bg-accent-rose hover:bg-accent-dark text-white rounded-xl shadow-md shadow-accent-rose/20 transition-all active:scale-[0.98]" 
                    disabled={loading || uploading}
                >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving Changes...' : 'Save Changes'}
                </Button>
                
                <Button
                  variant="ghost"
                  type="button"
                  className="w-full h-12 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                  onClick={handleLogout}
                  disabled={loading || uploading}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
            </div>

          </form>
        )}
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Profile;