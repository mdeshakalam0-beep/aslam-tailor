export const getSampleProducts = () => [
  {
    id: '1',
    name: 'Stylish Cotton Shirt',
    imageUrl: 'https://picsum.photos/seed/shirt1/300/300',
    price: 899,
    originalPrice: 1299,
    discount: 30,
    rating: 4.5,
    reviewsCount: 120,
    recentPurchase: 'Rahul purchased 5 days ago',
    images: [
      'https://picsum.photos/seed/shirt1_detail1/800/600',
      'https://picsum.photos/seed/shirt1_detail2/800/600',
      'https://picsum.photos/seed/shirt1_detail3/800/600',
      'https://picsum.photos/seed/shirt1_detail4/800/600',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'A comfortable and stylish cotton shirt perfect for casual and semi-formal occasions. Made from high-quality, breathable fabric. Available in various sizes and colors.',
    boughtByUsers: 500,
  },
  {
    id: '2',
    name: 'Premium Linen Pants',
    imageUrl: 'https://picsum.photos/seed/pant1/300/300',
    price: 1499,
    originalPrice: 1999,
    discount: 25,
    rating: 4.2,
    reviewsCount: 85,
    recentPurchase: 'Anjali purchased 2 hours ago',
    images: [
      'https://picsum.photos/seed/pant1_detail1/800/600',
      'https://picsum.photos/seed/pant1_detail2/800/600',
    ],
    sizes: ['28', '30', '32', '34', '36'],
    description: 'High-quality linen pants for a sophisticated look.',
    boughtByUsers: 300,
  },
  {
    id: '3',
    name: 'Elegant Waistcoat',
    imageUrl: 'https://picsum.photos/seed/waistcoat1/300/300',
    price: 1199,
    originalPrice: 1599,
    discount: 25,
    rating: 4.7,
    reviewsCount: 60,
    recentPurchase: 'Amit purchased yesterday',
    images: [
      'https://picsum.photos/seed/waistcoat1_detail1/800/600',
      'https://picsum.photos/seed/waistcoat1_detail2/800/600',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'An elegant waistcoat to complete your traditional attire.',
    boughtByUsers: 250,
  },
  {
    id: '4',
    name: 'Traditional Kurta',
    imageUrl: 'https://picsum.photos/seed/kurta1/300/300',
    price: 999,
    originalPrice: 1499,
    discount: 33,
    rating: 4.3,
    reviewsCount: 95,
    recentPurchase: 'Pooja purchased 3 days ago',
    images: [
      'https://picsum.photos/seed/kurta1_detail1/800/600',
      'https://picsum.photos/seed/kurta1_detail2/800/600',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    description: 'Classic traditional kurta for festive occasions.',
    boughtByUsers: 400,
  },
  {
    id: '5',
    name: 'Formal Blazer',
    imageUrl: 'https://picsum.photos/seed/blazer1/300/300',
    price: 2499,
    originalPrice: 3499,
    discount: 28,
    rating: 4.8,
    reviewsCount: 45,
    recentPurchase: 'Vikas purchased 1 week ago',
    images: [
      'https://picsum.photos/seed/blazer1_detail1/800/600',
      'https://picsum.photos/seed/blazer1_detail2/800/600',
    ],
    sizes: ['38', '40', '42', '44'],
    description: 'Sharp and sophisticated formal blazer.',
    boughtByUsers: 180,
  },
  {
    id: '6',
    name: 'Casual Denim Shirt',
    imageUrl: 'https://picsum.photos/seed/denimshirt1/300/300',
    price: 799,
    originalPrice: 1099,
    discount: 27,
    rating: 4.1,
    reviewsCount: 110,
    recentPurchase: 'Neha purchased just now',
    images: [
      'https://picsum.photos/seed/denimshirt1_detail1/800/600',
      'https://picsum.photos/seed/denimshirt1_detail2/800/600',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Comfortable and trendy casual denim shirt.',
    boughtByUsers: 600,
  },
];

export const getProductById = (id: string) => {
  const products = getSampleProducts();
  return products.find(product => product.id === id);
};

export const getRecommendedProducts = (currentProductId: string) => {
  const products = getSampleProducts();
  return products.filter(product => product.id !== currentProductId).slice(0, 3);
};