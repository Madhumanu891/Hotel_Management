import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);

    window.addEventListener('scroll', onScroll, {
      passive: true,
    });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }
      className="fixed bottom-20 md:bottom-6 right-4 z-30 h-10 w-10 rounded-full bg-primary-700 text-white shadow-lg flex items-center justify-center hover:bg-primary-800 transition-colors"
      aria-label="Scroll to top"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}