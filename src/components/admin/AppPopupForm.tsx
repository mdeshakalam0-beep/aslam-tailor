import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { AppPopup, uploadAppPopupImage } from '@/utils/appPopups';
import { showError } from '@/utils/toast';

interface AppPopupFormProps {
  initialData: AppPopup; // Changed to be always defined
  onSubmit: (data: Omit<AppPopup, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  loading: boolean;
}

const AppPopupForm: React.FC<AppPopupFormProps> = ({ initialData, onSubmit, loading }) => {
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description || '');
  const [imageUrl, setImageUrl] = useState(initialData.image_url || '');
  const [ctaText, setCtaText] = useState(initialData.cta_text || '');
  const [ctaLink, setCtaLink] = useState(initialData.cta_link || '');
  const [order, setOrder] = useState(initialData.order.toString());
  const [isActive, setIsActive] = useState(initialData.is_active);

  const [useUrlInput, setUseUrlInput] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    // initialData is now guaranteed to be an object, so no need for if (initialData)
    setTitle(initialData.title);
    setDescription(initialData.description || '');
    setImageUrl(initialData.image_url || '');
    setCtaText(initialData.cta_text || '');
    setCtaLink(initialData.cta_link || '');
    setOrder(initialData.order.toString());
    setIsActive(initialData.is_active);
    setUseUrlInput(true); // Assume URL input for existing banners
    setSelectedFile(null);
  }, [initialData]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    let finalImageUrl = imageUrl;

    if (!useUrlInput) {
      if (selectedFile) {
        const uploadedUrl = await uploadAppPopupImage(selectedFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          showError('Image upload failed. Please try again.');
          return;
        }
      } else if (!initialData.image_url) { // No optional chaining needed here
        showError('Please upload an image or provide an image URL.');
        return;
      }
    }

    if (!title.trim()) {
      showError('Pop-up title cannot be empty.');
      return;
    }

    const popupData = {
      title,
      description: description.trim() || null,
      image_url: finalImageUrl || null,
      cta_text: ctaText.trim() || null,
      cta_link: ctaLink.trim() || null,
      order: parseInt(order),
      is_active: isActive,
    };

    await onSubmit(popupData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">
          {initialData.id ? 'Edit App Pop-up' : 'Add New App Pop-up'} {/* Check initialData.id */}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              type="text"
              value={String(title)} // Explicitly cast to String
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Special Offer!"
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={String(description)} // Explicitly cast to String
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description for the pop-up."
              rows={3}
            />
          </div>

          {/* Image Upload Options */}
          <div className="flex items-center justify-between space-x-2 p-2 border rounded-md bg-muted/50">
            <Label htmlFor="image-upload-toggle" className="flex items-center space-x-2 cursor-pointer">
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
              <Label htmlFor="imageUrl">Image URL (Optional)</Label>
              <Input
                id="imageUrl"
                type="url"
                value={String(imageUrl)} // Explicitly cast to String
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/popup.jpg"
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="device-image">Upload Image from Device (Optional)</Label>
              <Input
                id="device-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploadingImage}
                className="file:text-primary file:bg-primary-foreground file:border-primary file:hover:bg-primary/90 file:hover:text-primary-foreground"
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedFile.name} selected.
                </p>
              )}
              {initialData.image_url && !selectedFile && ( // No optional chaining needed here
                <p className="text-sm text-muted-foreground mt-2">
                  No new file selected. Existing image will be kept.
                </p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="ctaText">Call to Action Text (Optional)</Label>
            <Input
              id="ctaText"
              type="text"
              value={String(ctaText)} // Explicitly cast to String
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="e.g., Shop Now"
            />
          </div>
          <div>
            <Label htmlFor="ctaLink">Call to Action Link (URL) (Optional)</Label>
            <Input
              id="ctaLink"
              type="url"
              value={String(ctaLink)} // Explicitly cast to String
              onChange={(e) => setCtaLink(e.target.value)}
              placeholder="e.g., /products/123"
            />
          </div>
          <div>
            <Label htmlFor="order">Display Order (Lower number appears first)</Label>
            <Input
              id="order"
              type="number"
              value={String(order)} // Explicitly cast to String
              onChange={(e) => setOrder(e.target.value)}
              placeholder="e.g., 1"
              min="0"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">Is Active</Label>
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading || uploadingImage}>
            {loading || uploadingImage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploadingImage ? 'Uploading Image...' : 'Saving...'}
              </>
            ) : (initialData.id ? 'Update Pop-up' : 'Add Pop-up')} {/* Check initialData.id */}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AppPopupForm;