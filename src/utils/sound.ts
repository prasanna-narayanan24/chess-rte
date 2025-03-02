// Cache for audio instances to avoid creating multiple instances of the same sound
const audioCache = new Map<string, HTMLAudioElement>();

interface PlaySoundOptions {
  volume?: number;  // Volume level (0.0 to 1.0)
  loop?: boolean;   // Whether to loop the sound
  reset?: boolean;  // Whether to reset the sound to start before playing
}

/**
 * Plays a sound file from the given path
 * @param soundPath - Path to the sound file (relative to public directory)
 * @param options - Optional configuration for sound playback
 * @returns Promise that resolves when the sound starts playing
 */
export const playSound = async (
  soundPath: string, 
  options: PlaySoundOptions = {}
): Promise<void> => {
  const {
    volume = 1.0,
    loop = false,
    reset = true
  } = options;

  try {
    // Get or create audio instance
    let audio = audioCache.get(soundPath);
    
    if (!audio) {
      audio = new Audio(soundPath);
      audioCache.set(soundPath, audio);
    }

    // Apply options
    audio.volume = Math.min(Math.max(volume, 0), 1); // Clamp volume between 0 and 1
    audio.loop = loop;

    if (reset) {
      audio.currentTime = 0;
    }

    // Play the sound
    await audio.play();
  } catch (error) {
    console.error(`Failed to play sound: ${soundPath}`, error);
  }
};

/**
 * Stops playing a specific sound
 * @param soundPath - Path to the sound file
 */
export const stopSound = (soundPath: string): void => {
  const audio = audioCache.get(soundPath);
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
};

/**
 * Stops all currently playing sounds
 */
export const stopAllSounds = (): void => {
  audioCache.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
};

/**
 * Preloads a sound file into the cache
 * @param soundPath - Path to the sound file
 */
export const preloadSound = (soundPath: string): void => {
  if (!audioCache.has(soundPath)) {
    const audio = new Audio(soundPath);
    audioCache.set(soundPath, audio);
  }
};
