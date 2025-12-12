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
    <div className="border-b border-card-border pb-4 mb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center mb-2">
        {reviewerAvatar ? (
          <img src={reviewerAvatar} alt={reviewerName} className="w-10 h-10 rounded-full object-cover mr-3" />
        ) : (
          <UserCircle2 className="w-10 h-10 text-muted-foreground mr-3" />
        )}
        <div>
          <p className="font-semibold text-text-primary-heading">{reviewerName}</p>
          <div className="flex items-center text-sm text-text-secondary-body">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < review.rating ? 'text-accent-rose fill-accent-rose' : 'text-muted-foreground'}`}
              />
            ))}
            <span className="ml-2">{formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
      {review.review_text && (
        <p className="text-text-secondary-body mb-2">{review.review_text}</p>
      )}
      {review.image_url && (
        <img src={review.image_url} alt="Review attachment" className="w-32 h-32 object-cover rounded-small mt-2 border border-card-border" />
      )}
    </div>
  );
};

export default ProductReviewCard;