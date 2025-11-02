import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@/components/ui/button';

const slides = [
  {
    image: 'https://via.placeholder.com/1200x400/4A90E2/FFFFFF?text=New+Collection',
    headline: 'नवीनतम संग्रह देखें',
    cta: 'अभी खरीदारी करें',
  },
  {
    image: 'https://via.placeholder.com/1200x400/50E3C2/FFFFFF?text=Custom+Tailoring',
    headline: 'अपने माप के अनुसार सिलवाएं',
    cta: 'माप गाइड',
  },
  {
    image: 'https://via.placeholder.com/1200x400/F5A623/FFFFFF?text=Exclusive+Designs',
    headline: 'विशेष डिज़ाइन, केवल आपके लिए',
    cta: 'डिज़ाइन देखें',
  },
];

const HeroCarousel: React.FC = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );

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
              <div className="relative w-full h-[200px] md:h-[400px] bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }}>
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-center p-4">
                  <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">
                    {slide.headline}
                  </h2>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                    {slide.cta}
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