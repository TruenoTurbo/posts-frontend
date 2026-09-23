// components/Posts/PostCard.tsx
import React, { useEffect, useState } from 'react';
import { ApiClient } from '../../api/client';
import { ImageData, Post } from '../../types';
import { ImageLightbox, LightboxImage } from '../Gallery/ImageLightbox';

interface PostCardProps {
  post: Post;
  onClick?: (post: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);

  const normalizedImageUrls = React.useMemo(() => {
    const rawUrls = post.image_urls as string | string[] | undefined;

    if (Array.isArray(rawUrls)) {
      return rawUrls
        .filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
        .map((url: string) => url.trim());
    }

    if (typeof rawUrls === 'string') {
      return rawUrls
        .split('||')
        .map((url: string) => url.trim())
        .filter((url: string) => url.length > 0);
    }

    return [];
  }, [post.image_urls]);

  const hasImageUrls = normalizedImageUrls.length > 0;

  const hasImageCount = React.useMemo(() => {
    const count = Number(post.image_count);
    return !Number.isNaN(count) && count > 0;
  }, [post.image_count]);

  const shouldAttemptImages = React.useMemo(() => {
    return hasImageCount || hasImageUrls;
  }, [hasImageCount, hasImageUrls]);

  useEffect(() => {
    let isMounted = true;

    const normalizeImages = (rawImages: ImageData[]) => {
      return rawImages
        .filter((image) => Boolean(image?.image_data || image?.image_url))
        .map((image) => ({
          image_url: image?.image_url || '',
          filename: image?.filename ?? null,
          content_type: image?.content_type ?? null,
          file_size: image?.file_size ?? null,
          image_data: image?.image_data || ''
        }));
    };

    const loadImages = async () => {
      if (!post.post_id || !shouldAttemptImages) {
        if (isMounted) setImages([]);
        return;
      }

      try {
        if (hasImageCount) {
          const fetchedImages = await ApiClient.fetchPostImages(post.post_id);
          const normalized = normalizeImages(fetchedImages);
          if (normalized.length > 0) {
            if (isMounted) setImages(normalized);
            return;
          }
        }

        if (hasImageUrls) {
          const fallbackImages = normalizedImageUrls.map((url) => ({
            image_url: url,
            filename: null,
            content_type: null,
            file_size: null,
            image_data: ''
          }));
          if (isMounted) setImages(fallbackImages);
          return;
        }

        if (isMounted) setImages([]);
      } catch (err) {
        console.error('Failed to load images for post', post.post_id, err);
        if (isMounted) setImages([]);
      }
    };

    void loadImages();

    return () => {
      isMounted = false;
    };
  }, [post.post_id, post.image_count, post.image_urls, shouldAttemptImages]);

  const visibleImages = React.useMemo(() => {
    return images.filter((image) => Boolean(image.image_data || image.image_url));
  }, [images]);

  const hasQuote = post.quoted_content && post.quoted_content.trim() !== '';
  const hasImages = shouldAttemptImages && visibleImages.length > 0;

  const lightboxImages: LightboxImage[] = React.useMemo(
    () =>
      visibleImages.map((image, i) => ({
        src: image.image_data || image.image_url,
        alt: image.filename || `Image ${i + 1}`,
        // No onViewPost is passed from PostCard, so the lightbox falls back
        // to a plain "open original thread" link — we're already viewing
        // this post, so there's nothing to navigate to in-app.
        threadUrl: post.thread_url,
      })),
    [visibleImages, post.thread_url]
  );

  const urls = React.useMemo(() => {
    if (!post.urls || typeof post.urls !== 'string') return [];

    return post.urls
      .split('||')
      .map(url => url.trim())
      .filter(url => url.length > 0);
  }, [post.urls]);

  return (
    <>
      <article
        className="bg-bg-card rounded-2xl border border-border shadow-card overflow-hidden
                   transition-all duration-200 hover:shadow-lg cursor-pointer"
        onClick={() => onClick?.(post)}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border bg-bg-secondary/40 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-accent-light flex items-center justify-center
                            text-accent font-bold text-lg border-2 border-bg-card shadow-sm flex-shrink-0">
              {post.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-text-primary truncate">
                {post.username || 'Anonymous'}
              </p>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                {post.user_type && (
                  <span className="badge badge-secondary">{post.user_type}</span>
                )}
                <span>•</span>
                <time dateTime={post.posted_date || undefined} className="truncate">
                  {post.posted_date
                    ? new Date(post.posted_date).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })
                    : 'Unknown date'}
                </time>
              </div>
            </div>
          </div>

          {[post.continent, post.country, post.city].filter(Boolean).length > 0 && (
            <span className="badge badge-primary text-xs whitespace-nowrap flex-shrink-0">
              {[post.continent, post.country, post.city].filter(Boolean).join(' • ')}
            </span>
          )}
        </div>

        <div className="px-4 py-3 space-y-2.5">
          {post.post_title && (
            <h3 className="font-semibold text-text-primary text-[1rem] leading-snug">
              {post.post_title}
            </h3>
          )}

          {hasQuote && (
            <blockquote className="border-l-4 border-accent pl-3 py-2 bg-bg-secondary/50 rounded-r-lg">
              <p className="text-text-secondary italic leading-relaxed break-words whitespace-pre-wrap text-sm">
                "{post.quoted_content}"
              </p>
              {post.quoted_author && (
                <footer className="not-italic text-xs text-text-tertiary mt-1.5 font-medium">
                  — {post.quoted_author}
                </footer>
              )}
            </blockquote>
          )}

          {post.post_content && (
            <div className="text-text-primary leading-relaxed break-words whitespace-pre-wrap text-sm">
              {post.post_content}
            </div>
          )}

          {hasImages && (
            <div className="grid gap-2 sm:grid-cols-2">
              {visibleImages.map((image, index) => {
                const src = image.image_data || image.image_url;
                if (!src) return null;

                return (
                  <img
                    key={`${post.post_id}-${index}`}
                    src={src}
                    alt={image.filename || `Image ${index + 1}`}
                    className="w-full h-auto max-h-72 rounded-xl border border-border object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                  />
                );
              })}
            </div>
          )}

          {urls.length > 0 && (
            <div className="pt-4 border-t border-border/60">
              <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                </svg>
                Attached Links <span className="badge badge-secondary ml-1">{urls.length}</span>
              </p>

              <ul className="space-y-1.5">
                {urls.map((url, i) => {
                  let domain = '';
                  try {
                    const urlObj = new URL(url);
                    domain = urlObj.hostname.replace('www.', '');
                  } catch {
                    domain = 'link';
                  }

                  return (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl
                                 bg-bg-secondary/30 hover:bg-bg-secondary/70
                                 border border-transparent hover:border-border
                                 transition-all duration-200 group"
                    >
                      <span className="mt-1.5 text-accent flex-shrink-0">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>

                      <div className="flex-1 min-w-0">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] text-accent hover:text-accent-hover
                                     break-all leading-relaxed transition-colors font-medium"
                          onClick={(e) => e.stopPropagation()}
                          title={url}
                        >
                          {url}
                        </a>
                        <p className="text-xs text-text-tertiary mt-0.5">
                          {domain}
                        </p>
                      </div>

                      <span className="text-text-tertiary group-hover:text-accent transition-colors flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="px-5 py-3 bg-bg-secondary/50 border-t border-border flex items-center justify-between text-text-tertiary">
          <div className="flex items-center gap-4 text-xs flex-wrap">
            {post.thread_url && (
              <a
                href={post.thread_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-accent transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <span>🔗</span> Original Thread
              </a>
            )}
            {post.post_number && (
              <span className="flex items-center gap-1.5">
                <span>📍</span> Post #{post.post_number}
              </span>
            )}
            {post.post_id && (
              <span className="flex items-center gap-1.5">
                <span>🆔</span> ID {post.post_id}
              </span>
            )}
          </div>

          <time
            dateTime={post.scraped_at}
            className="text-xs"
            title={new Date(post.scraped_at).toLocaleString()}
          >
            Scraped: {new Date(post.scraped_at).toLocaleDateString()}
          </time>
        </div>
      </article>

      {currentImageIndex !== null && lightboxImages.length > 0 && (
        <ImageLightbox
          images={lightboxImages}
          index={currentImageIndex}
          onClose={() => setCurrentImageIndex(null)}
          onIndexChange={setCurrentImageIndex}
        />
      )}
    </>
  );
};
