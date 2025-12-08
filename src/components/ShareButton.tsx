import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  imageUrl?: string; // Optional image URL for rich previews
}

const ShareButton: React.FC<ShareButtonProps> = ({ title, text, url, imageUrl }) => {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url,
        });
        showSuccess('Product shared successfully!');
      } catch (error) {
        console.error('Error sharing:', error);
        // User might have cancelled the share, or an error occurred
        if (error instanceof Error && error.name !== 'AbortError') {
          showError('Failed to share product.');
        }
      }
    } else {
      // Fallback for browsers that do not support Web Share API
      // We'll provide a WhatsApp share link as requested
      const whatsappText = encodeURIComponent(`${title}\n${text}\n${url}`);
      const whatsappUrl = `https://wa.me/?text=${whatsappText}`;
      window.open(whatsappUrl, '_blank');
      showSuccess('Opening WhatsApp to share!');
    }
  };

  return (
    <Button variant="outline" onClick={handleShare} className="w-full">
      <Share2 className="h-4 w-4 mr-2" /> Share Product
    </Button>
  );
};

export default ShareButton;