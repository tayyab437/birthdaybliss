import { useState, useEffect } from 'react';

interface NavigationButtonsProps {
  currentSection: string;
  navigateToSection: (sectionId: string) => void;
  sections: string[];
}

export default function NavigationButtons({ 
  currentSection, 
  navigateToSection,
  sections
}: NavigationButtonsProps) {
  const [showButtons, setShowButtons] = useState(false);
  
  // Get previous and next section IDs
  const currentIndex = sections.indexOf(currentSection);
  const prevSection = currentIndex > 0 ? sections[currentIndex - 1] : null;
  const nextSection = currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null;
  
  // Format section name for display
  const formatSectionName = (sectionId: string) => {
    return sectionId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Toggle buttons visibility
  const toggleButtons = () => {
    setShowButtons(!showButtons);
  };
  
  // Hide navigation on welcome page
  useEffect(() => {
    if (currentSection === 'welcome') {
      setShowButtons(false);
    }
  }, [currentSection]);
  
  if (currentSection === 'welcome') return null;
  
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Toggle button */}
      <button
        onClick={toggleButtons}
        className="bg-accent text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center mb-2 hover:bg-accent/90"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={`transition-transform duration-300 ${showButtons ? 'rotate-45' : ''}`}
        >
          {showButtons ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M5 12h14M12 5v14" />
          )}
        </svg>
      </button>
      
      {/* Navigation buttons */}
      {showButtons && (
        <div className="flex flex-col gap-2 items-end mb-2">
          {/* Navigation menu */}
          <div className="bg-white p-4 rounded-lg shadow-lg grid gap-2 w-48">
            <p className="text-sm font-medium text-gray-500 mb-2">Quick Navigation</p>
            {sections.filter(section => section !== 'welcome').map(section => (
              <button
                key={section}
                onClick={() => {
                  navigateToSection(section);
                  setShowButtons(false);
                }}
                className={`text-left text-sm px-3 py-2 rounded-lg transition-colors
                ${currentSection === section 
                  ? 'bg-accent/20 text-accent' 
                  : 'hover:bg-gray-100'}`}
              >
                {formatSectionName(section)}
              </button>
            ))}
          </div>
          
          {/* Prev/Next buttons */}
          <div className="flex gap-2">
            {prevSection && (
              <button
                onClick={() => navigateToSection(prevSection)}
                className="bg-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center hover:bg-gray-100"
                title={`Previous: ${formatSectionName(prevSection)}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}
            
            {nextSection && (
              <button
                onClick={() => navigateToSection(nextSection)}
                className="bg-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center hover:bg-gray-100"
                title={`Next: ${formatSectionName(nextSection)}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}