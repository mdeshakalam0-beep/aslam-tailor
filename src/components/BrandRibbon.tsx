import React, { useEffect, useState, useRef } from 'react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { getBrands, Brand } from '@/utils/brands';
import { cn } from '@/lib/utils';

const BrandRibbon: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const plugin = useRef(
    Autoplay({ delay: 0, stopOnInteraction: false, playOnInit: true, speed: 5 }) // Speed reduced from 15 to 5
  );

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      const fetchedBrands = await getBrands();
      setBrands(fetchedBrands);
      setLoading(false);
    };
    fetchBrands();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-2 bg-primary text-primary-foreground text-center text-sm overflow-hidden">
        <p>Loading brands...</p>
      </div>
    );
  }

  if (brands.length === 0) {
    return null; // Don't render if no brands are available
  }

  // Duplicate brands to ensure continuous loop without visible breaks
  const duplicatedBrands = [...brands, ...brands, ...brands];

  return (
    <div className="w-full bg-primary text-primary-foreground py-2 overflow-hidden">
      <Carousel
        plugins={[plugin.current]}
        opts={{
          align: "start",
          loop: true,
          dragFree: true, // Allow free dragging
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {duplicatedBrands.map((brand, index) => (
            <CarouselItem key={`${brand.id}-${index}`} className="pl-4 basis-auto">
              <div className="flex items-center justify-center p-1">
                <span className="text-sm font-medium whitespace-nowrap px-4 py-1 rounded-full bg-primary-foreground text-primary">
                  {brand.name}
                </span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default BrandRibbon;