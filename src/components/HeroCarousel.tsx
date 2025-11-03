import React, { useEffect, useState, useRef } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@/components/ui/button';
import { getHeroBanners, HeroBanner } from '@/utils/banners'; // Import getHeroBanners and HeroBanner interface
import { Link } from 'react-router-dom'; // Import Link for CTA

const HeroCarousel: React.FC = () => {
  const [slides, setSlides] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);

  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );

  useEffect(() => {
    const fetchBanners = async () => {
      setLoading(true);
      const fetchedBanners = await getHeroBanners();
      setSlides(fetchedBanners);
      setLoading(false);
    };
    fetchBanners();
  }, []);

  if (loading) {
    return (
      <div className="relative w-full h-[200px] md:h-[400px] flex items-center justify-center bg-muted rounded-lg shadow-md">
        <p className="text-muted-foreground">Loading banners...</p>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="relative w-full h-[200px] md:h-[400px] flex items-center justify-center bg-muted rounded-lg shadow-md">
        <p className="text-muted-foreground">No banners available.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-md">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="relative w-full h-[200px] md:h-[400px] bg-cover bg-center" style={{ backgroundImage: `url(${slide.image_url})` }}>
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-center p-4">
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
                    {slide.headline}
                  </h2>
                  <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link to={slide.cta_link}>
                      {slide.cta_text}
                    </Link>
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2" />
      </Carousel>
    </div>
  );
};

export default HeroCarousel;