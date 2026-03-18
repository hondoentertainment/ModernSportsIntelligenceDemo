import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { getImageSource } from '../lib/utils/imageSourceService.ts';
import ImageSourceModal from './ImageSourceModal.tsx';

interface Props {
  imageUrl: string;
  size?: 'sm' | 'md';
  onClick?: () => void;
}

const ImageSourceBadge: React.FC<Props> = ({ imageUrl, size = 'sm', onClick }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const source = getImageSource(imageUrl);

  if (!source) return null;

  const formattedDate = new Date(source.gameDate + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Abbreviate photographer: "AP Photo/Greg Fiume" → "AP / G. Fiume"
  const parts = source.photographer.split('/');
  let shortName = source.photographer;
  if (parts.length === 2) {
    const org = parts[0].trim();
    const nameParts = parts[1].trim().split(' ');
    if (nameParts.length >= 2) {
      shortName = `${org} / ${nameParts[0][0]}. ${nameParts[nameParts.length - 1]}`;
    } else {
      shortName = `${org} / ${nameParts[0]}`;
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onClick) {
      onClick();
    } else {
      setModalOpen(true);
    }
  };

  const isSm = size === 'sm';

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`
          absolute bottom-1 right-1 z-10 flex items-center gap-1
          bg-black/60 backdrop-blur-sm rounded-md
          text-slate-200 hover:bg-black/80 transition-colors cursor-pointer
          ${isSm ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-1 text-[11px]'}
        `}
        title="View image source & game attribution"
      >
        <Camera size={isSm ? 10 : 13} className="text-amber-400 shrink-0" />
        {isSm ? (
          <span className="truncate max-w-[120px]">
            {source.source} | {formattedDate}
          </span>
        ) : (
          <span className="truncate max-w-[200px]">
            {shortName} | {formattedDate}
          </span>
        )}
      </button>

      <ImageSourceModal
        imageUrl={imageUrl}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default ImageSourceBadge;
