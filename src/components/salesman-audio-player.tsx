import { useEffect, useRef } from 'react';

interface AutoPlayAudioProps {
  src: string;
}

const AutoPlayAudio: React.FC<AutoPlayAudioProps> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const playAudio = async () => {
      try {
        if (audioRef.current) {
          await audioRef.current.play();
          console.log('Audio started playing automatically.');
        }
      } catch (error) {
        console.warn('Autoplay failed:', error);
      }
    };

    playAudio();
  }, []);

  return <audio ref={audioRef} src={src} autoPlay />;
};

export default AutoPlayAudio;
