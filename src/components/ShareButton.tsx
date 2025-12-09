import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { showSuccess } from '@/utils/toast'; // Removed showError as it's not needed for direct WhatsApp share

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  imageUrl?: string; // Optional image URL for rich previews (though WhatsApp might not use it directly)
}

const ShareButton: React.FC<ShareButtonProps> = ({ title, text, url, imageUrl }) => {
  const handleShare = () => { // Changed to sync function as no navigator.share await
    // Only share via WhatsApp
    const whatsappText = encodeURIComponent(`${title}\n${text}\n${url}`);
    const whatsappUrl = `https://wa.me/?text=${whatsappText}`;
    window.open(whatsappUrl, '_blank');
    showSuccess('Opening WhatsApp to share!');
  };

  return (
    <Button variant="outline" onClick={handleShare} className="w-full">
      <Share2 className="h-4 w-4 mr-2" /> Share Product
    </Button>
  );
};

export default ShareButton;