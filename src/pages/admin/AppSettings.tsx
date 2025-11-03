import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, UploadCloud, Image as ImageIcon } from 'lucide-react'; // Import icons

interface AppSetting {
  key: string;
  value: string;
}

const AppSettings: React.FC = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [selectedQrFile, setSelectedQrFile] = useState<File | null>(null);
  const [phonePeDeepLink, setPhonePeDeepLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);

  useEffect(() => {
    fetchAppSettings();
  }, []);

  const fetchAppSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value');

      if (error) throw error;

      data.forEach(setting => {
        if (setting.key === 'qr_code_url') setQrCodeUrl(setting.value);
        if (setting.key === 'phonepe_deep_link') setPhonePeDeepLink(setting.value);
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

  const uploadQrCodeImage = async (file: File): Promise<string | null> => {
    setUploadingQr(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `qr_code_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`; // Store directly in the 'app-settings' bucket

      // First, delete any existing QR code image if its URL is known
      if (qrCodeUrl) {
        const oldFileName = qrCodeUrl.split('/').pop();
        if (oldFileName) {
          await supabase.storage.from('app-settings').remove([oldFileName]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('app-settings')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Upsert to replace if file with same name exists (though we use unique names)
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('app-settings').getPublicUrl(filePath);
      showSuccess('QR Code image uploaded successfully!');
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading QR Code image:', error);
      showError('Failed to upload QR Code image.');
      return null;
    } finally {
      setUploadingQr(false);
    }
  };

  const handleSaveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      let finalQrCodeUrl = qrCodeUrl;

      if (selectedQrFile) {
        const uploadedUrl = await uploadQrCodeImage(selectedQrFile);
        if (uploadedUrl) {
          finalQrCodeUrl = uploadedUrl;
        } else {
          setSaving(false);
          return; // Stop if QR upload failed
        }
      } else if (qrCodeUrl === null) {
        // If no file selected and no existing URL, ensure it's null in DB
        finalQrCodeUrl = null;
      }

      const settingsToUpdate = [
        { key: 'qr_code_url', value: finalQrCodeUrl },
        { key: 'phonepe_deep_link', value: phonePeDeepLink },
      ];

      // Upsert each setting
      for (const setting of settingsToUpdate) {
        const { error } = await supabase
          .from('app_settings')
          .upsert(setting, { onConflict: 'key' }); // Use onConflict to update if key exists

        if (error) throw error;
      }

      setQrCodeUrl(finalQrCodeUrl); // Update local state with the new URL
      setSelectedQrFile(null); // Clear selected file after successful upload/save
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
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={saving || uploadingQr}>
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