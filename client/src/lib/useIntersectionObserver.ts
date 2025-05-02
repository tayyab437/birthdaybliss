import { useState, useCallback, useRef } from 'react';

interface IntersectionObserverOptions {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
}

export default function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0px',
}: IntersectionObserverOptions = {}) {
  const [observedElements, setObservedElements] = useState<number[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementsRef = useRef<Map<Element, number>>(new Map());

  const observeElement = useCallback((element: Element, index: number) => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const elementIndex = elementsRef.current.get(entry.target);
              if (elementIndex !== undefined) {
                setObservedElements((prev) => 
                  prev.includes(elementIndex) ? prev : [...prev, elementIndex]
                );
                // Once observed, no need to keep tracking
                observerRef.current?.unobserve(entry.target);
              }
            }
          });
        },
        { threshold, root, rootMargin }
      );
    }

    elementsRef.current.set(element, index);
    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.unobserve(element);
        elementsRef.current.delete(element);
      }
    };
  }, [threshold, root, rootMargin]);

  return { observedElements, observeElement };
}
