// components/Gallery/PhotoWall.tsx
//
// Site-wide photo grid, newest first. Click any thumbnail to open the
// shared ImageLightbox (zoom + prev/next across the whole loaded set),
// and "View post" inside it opens PostDetailModal for that image's post.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ApiClient } from '../../api/client';
import { GalleryImage } from '../../types/gallery';
import { ImageLightbox, LightboxImage } from './ImageLightbox';
import { PostDetailModal } from '../Posts/PostDetailModal';

const PAGE_SIZE = 40;

export const PhotoWall: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [viewingPostId, setViewingPostId] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasNext) return;
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const result = await ApiClient.fetchGalleryImages(offset, PAGE_SIZE);
      setImages((prev) => [...prev, ...result.images]);
      setOffset(offset + result.images.length);
      setHasNext(result.pagination.hasNext);
    } catch (err) {
      setError('Failed to load images. Is the backend running?');
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [hasNext, offset]);

  // Initial load
  useEffect(() => {
    void loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) void loadMore();
      },
      { rootMargin: '400px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  const lightboxImages: LightboxImage[] = images.map((img) => ({
    src: ApiClient.getImageSrc(img.id),
    alt: img.filename || `Photo from ${img.username || 'unknown'}`,
    postId: img.post_id,
    postTitle: img.post_title,
    username: img.username,
    threadUrl: img.thread_url,
  }));

  if (images.length === 0 && !isLoading && !error) {
    return (
      <div className="text-center py-16 text-text-secondary">
        No photos yet.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setLightboxIndex(i)}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-bg-secondary/40"
          >
            <img
              src={ApiClient.getImageSrc(img.id)}
              alt={img.filename || 'Scraped photo'}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.opacity = '0.15';
              }}
            />
            {img.username && (
              <span className="absolute bottom-0 left-0 right-0 px-2 py-1.5 text-[11px] text-white/90 bg-gradient-to-t from-black/70 to-transparent truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {img.username}
              </span>
            )}
          </button>
        ))}
      </div>

      <div ref={sentinelRef} className="h-10 flex items-center justify-center mt-4">
        {isLoading && (
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {error && (
        <div className="text-center py-4">
          <p className="text-sm text-red-600 mb-2">{error}</p>
          <button
            onClick={() => void loadMore()}
            className="text-sm text-accent hover:text-accent-hover font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {lightboxIndex !== null && (
        <ImageLightbox
          images={lightboxImages}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
          onNearEnd={loadMore}
          onViewPost={(postId) => setViewingPostId(postId)}
        />
      )}

      {viewingPostId && (
        <PostDetailModal postId={viewingPostId} onClose={() => setViewingPostId(null)} />
      )}
    </div>
  );
};
