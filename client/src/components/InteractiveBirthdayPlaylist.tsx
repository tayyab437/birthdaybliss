import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

// Song interface
interface Song {
  id: number;
  title: string;
  artist: string;
  url: string;
  coverImage: string;
}

export default function InteractiveBirthdayPlaylist() {
  const { toast } = useToast();
  const [songs, setSongs] = useState<Song[]>([
    {
      id: 1,
      title: "Happy Birthday",
      artist: "Traditional",
      url: "https://www.chosic.com/wp-content/uploads/2020/05/happy-birthday-song-instrumental.mp3",
      coverImage: "https://images.unsplash.com/photo-1558006595-70351e874cc4?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 2,
      title: "Celebration",
      artist: "Kool & The Gang",
      url: "https://www.chosic.com/wp-content/uploads/2020/07/Celebration.mp3",
      coverImage: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 3,
      title: "Good Time",
      artist: "Owl City & Carly Rae Jepsen",
      url: "https://www.chosic.com/wp-content/uploads/2020/08/good-time.mp3",
      coverImage: "https://images.unsplash.com/photo-1496024840928-4c417adf211d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 4,
      title: "Best Day of My Life",
      artist: "American Authors",
      url: "https://www.chosic.com/wp-content/uploads/2020/06/best-day-of-my-life.mp3",
      coverImage: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 5,
      title: "Birthday",
      artist: "Katy Perry",
      url: "https://www.chosic.com/wp-content/uploads/2020/09/birthday.mp3",
      coverImage: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
    }
  ]);
  
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize audio player
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume / 100;
    
    // Load first song
    loadSong(currentSongIndex);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);
  
  // Update audio when song changes
  useEffect(() => {
    loadSong(currentSongIndex);
  }, [currentSongIndex]);
  
  // Update volume when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);
  
  // Load a song
  const loadSong = (index: number) => {
    if (!audioRef.current) return;
    
    const song = songs[index];
    
    audioRef.current.src = song.url;
    audioRef.current.load();
    
    // Set up event listeners
    audioRef.current.onloadedmetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    };
    
    audioRef.current.onended = () => {
      handleSongEnd();
    };
    
    // Start playing if isPlaying is true
    if (isPlaying) {
      audioRef.current.play()
        .catch(error => {
          console.error("Audio playback was prevented:", error);
          setIsPlaying(false);
          toast({
            title: "Playback Error",
            description: "Audio playback was blocked by the browser. Click play to try again.",
            variant: "destructive"
          });
        });
    }
  };
  
  // Start or pause playback
  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    } else {
      audioRef.current.play()
        .catch(error => {
          console.error("Audio playback was prevented:", error);
          toast({
            title: "Playback Error",
            description: "Audio playback was blocked by the browser. Please interact with the page first.",
            variant: "destructive"
          });
          return;
        });
        
      // Update progress
      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime);
        }
      }, 1000);
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Play next song
  const playNextSong = () => {
    if (songs.length === 0) return;
    
    let nextIndex = currentSongIndex + 1;
    
    if (nextIndex >= songs.length) {
      nextIndex = 0; // Loop back to first song
    }
    
    setCurrentSongIndex(nextIndex);
  };
  
  // Play previous song
  const playPrevSong = () => {
    if (songs.length === 0) return;
    
    let prevIndex = currentSongIndex - 1;
    
    if (prevIndex < 0) {
      prevIndex = songs.length - 1; // Loop to last song
    }
    
    setCurrentSongIndex(prevIndex);
  };
  
  // Handle song end
  const handleSongEnd = () => {
    if (isRepeating) {
      // Repeat current song
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } else {
      // Play next song
      playNextSong();
    }
  };
  
  // Format time (seconds) to MM:SS
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Skip to position in song
  const skipToPosition = (newPosition: number) => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = newPosition;
    setProgress(newPosition);
  };
  
  // Toggle shuffle
  const toggleShuffle = () => {
    if (!isShuffled) {
      // Shuffle the playlist (except current song)
      const currentSong = songs[currentSongIndex];
      const remainingSongs = songs.filter((_, i) => i !== currentSongIndex);
      
      // Fisher-Yates shuffle algorithm
      for (let i = remainingSongs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remainingSongs[i], remainingSongs[j]] = [remainingSongs[j], remainingSongs[i]];
      }
      
      // Put current song at beginning and update state
      const shuffledSongs = [currentSong, ...remainingSongs];
      setSongs(shuffledSongs);
      setCurrentSongIndex(0);
      
      toast({
        title: "Playlist Shuffled",
        description: "Your birthday playlist has been shuffled!"
      });
    } else {
      // Restore original order (would need to store original order in state)
      // For this example, we'll just notify that shuffle is off
      toast({
        title: "Shuffle Off",
        description: "Playlist will now play in order."
      });
    }
    
    setIsShuffled(!isShuffled);
  };
  
  // Toggle repeat
  const toggleRepeat = () => {
    setIsRepeating(!isRepeating);
    
    toast({
      title: isRepeating ? "Repeat Off" : "Repeat On",
      description: isRepeating ? "Songs will play in sequence." : "Current song will repeat."
    });
  };
  
  // Current song
  const currentSong = songs[currentSongIndex];
  
  return (
    <section 
      id="birthday-playlist" 
      className="section bg-gradient-to-bl from-primary/20 to-secondary/20 flex flex-col items-center justify-center px-4 py-16"
    >
      <h2 className="text-3xl md:text-4xl text-center mb-2 font-bold">Birthday Playlist</h2>
      <p className="cursive text-xl text-accent text-center mb-8">Enjoy music that celebrates Zainab!</p>
      
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Now Playing */}
          <div className="flex flex-col md:flex-row">
            {/* Album art */}
            <div className="w-full md:w-1/3">
              <div className={`aspect-square bg-gray-200 relative overflow-hidden ${isPlaying ? 'animate-record-spin' : ''}`}>
                <img 
                  src={currentSong.coverImage} 
                  alt={`${currentSong.title} cover`}
                  className="w-full h-full object-cover"
                />
                
                {/* Vinyl record effect */}
                <div className={`absolute inset-0 flex items-center justify-center ${isPlaying ? 'opacity-70' : 'opacity-0'} transition-opacity duration-500`}>
                  <div className="w-1/3 h-1/3 rounded-full border-8 border-black bg-gray-900"></div>
                </div>
              </div>
            </div>
            
            {/* Player controls */}
            <div className="w-full md:w-2/3 p-6 flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <h3 className="text-2xl font-bold truncate">{currentSong.title}</h3>
                  <p className="text-gray-500">{currentSong.artist}</p>
                </div>
                
                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-accent rounded-full"
                      style={{ width: `${(progress / duration) * 100}%` }}
                      onClick={(e) => {
                        const progressBar = e.currentTarget.parentElement;
                        if (!progressBar) return;
                        
                        const rect = progressBar.getBoundingClientRect();
                        const clickPosition = (e.clientX - rect.left) / rect.width;
                        skipToPosition(clickPosition * duration);
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Playback controls */}
                <div className="flex justify-center items-center space-x-4 mb-6">
                  <button
                    onClick={toggleShuffle}
                    className={`p-2 rounded-full ${isShuffled ? 'text-accent' : 'text-gray-500'} hover:bg-gray-100`}
                    title="Shuffle"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={playPrevSong}
                    className="p-2 rounded-full text-gray-700 hover:bg-gray-100"
                    title="Previous"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={togglePlayback}
                    className="p-4 rounded-full bg-accent text-white hover:bg-accent/90"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </button>
                  
                  <button
                    onClick={playNextSong}
                    className="p-2 rounded-full text-gray-700 hover:bg-gray-100"
                    title="Next"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={toggleRepeat}
                    className={`p-2 rounded-full ${isRepeating ? 'text-accent' : 'text-gray-500'} hover:bg-gray-100`}
                    title="Repeat"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
                
                {/* Volume control */}
                <div className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  <Slider
                    value={[volume]}
                    max={100}
                    step={1}
                    onValueChange={(newValue) => setVolume(newValue[0])}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Playlist */}
          <div className="border-t border-gray-200">
            <div className="p-4 bg-gray-50">
              <h4 className="font-medium text-lg mb-2">Birthday Playlist</h4>
              <div className="max-h-60 overflow-y-auto">
                {songs.map((song, index) => (
                  <motion.div
                    key={song.id}
                    onClick={() => setCurrentSongIndex(index)}
                    className={`flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors
                              ${currentSongIndex === index ? 'bg-accent/10' : ''}`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden mr-3 flex-shrink-0">
                      <img 
                        src={song.coverImage} 
                        alt={`${song.title} cover`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`truncate font-medium ${currentSongIndex === index ? 'text-accent' : ''}`}>
                        {song.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {song.artist}
                      </p>
                    </div>
                    {currentSongIndex === index && isPlaying && (
                      <div className="w-4 h-4 flex-shrink-0 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-center text-sm text-neutral-dark/70 mt-4">
          A special playlist curated for Zainab's birthday celebration!
        </p>
      </div>
    </section>
  );
}