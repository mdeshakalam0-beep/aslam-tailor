import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'; // Import DialogHeader, DialogTitle, DialogDescription
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { getAppPopups, AppPopup } from '@/utils/appPopups';
import { Link } from 'react-router-dom';
import { Loader2, X } from 'lucide-react';

const AppPopupDisplay: React.FC = () => {
  const [popups, setPopups] = useState<AppPopup[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true }) // Auto-slide every 5 seconds, stop on user interaction
  );

  useEffect(() => {
    const fetchActivePopups = async () => {
      setLoading(true);
      const activePopups = await getAppPopups(false); // Fetch only active pop-ups for public
      setPopups(activePopups);
      if (activePopups.length > 0) {
        setIsOpen(true); // Open the dialog if there are active pop-ups
      }
      setLoading(false);
    };

    fetchActivePopups();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (loading) {
    return null; // Don't render anything while loading
  }

  if (popups.length === 0) {
    return null; // Don't render if no active pop-ups
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="max-w-md p-0 border-none bg-transparent shadow-none"
        aria-labelledby="app-popup-title"
        aria-describedby="app-popup-description"
      >
        <DialogHeader className="sr-only"> {/* Visually hidden header for accessibility */}
          <DialogTitle id="app-popup-title">App Pop-up</DialogTitle>
          <DialogDescription id="app-popup-description">Important announcements or offers.</DialogDescription>
        </DialogHeader>
        <div className="relative w-full">
          {popups.length > 1 ? (
            <Carousel
              plugins={[plugin.current]}
              className="w-full"
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
            >
              <CarouselContent>
                {popups.map((popup, index) => (
                  <CarouselItem key={popup.id || index}>
                    <div className="relative bg-card rounded-lg shadow-lg overflow-hidden">
                      {popup.image_url && (
                        <img src={popup.image_url} alt={popup.title} className="w-full h-48 object-cover" />
                      )}
                      <div className="p-4 text-center">
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          {popup.title}
                        </h3>
                        {popup.description && (
                          <p className="text-muted-foreground text-sm mb-4">
                            {popup.description}
                          </p>
                        )}
                        {popup.cta_text && popup.cta_link && (
                          <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                            <Link to={popup.cta_link} onClick={handleClose}>
                              {popup.cta_text}
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2" />
            </Carousel>
          ) : (
            <div className="relative bg-card rounded-lg shadow-lg overflow-hidden">
              {popups[0].image_url && (
                <img src={popups[0].image_url} alt={popups[0].title} className="w-full h-48 object-cover" />
              )}
              <div className="p-4 text-center">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {popups[0].title}
                </h3>
                {popups[0].description && (
                  <p className="text-muted-foreground text-sm mb-4">
                    {popups[0].description}
                  </p>
                )}
                {popups[0].cta_text && popups[0].cta_link && (
                  <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    <Link to={popups[0].cta_link} onClick={handleClose}>
                      {popups[0].cta_text}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 rounded-full z-10"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AppPopupDisplay;