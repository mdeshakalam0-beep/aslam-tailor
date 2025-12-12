import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, UploadCloud, Image as ImageIcon, XCircle } from 'lucide-react';
import { getAppSettings, upsertAppSetting, uploadAppSettingImage, deleteAppSettingImage } from '@/utils/appSettings';

interface AppSetting {
  key: string;
  value: string;
}

const AppSettings: React.FC = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [selectedQrFile, setSelectedQrFile] = useState<File | null>(null);
  const [phonePeDeepLink, setPhonePeDeepLink] = useState('');
  const [loginBgImageUrl, setLoginBgImageUrl] = useState<string | null>(null);
  const [selectedLoginBgFile, setSelectedLoginBgFile] = useState<File | null>(null);
  const [shopLogoUrl, setShopLogoUrl] = useState<string | null>(null);
  const [selectedShopLogoFile, setSelectedShopLogoFile] = useState<File | null>(null);
  const [whatsappNumber1, setWhatsappNumber1] = useState<string>('');
  const [whatsappNumber2, setWhatsappNumber2] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [uploadingLoginBg, setUploadingLoginBg] = useState(false);
  const [uploadingShopLogo, setUploadingShopLogo] = useState(false);

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
        if (setting.key === 'login_bg_image_url') setLoginBgImageUrl(setting.value);
        if (setting.key === 'shop_logo_url') setShopLogoUrl(setting.value);
        if (setting.key === 'whatsapp_number_1') setWhatsappNumber1(setting.value || '');
        if (setting.key === 'whatsapp_number_2') setWhatsappNumber2(setting.value || '');
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

  const handleShopLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedShopLogoFile(event.target.files[0]);
    } else {
      setSelectedShopLogoFile(null);
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

  const handleRemoveShopLogo = async () => {
    if (shopLogoUrl) {
      const success = await deleteAppSettingImage(shopLogoUrl);
      if (success) {
        await upsertAppSetting('shop_logo_url', null);
        setShopLogoUrl(null);
        showSuccess('Shop logo removed successfully!');
      } else {
        showError('Failed to remove shop logo.');
      }
    }
  };

  const handleSaveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      let finalQrCodeUrl = qrCodeUrl;
      let finalLoginBgImageUrl = loginBgImageUrl;
      let finalShopLogoUrl = shopLogoUrl;

      if (selectedQrFile) {
        const uploadedUrl = await uploadAppSettingImage(selectedQrFile, 'qr-codes');
        if (uploadedUrl) {
          finalQrCodeUrl = uploadedUrl;
        } else {
          setSaving(false);
          return;
        }
      } else if (qrCodeUrl === null) {
        finalQrCodeUrl = null;
      }

      if (selectedLoginBgFile) {
        const uploadedUrl = await uploadAppSettingImage(selectedLoginBgFile, 'login-backgrounds');
        if (uploadedUrl) {
          finalLoginBgImageUrl = uploadedUrl;
        } else {
          setSaving(false);
          return;
        }
      } else if (loginBgImageUrl === null) {
        finalLoginBgImageUrl = null;
      }

      if (selectedShopLogoFile) {
        const uploadedUrl = await uploadAppSettingImage(selectedShopLogoFile, 'shop-logos');
        if (uploadedUrl) {
          finalShopLogoUrl = uploadedUrl;
        } else {
          setSaving(false);
          return;
        }
      } else if (shopLogoUrl === null) {
        finalShopLogoUrl = null;
      }

      await upsertAppSetting('qr_code_url', finalQrCodeUrl);
      await upsertAppSetting('phonepe_deep_link', phonePeDeepLink);
      await upsertAppSetting('login_bg_image_url', finalLoginBgImageUrl);
      await upsertAppSetting('shop_logo_url', finalShopLogoUrl);
      await upsertAppSetting('whatsapp_number_1', whatsappNumber1);
      await upsertAppSetting('whatsapp_number_2', whatsappNumber2);

      setQrCodeUrl(finalQrCodeUrl);
      setSelectedQrFile(null);
      setLoginBgImageUrl(finalLoginBgImageUrl);
      setSelectedLoginBgFile(null);
      setShopLogoUrl(finalShopLogoUrl);
      setSelectedShopLogoFile(null);
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
      <h2 className="text-3xl font-bold text-text-primary-heading">App Settings</h2>
      <Card className="shadow-elev border border-card-border rounded-default">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-text-primary-heading">Payment & Integration Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-text-secondary-body">Loading settings...</p>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <Label htmlFor="qrCodeImage">QR Code Image</Label>
                <div className="flex items-center space-x-4 mt-2">
                  {qrCodeUrl && !selectedQrFile ? (
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img src={qrCodeUrl} alt="Current QR Code" className="w-full h-full object-contain border border-card-border rounded-small" />
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 rounded-full">Current</span>
                    </div>
                  ) : selectedQrFile ? (
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img src={URL.createObjectURL(selectedQrFile)} alt="Selected QR Code" className="w-full h-full object-contain border border-card-border rounded-small" />
                      <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-1 rounded-full">New</span>
                    </div>
                  ) : (
                    <div className="w-24 h-24 flex-shrink-0 border border-card-border rounded-small flex items-center justify-center bg-primary-pale-pink text-muted-foreground">
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
                      className="file:text-primary file:bg-primary-pale-pink file:border-primary-pale-pink file:hover:bg-secondary-soft-pink file:hover:text-accent-dark border border-card-border rounded-small focus:ring-accent-rose"
                    />
                    <p className="text-sm text-text-secondary-body mt-1">
                      Upload your QR code image for payment.
                    </p>
                  </div>
                </div>
                {uploadingQr && (
                  <p className="text-sm text-text-secondary-body mt-2 flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-accent-rose" /> Uploading QR Code...
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
                  className="border border-card-border rounded-small focus:ring-accent-rose"
                />
                <p className="text-sm text-text-secondary-body mt-1">
                  Enter the base URL for PhonePe deep link. The total amount will be appended to this.
                  Example: `phonepe://pay?pa=yourupi@bank&pn=YourName&am=`
                </p>
              </div>

              {/* New: Login Page Background Image */}
              <div className="border-t border-card-border pt-4 mt-4">
                <Label htmlFor="loginBgImage">Login Page Background Image (Optional)</Label>
                <div className="flex items-center space-x-4 mt-2">
                  {loginBgImageUrl && !selectedLoginBgFile ? (
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img src={loginBgImageUrl} alt="Current Login Background" className="w-full h-full object-contain border border-card-border rounded-small" />
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
                      <img src={URL.createObjectURL(selectedLoginBgFile)} alt="Selected Login Background" className="w-full h-full object-contain border border-card-border rounded-small" />
                      <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-1 rounded-full">New</span>
                    </div>
                  ) : (
                    <div className="w-24 h-24 flex-shrink-0 border border-card-border rounded-small flex items-center justify-center bg-primary-pale-pink text-muted-foreground">
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
                      className="file:text-primary file:bg-primary-pale-pink file:border-primary-pale-pink file:hover:bg-secondary-soft-pink file:hover:text-accent-dark border border-card-border rounded-small focus:ring-accent-rose"
                    />
                    <p className="text-sm text-text-secondary-body mt-1">
                      Upload an image to use as a subtle background on the login page.
                    </p>
                  </div>
                </div>
                {uploadingLoginBg && (
                  <p className="text-sm text-text-secondary-body mt-2 flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-accent-rose" /> Uploading Login Background...
                  </p>
                )}
              </div>

              {/* New: Shop Logo */}
              <div className="border-t border-card-border pt-4 mt-4">
                <Label htmlFor="shopLogo">Shop Logo (Optional)</Label>
                <div className="flex items-center space-x-4 mt-2">
                  {shopLogoUrl && !selectedShopLogoFile ? (
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img src={shopLogoUrl} alt="Current Shop Logo" className="w-full h-full object-contain border border-card-border rounded-small" />
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 rounded-full">Current</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-0 right-0 h-6 w-6 text-destructive hover:text-destructive/90 bg-background/70 rounded-full"
                        onClick={handleRemoveShopLogo}
                        type="button"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : selectedShopLogoFile ? (
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <img src={URL.createObjectURL(selectedShopLogoFile)} alt="Selected Shop Logo" className="w-full h-full object-contain border border-card-border rounded-small" />
                      <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-1 rounded-full">New</span>
                    </div>
                  ) : (
                    <div className="w-24 h-24 flex-shrink-0 border border-card-border rounded-small flex items-center justify-center bg-primary-pale-pink text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="shopLogo"
                      type="file"
                      accept="image/*"
                      onChange={handleShopLogoFileChange}
                      disabled={uploadingShopLogo}
                      className="file:text-primary file:bg-primary-pale-pink file:border-primary-pale-pink file:hover:bg-secondary-soft-pink file:hover:text-accent-dark border border-card-border rounded-small focus:ring-accent-rose"
                    />
                    <p className="text-sm text-text-secondary-body mt-1">
                      Upload your shop logo. This will appear in the header.
                    </p>
                  </div>
                </div>
                {uploadingShopLogo && (
                  <p className="text-sm text-text-secondary-body mt-2 flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-accent-rose" /> Uploading Shop Logo...
                  </p>
                )}
              </div>

              {/* New: WhatsApp Contact Numbers */}
              <div className="border-t border-card-border pt-4 mt-4">
                <h3 className="text-lg font-semibold text-text-primary-heading mb-2">WhatsApp Contact Numbers</h3>
                <div>
                  <Label htmlFor="whatsappNumber1">WhatsApp Number 1 (Optional)</Label>
                  <Input
                    id="whatsappNumber1"
                    type="tel"
                    value={whatsappNumber1}
                    onChange={(e) => setWhatsappNumber1(e.target.value)}
                    placeholder="e.g., +919876543210"
                    className="border border-card-border rounded-small focus:ring-accent-rose"
                  />
                  <p className="text-sm text-text-secondary-body mt-1">
                    Enter the first WhatsApp number including country code (e.g., +91).
                  </p>
                </div>
                <div className="mt-4">
                  <Label htmlFor="whatsappNumber2">WhatsApp Number 2 (Optional)</Label>
                  <Input
                    id="whatsappNumber2"
                    type="tel"
                    value={whatsappNumber2}
                    onChange={(e) => setWhatsappNumber2(e.target.value)}
                    placeholder="e.g., +919988776655"
                    className="border border-card-border rounded-small focus:ring-accent-rose"
                  />
                  <p className="text-sm text-text-secondary-body mt-1">
                    Enter the second WhatsApp number including country code (e.g., +91).
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full bg-accent-rose text-white hover:bg-accent-dark rounded-small" disabled={saving || uploadingQr || uploadingLoginBg || uploadingShopLogo}>
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