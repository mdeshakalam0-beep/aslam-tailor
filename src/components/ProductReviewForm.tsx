import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Star, Loader2, Image as ImageIcon } from 'lucide-react';
import { submitProductReview, uploadReviewImage } from '@/utils/reviews';
import { showError } from '@/utils/toast';
import { Session } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';

interface ProductReviewFormProps {
  productId: string;
  session: Session | null;
  onReviewSubmitted: () => void;
}

const ProductReviewForm: React.FC<ProductReviewFormProps> = ({ productId, session, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStarClick = (starIndex: number) => {
    setRating(starIndex + 1);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedImage(event.target.files[0]);
    } else {
      setSelectedImage(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session?.user) {
      showError('You must be logged in to submit a review.');
      return;
    }
    if (rating === 0) {
      showError('Please provide a star rating.');
      return;
    }
    if (!reviewText.trim() && !selectedImage) {
      showError('Please write a review or upload an image.');
      return;
    }

    setLoading(true);
    let imageUrl: string | null = null;

    try {
      if (selectedImage) {
        imageUrl = await uploadReviewImage(selectedImage);
        if (!imageUrl) {
          throw new Error('Image upload failed.');
        }
      }

      const newReview = await submitProductReview(
        productId,
        session.user.id,
        rating,
        reviewText,
        imageUrl
      );

      if (newReview) {
        setRating(0);
        setReviewText('');
        setSelectedImage(null);
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      showError('Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-background shadow-sm">
      <h3 className="text-xl font-bold text-foreground">Write Your Review</h3>
      <div>
        <Label htmlFor="rating">Your Rating</Label>
        <div className="flex items-center space-x-1 mt-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-6 w-6 cursor-pointer transition-colors",
                i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
              )}
              onClick={() => handleStarClick(i)}
            />
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="reviewText">Your Review</Label>
        <Textarea
          id="reviewText"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your thoughts about this product..."
          rows={4}
          required={!selectedImage} // Required if no image is selected
        />
      </div>
      <div>
        <Label htmlFor="reviewImage" className="flex items-center space-x-2 cursor-pointer">
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
          <span>Upload Photo (Optional)</span>
        </Label>
        <Input
          id="reviewImage"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={loading}
          className="file:text-primary file:bg-primary-foreground file:border-primary file:hover:bg-primary/90 file:hover:text-primary-foreground mt-2"
        />
        {selectedImage && (
          <p className="text-sm text-muted-foreground mt-1">{selectedImage.name} selected.</p>
        )}
      </div>
      <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Review'
        )}
      </Button>
    </form>
  );
};

export default ProductReviewForm;