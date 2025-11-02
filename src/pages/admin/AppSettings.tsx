import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

interface AppSetting {
  key: string;
  value: string;
}

const AppSettings: React.FC = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [phonePeDeepLink, setPhonePeDeepLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const handleSaveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const settingsToUpdate = [
        { key: 'qr_code_url', value: qrCodeUrl },
        { key: 'phonepe_deep_link', value: phonePeDeepLink },
      ];

      // Upsert each setting
      for (const setting of settingsToUpdate) {
        const { error } = await supabase
          .from('app_settings')
          .upsert(setting, { onConflict: 'key' }); // Use onConflict to update if key exists

        if (error) throw error;
      }

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
                <Label htmlFor="qrCodeUrl">QR Code Image URL</Label>
                <Input
                  id="qrCodeUrl"
                  type="url"
                  value={qrCodeUrl}
                  onChange={(e) => setQrCodeUrl(e.target.value)}
                  placeholder="e.g., https://example.com/qr-code.png"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the direct URL to your QR code image for payment.
                </p>
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
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppSettings;