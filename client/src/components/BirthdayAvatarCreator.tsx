import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Avatar feature types
interface AvatarFeature {
  id: string;
  options: {
    id: string;
    emoji: string;
    name: string;
  }[];
}

export default function BirthdayAvatarCreator() {
  const { toast } = useToast();
  
  // Avatar configuration options
  const avatarFeatures: AvatarFeature[] = [
    {
      id: 'face',
      options: [
        { id: 'face-1', emoji: '😀', name: 'Happy' },
        { id: 'face-2', emoji: '😊', name: 'Smiling' },
        { id: 'face-3', emoji: '🥳', name: 'Party Face' },
        { id: 'face-4', emoji: '😎', name: 'Cool' },
        { id: 'face-5', emoji: '🤩', name: 'Star Struck' },
      ]
    },
    {
      id: 'hat',
      options: [
        { id: 'hat-0', emoji: '❌', name: 'None' },
        { id: 'hat-1', emoji: '🎩', name: 'Top Hat' },
        { id: 'hat-2', emoji: '👑', name: 'Crown' },
        { id: 'hat-3', emoji: '🧢', name: 'Cap' },
        { id: 'hat-4', emoji: '🎓', name: 'Graduation Cap' },
        { id: 'hat-5', emoji: '🥳', name: 'Party Hat' },
      ]
    },
    {
      id: 'accessory',
      options: [
        { id: 'accessory-0', emoji: '❌', name: 'None' },
        { id: 'accessory-1', emoji: '🎈', name: 'Balloon' },
        { id: 'accessory-2', emoji: '🎁', name: 'Gift' },
        { id: 'accessory-3', emoji: '🎂', name: 'Cake' },
        { id: 'accessory-4', emoji: '🎵', name: 'Music Note' },
        { id: 'accessory-5', emoji: '✨', name: 'Sparkles' },
      ]
    },
    {
      id: 'background',
      options: [
        { id: 'bg-1', emoji: '🔵', name: 'Blue' },
        { id: 'bg-2', emoji: '🟣', name: 'Purple' },
        { id: 'bg-3', emoji: '🟢', name: 'Green' },
        { id: 'bg-4', emoji: '🔴', name: 'Red' },
        { id: 'bg-5', emoji: '🟡', name: 'Yellow' },
      ]
    }
  ];
  
  // State for selected avatar features
  const [selectedFeatures, setSelectedFeatures] = useState({
    face: 'face-3', // party face default
    hat: 'hat-5',   // party hat default
    accessory: 'accessory-1', // balloon default
    background: 'bg-2', // purple default
  });
  
  // Function to update selected features
  const updateFeature = (category: string, optionId: string) => {
    setSelectedFeatures({
      ...selectedFeatures,
      [category]: optionId
    });
    
    playClickSound();
  };
  
  // Sound effect
  const playClickSound = () => {
    const clickSound = new Audio('/click.mp3');
    clickSound.volume = 0.3;
    clickSound.play().catch(() => {});
  };
  
  // Get selected feature details
  const getSelectedFeature = (category: string) => {
    const featureCategory = avatarFeatures.find(f => f.id === category);
    if (!featureCategory) return null;
    
    return featureCategory.options.find(o => o.id === selectedFeatures[category as keyof typeof selectedFeatures]);
  };
  
  // Randomize avatar
  const randomizeAvatar = () => {
    const randomFeatures = {...selectedFeatures};
    
    avatarFeatures.forEach(feature => {
      const options = feature.options;
      if (feature.id === 'face' || options.length <= 1) return; // Always keep a face
      
      // For other features, randomly select an option (include possibility of "None" for some)
      const randomIndex = Math.floor(Math.random() * options.length);
      randomFeatures[feature.id as keyof typeof randomFeatures] = options[randomIndex].id;
    });
    
    setSelectedFeatures(randomFeatures);
    playClickSound();
    
    toast({
      title: "Avatar Randomized!",
      description: "Your birthday avatar has a new look!",
    });
  };
  
  // Function to share avatar
  const shareAvatar = () => {
    // This would typically generate an image, but for this demo we'll just show a message
    toast({
      title: "Avatar Ready to Share!",
      description: "In a real implementation, you could download or share your custom avatar.",
    });
  };
  
  // Background color based on selection
  const getBgColor = () => {
    const bgOption = getSelectedFeature('background');
    if (!bgOption) return 'bg-purple-100';
    
    switch (bgOption.id) {
      case 'bg-1': return 'bg-blue-100';
      case 'bg-2': return 'bg-purple-100';
      case 'bg-3': return 'bg-green-100';
      case 'bg-4': return 'bg-red-100';
      case 'bg-5': return 'bg-yellow-100';
      default: return 'bg-purple-100';
    }
  };
  
  return (
    <section 
      id="avatar-creator" 
      className="section bg-gradient-to-bl from-primary/20 to-secondary/20 flex flex-col items-center justify-center px-4 py-16"
    >
      <h2 className="text-3xl md:text-4xl text-center mb-2 font-bold">Birthday Avatar Creator</h2>
      <p className="cursive text-xl text-accent text-center mb-8">Create a special birthday avatar for Zainab!</p>
      
      <div className="max-w-3xl w-full flex flex-col md:flex-row gap-8">
        {/* Avatar Preview */}
        <div className="w-full md:w-1/3">
          <div className="sticky top-4">
            <div className={`aspect-square rounded-xl overflow-hidden shadow-lg flex items-center justify-center relative ${getBgColor()}`}>
              {/* Avatar Display */}
              <div className="relative flex flex-col items-center justify-center">
                {/* Face */}
                <div className="text-8xl">
                  {getSelectedFeature('face')?.emoji}
                </div>
                
                {/* Hat - positioned on top of face */}
                {getSelectedFeature('hat')?.id !== 'hat-0' && (
                  <div className="absolute text-5xl" style={{ top: '-45px' }}>
                    {getSelectedFeature('hat')?.emoji}
                  </div>
                )}
                
                {/* Accessory - positioned to the side */}
                {getSelectedFeature('accessory')?.id !== 'accessory-0' && (
                  <div className="absolute text-5xl" style={{ right: '-40px', top: '10px' }}>
                    {getSelectedFeature('accessory')?.emoji}
                  </div>
                )}
              </div>
              
              {/* Birthday message */}
              <div className="absolute bottom-4 text-center">
                <p className="font-bold">Happy Birthday Zainab!</p>
              </div>
            </div>
            
            <div className="mt-4 flex justify-center gap-2">
              <Button
                onClick={randomizeAvatar}
                variant="outline"
                className="flex-1"
              >
                Randomize
              </Button>
              <Button
                onClick={shareAvatar}
                className="bg-accent text-white flex-1"
              >
                Share Avatar
              </Button>
            </div>
          </div>
        </div>
        
        {/* Avatar Customization Options */}
        <div className="w-full md:w-2/3 bg-white rounded-xl shadow-lg p-6">
          <Tabs defaultValue="face">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="face">Face</TabsTrigger>
              <TabsTrigger value="hat">Hat</TabsTrigger>
              <TabsTrigger value="accessory">Accessory</TabsTrigger>
              <TabsTrigger value="background">Background</TabsTrigger>
            </TabsList>
            
            {/* Face Options */}
            <TabsContent value="face" className="space-y-4">
              <h3 className="text-lg font-medium mb-4">Choose a Face Style</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {avatarFeatures.find(f => f.id === 'face')?.options.map(option => (
                  <motion.div
                    key={option.id}
                    className={`aspect-square rounded-lg p-2 cursor-pointer flex flex-col items-center justify-center
                              ${selectedFeatures.face === option.id ? 'ring-2 ring-accent bg-accent/10' : 'hover:bg-gray-100'}`}
                    onClick={() => updateFeature('face', option.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-4xl mb-1">{option.emoji}</div>
                    <p className="text-xs text-center truncate w-full">{option.name}</p>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            
            {/* Hat Options */}
            <TabsContent value="hat" className="space-y-4">
              <h3 className="text-lg font-medium mb-4">Choose a Hat</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {avatarFeatures.find(f => f.id === 'hat')?.options.map(option => (
                  <motion.div
                    key={option.id}
                    className={`aspect-square rounded-lg p-2 cursor-pointer flex flex-col items-center justify-center
                              ${selectedFeatures.hat === option.id ? 'ring-2 ring-accent bg-accent/10' : 'hover:bg-gray-100'}`}
                    onClick={() => updateFeature('hat', option.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-4xl mb-1">{option.emoji}</div>
                    <p className="text-xs text-center truncate w-full">{option.name}</p>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            
            {/* Accessory Options */}
            <TabsContent value="accessory" className="space-y-4">
              <h3 className="text-lg font-medium mb-4">Choose an Accessory</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {avatarFeatures.find(f => f.id === 'accessory')?.options.map(option => (
                  <motion.div
                    key={option.id}
                    className={`aspect-square rounded-lg p-2 cursor-pointer flex flex-col items-center justify-center
                              ${selectedFeatures.accessory === option.id ? 'ring-2 ring-accent bg-accent/10' : 'hover:bg-gray-100'}`}
                    onClick={() => updateFeature('accessory', option.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-4xl mb-1">{option.emoji}</div>
                    <p className="text-xs text-center truncate w-full">{option.name}</p>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            
            {/* Background Options */}
            <TabsContent value="background" className="space-y-4">
              <h3 className="text-lg font-medium mb-4">Choose a Background</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {avatarFeatures.find(f => f.id === 'background')?.options.map(option => (
                  <motion.div
                    key={option.id}
                    className={`aspect-square rounded-lg p-2 cursor-pointer flex flex-col items-center justify-center
                              ${selectedFeatures.background === option.id ? 'ring-2 ring-accent bg-accent/10' : 'hover:bg-gray-100'}`}
                    onClick={() => updateFeature('background', option.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-4xl mb-1">{option.emoji}</div>
                    <p className="text-xs text-center truncate w-full">{option.name}</p>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Create a fun birthday avatar for Zainab by mixing and matching different features.
              Once you're happy with your creation, click "Share Avatar" to send it as a virtual birthday card!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}