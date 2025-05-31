import { useState } from 'react';
import { MicFill, MicMuteFill } from 'react-bootstrap-icons';

export default function Mic() {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <label
      className={`relative w-12 h-12 flex justify-center items-center rounded-full cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
        isMuted ? 'bg-red-600' : 'bg-neutral-800'
      } hover:bg-opacity-80 active:scale-110`}
    >
      <input
        type="checkbox"
        checked={isMuted}
        onChange={() => setIsMuted(!isMuted)}
        className="hidden"
      />
      <div
        className={`absolute inset-0 flex justify-center items-center transition-opacity duration-300 ${
          isMuted ? 'opacity-0 z-0' : 'opacity-100 z-10'
        }`}
      >
        <MicFill size={18} className="text-white" />
      </div>
      <div
        className={`absolute inset-0 flex justify-center items-center transition-opacity duration-300 ${
          isMuted ? 'opacity-100 z-10' : 'opacity-0 z-0'
        }`}
      >
        <MicMuteFill size={16} className="text-white" />
      </div>
    </label>
  );
}
