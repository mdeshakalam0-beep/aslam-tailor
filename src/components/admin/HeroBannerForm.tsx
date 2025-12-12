import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeroBanner } from '@/utils/banners';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Loader2, Image as ImageIcon } from 'lucide-react';

interface HeroBannerFormProps {
  initialData?: HeroBanner;
  onSubmit: (data: Omit<HeroBanner, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  loading: boolean;
}

const HeroBannerForm: React.FC<HeroBannerFormProps> = ({ initialData, onSubmit, loading }) => {
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '');
  const [headline, setHeadline] = useState(initialData?.headline || '');
  const [ctaText, setCtaText] = useState(initialData?.cta_text || '');
  const [ctaLink, setCtaLink] = useState<string | null>(initialData?.cta_link || null);
  const [order, setOrder] = useState(initialData?.order?.toString() || '0');

  const [useUrlInput, setUseUrlInput] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (initialData) {
      setImageUrl(initialData.image_url || '');
      setHeadline(initialData.headline);
      setCtaText(initialData.cta_text);
      setCtaLink(initialData.cta_link || null);
      setOrder(initialData.order?.toString() || '0');
      setUseUrlInput(true);
      setSelectedFile(null);
    } else {
      setUseUrlInput(true);
      setSelectedFile(null);
    }
  }, [initialData]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const uploadFileToSupabase = async (file: File): Promise<string | null> => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner_${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `public/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('banner-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('banner-images').getPublicUrl(filePath);
      showSuccess('Banner image uploaded successfully!');
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading banner image:', error);
      showError('Failed to upload banner image.');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    let finalImageUrl = imageUrl;

    if (!useUrlInput) {
      if (selectedFile) {
        const uploadedUrl = await uploadFileToSupabase(selectedFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          showError('Image upload failed. Please try again.');
          return;
        }
      } else if (!initialData?.image_url) {
        showError('Please upload an image or provide an image URL.');
        return;
      }
    }

    if (!finalImageUrl) {
      showError('Image URL cannot be empty.');
      return;
    }

    const bannerData = {
      image_url: finalImageUrl,
      headline,
      cta_text: ctaText,
      cta_link: ctaLink || '',
      order: parseInt(order),
    };

    await onSubmit(bannerData);
  };

  return (
    <Card className="w-full border border-card-border shadow-elev">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-text-primary-heading">
          {initialData ? 'Edit Hero Banner' : 'Add New Hero Banner'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between space-x-2 p-2 border border-card-border rounded-small bg-primary-pale-pink">
            <Label htmlFor="image-upload-toggle" className="flex items-center space-x-2 cursor-pointer text-text-secondary-body">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              <span>Upload Image via URL</span>
            </Label>
            <Switch
              id="image-upload-toggle"
              checked={useUrlInput}
              onCheckedChange={setUseUrlInput}
            />
          </div>

          {useUrlInput ? (
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/banner.jpg"
                required
                className="border border-card-border rounded-small focus:ring-accent-rose"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="device-image">Upload Image from Device</Label>
              <Input
                id="device-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploadingImage}
                className="file:text-primary file:bg-primary-pale-pink file:border-primary-pale-pink file:hover:bg-secondary-soft-pink file:hover:text-accent-dark border border-card-border rounded-small focus:ring-accent-rose"
              />
              {selectedFile && (
                <p className="text-sm text-text-secondary-body mt-2">
                  {selectedFile.name} selected.
                </p>
              )}
              {initialData?.image_url && !selectedFile && (
                <p className="text-sm text-text-secondary-body mt-2">
                  No new file selected. Existing image will be kept.
                </p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g., View Latest Collection"
              required
              className="border border-card-border rounded-small focus:ring-accent-rose"
            />
          </div>
          <div>
            <Label htmlFor="ctaText">Call to Action Text</Label>
            <Input
              id="ctaText"
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="e.g., Shop Now"
              required
              className="border border-card-border rounded-small focus:ring-accent-rose"
            />
          </div>
          <div>
            <Label htmlFor="ctaLink">Call to Action Link (URL) (Optional)</Label>
            <Input
              id="ctaLink"
              type="url"
              value={ctaLink || ''}
              onChange={(e) => setCtaLink(e.target.value || null)}
              placeholder="e.g., /products"
              className="border border-card-border rounded-small focus:ring-accent-rose"
            />
          </div>
          <div>
            <Label htmlFor="order">Display Order (Lower number appears first)</Label>
            <Input
              id="order"
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              placeholder="e.g., 1"
              min="0"
              className="border border-card-border rounded-small focus:ring-accent-rose"
            />
          </div>
          <Button type="submit" className="w-full bg-accent-rose text-white hover:bg-accent-dark rounded-small" disabled={loading || uploadingImage}>
            {loading || uploadingImage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploadingImage ? 'Uploading Image...' : 'Saving...'}
              </>
            ) : (initialData ? 'Update Banner' : 'Add Banner')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default HeroBannerForm;