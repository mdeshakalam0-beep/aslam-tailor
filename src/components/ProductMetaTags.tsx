import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Product } from '@/utils/products';

interface ProductMetaTagsProps {
  product: Product;
}

const ProductMetaTags: React.FC<ProductMetaTagsProps> = ({ product }) => {
  const productUrl = `${window.location.origin}/products/${product.id}`;
  const imageUrl = product.images[0] || 'https://picsum.photos/seed/placeholder/300/300'; // Fallback image

  return (
    <Helmet>
      <title>{product.name} - Aslam Tailor & Clothes</title>
      <meta name="description" content={product.description.substring(0, 150) + '...'} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="product" />
      <meta property="og:url" content={productUrl} />
      <meta property="og:title" content={`${product.name} - Aslam Tailor & Clothes`} />
      <meta property="og:description" content={product.description.substring(0, 150) + '...'} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:price:amount" content={product.price.toString()} />
      <meta property="og:price:currency" content="INR" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={productUrl} />
      <meta property="twitter:title" content={`${product.name} - Aslam Tailor & Clothes`} />
      <meta property="twitter:description" content={product.description.substring(0, 150) + '...'} />
      <meta property="twitter:image" content={imageUrl} />
    </Helmet>
  );
};

export default ProductMetaTags;