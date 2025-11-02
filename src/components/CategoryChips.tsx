import React from 'react';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Shirt, Tally3, Ruler, Hand, Crown, Briefcase } from 'lucide-react';

const categories = [
  { name: 'शर्ट्स', icon: Shirt },
  { name: 'कोट्स', icon: Tally3 },
  { name: 'पैंट्स', icon: Ruler },
  { name: 'कुर्ता', icon: Hand },
  { name: 'वेस्टकोट', icon: Crown },
  { name: 'शेरवानी', icon: Briefcase },
  { name: 'कुर्ता-पायजामा', icon: Shirt },
];

const CategoryChips: React.FC = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false, playOnInit: true })
  );

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
          {categories.map((category, index) => (
            <CarouselItem key={index} className="pl-2 basis-1/3 sm:basis-1/4 md:basis-1/6 lg:basis-1/8">
              <div className="p-1">
                <div className="flex flex-col items-center justify-center space-y-1 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-secondary rounded-full flex items-center justify-center shadow-sm">
                    <category.icon className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                  </div>
                  <span className="text-sm text-center font-medium text-foreground">
                    {category.name}
                  </span>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default CategoryChips;