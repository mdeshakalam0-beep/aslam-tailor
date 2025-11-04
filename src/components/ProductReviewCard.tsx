import React from 'react';
import { Star, UserCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ProductReview } from '@/utils/reviews';

interface ProductReviewCardProps {
  review: ProductReview;
}

const ProductReviewCard: React.FC<ProductReviewCardProps> = ({ review }) => {
  const reviewerName = review.profiles?.first_name || review.profiles?.last_name
    ? `${review.profiles.first_name || ''} ${review.profiles.last_name || ''}`.trim()
    : 'Anonymous User';
  const reviewerAvatar = review.profiles?.avatar_url;

  return (
    <div className="border-b border-border pb-4 mb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center mb-2">
        {reviewerAvatar ? (
          <img src={reviewerAvatar} alt={reviewerName} className="w-10 h-10 rounded-full object-cover mr-3" />
        ) : (
          <UserCircle2 className="w-10 h-10 text-muted-foreground mr-3" />
        )}
        <div>
          <p className="font-semibold text-foreground">{reviewerName}</p>
          <div className="flex items-center text-sm text-muted-foreground">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
              />
            ))}
            <span className="ml-2">{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
      {review.review_text && (
        <p className="text-muted-foreground mb-2">{review.review_text}</p>
      )}
      {review.image_url && (
        <img src={review.image_url} alt="Review attachment" className="w-32 h-32 object-cover rounded-md mt-2" />
      )}
    </div>
  );
};

export default ProductReviewCard;