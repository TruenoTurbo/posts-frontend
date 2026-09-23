// components/Gallery/ImageLightbox.tsx
//
// Shared full-screen image viewer: prev/next, keyboard nav, click-to-zoom
// with drag-to-pan, and an optional CTA to jump to the image's source post.
//
// Used in two contexts:
//  1. Inside a single PostCard, browsing that post's own images.
//  2. From the global PhotoWall, browsing every scraped image in order —
//     here `onViewPost` is passed so the CTA can load the post in-app
//     instead of just linking out.

import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface LightboxImage {
  src: string;
  alt?: string;
  postId?: string;
  postTitle?: string | null;
  username?: string | null;
  threadUrl?: string | null;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  /** Gallery context: fetch + show the originating post in-app. */
  onViewPost?: (postId: string) => void;
  /** Called when the viewer nears the end of `images`, to page in more. */
  onNearEnd?: () => void;
}

const ZOOM_SCALE = 2.4;

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  index,
  onClose,
  onIndexChange,
  onViewPost,
  onNearEnd,
}) => {
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragState = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const current = images[index];
  const hasMultiple = images.length > 1;

  const resetZoom = useCallback(() => {
    setZoomed(false);
    setPan({ x: 0, y: 0 });
  }, []);

  const goToPrevious = useCallback(() => {
    if (!hasMultiple) return;
    resetZoom();
    onIndexChange((index - 1 + images.length) % images.length);
  }, [hasMultiple, images.length, index, onIndexChange, resetZoom]);

  const goToNext = useCallback(() => {
    if (!hasMultiple) return;
    resetZoom();
    onIndexChange((index + 1) % images.length);
    if (onNearEnd && index >= images.length - 3) onNearEnd();
  }, [hasMultiple, images.length, index, onIndexChange, onNearEnd, resetZoom]);

  // Keyboard nav + scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomed) resetZoom();
        else onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [goToNext, goToPrevious, onClose, resetZoom, zoomed]);

  // Reset zoom whenever the underlying image changes out from under us
  useEffect(() => {
    resetZoom();
  }, [index, resetZoom]);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    if (zoomed) {
      resetZoom();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
    setZoomed(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!zoomed) return;
    e.preventDefault();
    dragState.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!zoomed || !dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setPan({ x: dragState.current.panX + dx, y: dragState.current.panY + dy });
  };

  const stopDrag = () => {
    dragState.current = null;
  };

  if (!current) return null;

  const showCta = Boolean(current.postId && onViewPost) || Boolean(current.threadUrl && !onViewPost);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-2.5 transition-all duration-200 z-[101]"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {hasMultiple && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full p-3 transition-all duration-200 z-[101] group"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            aria-label="Previous image"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full p-3 transition-all duration-200 z-[101] group"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            aria-label="Next image"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white/90 text-sm font-medium z-[101]">
            {index + 1} / {images.length}
          </div>
        </>
      )}

      <div
        className="relative max-w-full max-h-[90vh] overflow-hidden flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <img
          ref={imgRef}
          src={current.src}
          alt={current.alt || `Image ${index + 1} of ${images.length}`}
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/10 select-none transition-transform duration-200"
          style={{
            transform: zoomed
              ? `scale(${ZOOM_SCALE}) translate(${pan.x / ZOOM_SCALE}px, ${pan.y / ZOOM_SCALE}px)`
              : 'scale(1)',
            transformOrigin: `${origin.x}% ${origin.y}%`,
            cursor: zoomed ? 'grab' : 'zoom-in',
          }}
          draggable={false}
          onClick={handleImageClick}
          onMouseDown={handleMouseDown}
        />

        {!zoomed && (
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/50 text-xs bg-black/30 px-3 py-1 rounded-full pointer-events-none">
            Click to zoom
          </span>
        )}
      </div>

      {/* CTA — reach the original post */}
      {showCta && (
        <div className="absolute bottom-5 right-5 z-[101]" onClick={(e) => e.stopPropagation()}>
          {current.postId && onViewPost ? (
            <button
              onClick={() => onViewPost(current.postId!)}
              className="flex items-center gap-2 bg-white text-gray-900 hover:bg-white/90 font-medium text-sm px-4 py-2.5 rounded-full shadow-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h11l5 5v9a2 2 0 01-2 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20v-6h6v6" />
              </svg>
              View post
              {current.username ? <span className="text-gray-500 font-normal">· {current.username}</span> : null}
            </button>
          ) : current.threadUrl ? (
            <a
              href={current.threadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-gray-900 hover:bg-white/90 font-medium text-sm px-4 py-2.5 rounded-full shadow-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open original thread
            </a>
          ) : null}
        </div>
      )}
    </div>
  );
};
