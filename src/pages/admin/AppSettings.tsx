import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, UploadCloud, Image as ImageIcon, XCircle } from 'lucide-react'; // Import XCircle
import { getAppSettings, upsertAppSetting, uploadAppSettingImage, deleteAppSettingImage } from '@/utils/appSettings'; // Import new utils

interface AppSetting {
  key: string;
  value: string;
}

const AppSettings: React.FC = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [selectedQrFile, setSelectedQrFile] = useState<File | null>(null);
  const [phonePeDeepLink, setPhonePeDeepLink] = useState('');
  const [loginBgImageUrl, setLoginBgImageUrl] = useState<string | null>(null); // New state for login background image
  const [selectedLoginBgFile, setSelectedLoginBgFile] = useState<File | null>(null); // New state for login background file
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [uploadingLoginBg, setUploadingLoginBg] = useState(false); // New state for login background upload

  useEffect(() => {
    fetchAppSettings();
  }, []);

  const fetchAppSettings = async () => {
    setLoading(true);
    try {
      const settings = await getAppSettings();
      settings.forEach(setting => {
        if (setting.key === 'qr_code_url') setQrCodeUrl(setting.value);
        if (setting.key === 'phonepe_deep_link') setPhonePeDeepLink(setting.value || '');
        if (setting.key === 'login_bg_image_url') setLoginBgImageUrl(setting.value); // Set new setting
      });
    } catch (error) {
      console.error('Error fetching app settings:', error);
      showError('Failed to load app settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleQrFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedQrFile(event.target.files[0]);
    } else {
      setSelectedQrFile(null);
    }
  };

  const handleLoginBgFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedLoginBgFile(event.target.files[0]);
    } else {
      setSelectedLoginBgFile(null);
    }
  };

  const handleRemoveLoginBgImage = async () => {
    if (loginBgImageUrl) {
      const success = await deleteAppSettingImage(loginBgImageUrl);
      if (success) {
        await upsertAppSetting('login_bg_image_url', null);
        setLoginBgImageUrl(null);
        showSuccess('Login background image removed successfully!');
      } else {
        showError('Failed to remove login background image.');
      }
    }
  };

  const handleSaveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      let finalQrCodeUrl = qrCodeUrl;
      let finalLoginBgImageUrl = loginBgImageUrl;

      // Handle QR Code Image Upload
      if (selectedQrFile) {
        const uploadedUrl = await uploadAppSettingImage(selectedQrFile, 'qr-codes'); // Specify folder
        if (uploadedUrl) {
          finalQrCodeUrl = uploadedUrl;
        } else {
          setSaving(false);
          return;
        }
      } else if (qrCodeUrl === null) {
        finalQrCodeUrl = null;
      }

      // Handle Login Background Image Upload
      if (selectedLoginBgFile) {
        const uploadedUrl = await uploadAppSettingImage(selectedLoginBgFile, 'login-backgrounds'); // Specify folder
        if (uploadedUrl) {
          finalLoginBgImageUrl = uploadedUrl;
        } else {
          setSaving(false);
          return;
        }
      } else if (loginBgImageUrl === null) {
        finalLoginBgImageUrl = null;
      }

      // Upsert each setting
      await upsertAppSetting('qr_code_url', finalQrCodeUrl);
      await upsertAppSetting('phonepe_deep_link', phonePeDeepLink);
      await upsertAppSetting('login_bg_image_url', finalLoginBgImageUrl); // Save new setting

      setQrCodeUrl(finalQrCodeUrl);
      setSelectedQrFile(null);
      setLoginBgImageUrl(finalLoginBgImageUrl); // Update local state with the new URL
      setSelectedLoginBgFile(null); // Clear selected file after successful upload/save
      showSuccess('App settings saved successfully!');
    } catch (error) {
      console.error('Error saving app settings:', error);
      showError('Failed to save app settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-foreground">App Settings</h2>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">Payment & Integration Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground">Loading settings...</p>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <Label htmlFor="qrCodeImage">QR Code Image</Label>
                <div className="flex items-center space-x-4 mt-2">
                  {qrCodeUrl && !selectedQrFile ? (
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img src={qrCodeUrl} alt="Current QR Code" className="w-full h-full object-contain border rounded-md" />
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 rounded-full">Current</span>
                    </div>
                  ) : selectedQrFile ? (
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img src={URL.createObjectURL(selectedQrFile)} alt="Selected QR Code" className="w-full h-full object-contain border rounded-md" />
                      <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-1 rounded-full">New</span>
                    </div>
                  ) : (
                    <div className="w-24 h-24 flex-shrink-0 border rounded-md flex items-center justify-center bg-muted text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="qrCodeImage"
                      type="file"
                      accept="image/*"
                      onChange={handleQrFileChange}
                      disabled={uploadingQr}
                      className="file:text-primary file:bg-primary-foreground file:border-primary file:hover:bg-primary/90 file:hover:text-primary-foreground"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload your QR code image for payment.
                    </p>
                  </div>
                </div>
                {uploadingQr && (
                  <p className="text-sm text-muted-foreground mt-2 flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading QR Code...
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="phonePeDeepLink">PhonePe Deep Link Base URL</Label>
                <Input
                  id="phonePeDeepLink"
                  type="url"
                  value={phonePeDeepLink}
                  onChange={(e) => setPhonePeDeepLink(e.target.value)}
                  placeholder="e.g., phonepe://pay?pa=yourupi@bank&pn=YourName&am="
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the base URL for PhonePe deep link. The total amount will be appended to this.
                  Example: `phonepe://pay?pa=yourupi@bank&pn=YourName&am=`
                </p>
              </div>

              {/* New: Login Page Background Image */}
              <div className="border-t pt-4 mt-4">
                <Label htmlFor="loginBgImage">Login Page Background Image (Optional)</Label>
                <div className="flex items-center space-x-4 mt-2">
                  {loginBgImageUrl && !selectedLoginBgFile ? (
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img src={loginBgImageUrl} alt="Current Login Background" className="w-full h-full object-contain border rounded-md" />
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 rounded-full">Current</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-6 w-6 text-destructive hover:text-destructive/90 bg-background/70 rounded-full"
                        onClick={handleRemoveLoginBgImage}
                        type="button"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : selectedLoginBgFile ? (
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img src={URL.createObjectURL(selectedLoginBgFile)} alt="Selected Login Background" className="w-full h-full object-contain border rounded-md" />
                      <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-1 rounded-full">New</span>
                    </div>
                  ) : (
                    <div className="w-24 h-24 flex-shrink-0 border rounded-md flex items-center justify-center bg-muted text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="loginBgImage"
                      type="file"
                      accept="image/*"
                      onChange={handleLoginBgFileChange}
                      disabled={uploadingLoginBg}
                      className="file:text-primary file:bg-primary-foreground file:border-primary file:hover:bg-primary/90 file:hover:text-primary-foreground"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Upload an image to use as a subtle background on the login page.
                    </p>
                  </div>
                </div>
                {uploadingLoginBg && (
                  <p className="text-sm text-muted-foreground mt-2 flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading Login Background...
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={saving || uploadingQr || uploadingLoginBg}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppSettings;