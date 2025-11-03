import React, { useEffect, useState, useRef } from 'react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { getCategories, Category } from '@/utils/categories'; // Import getCategories and Category interface
import { Link } from 'react-router-dom';

const CategoryChips: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false, playOnInit: true })
  );

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center">
        <p className="text-muted-foreground">Loading categories...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="p-4 flex justify-center items-center">
        <p className="text-muted-foreground">No categories available.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Carousel
        plugins={[plugin.current]}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2">
          {categories.map((category) => (
            <CarouselItem key={category.id} className="pl-2 basis-1/3 sm:basis-1/4 md:basis-1/6 lg:basis-1/8">
              <Link to={`/categories/${category.id}`} className="block p-1">
                <div className="flex flex-col items-center justify-center space-y-1 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-secondary rounded-full flex items-center justify-center shadow-sm overflow-hidden">
                    <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm text-center font-medium text-foreground">
                    {category.name}
                  </span>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default CategoryChips;