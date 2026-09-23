// components/Posts/PostDetailModal.tsx
//
// Shown when someone hits "View post" from the gallery lightbox. Fetches the
// single post by post_id (existing API, extended with one new method) and
// renders it with the normal PostCard — reusing all of PostCard's own image
// carousel/zoom for anything else, so the two never fall out of sync.

import React, { useEffect, useState } from 'react';
import { ApiClient } from '../../api/client';
import { Post } from '../../types';
import { PostCard } from './PostCard';

interface PostDetailModalProps {
  postId: string;
  onClose: () => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ postId, onClose }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let isMounted = true;
    setStatus('loading');

    ApiClient.fetchPostById(postId)
      .then((result) => {
        if (!isMounted) return;
        if (!result) {
          setStatus('error');
          return;
        }
        setPost(result);
        setStatus('ready');
      })
      .catch(() => {
        if (isMounted) setStatus('error');
      });

    return () => {
      isMounted = false;
    };
  }, [postId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-8 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mt-4 sm:mt-10 mb-10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute -top-3 -right-3 text-white bg-gray-900 hover:bg-gray-700 rounded-full p-2 shadow-lg z-10"
          onClick={onClose}
          aria-label="Close post"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {status === 'loading' && (
          <div className="bg-bg-card rounded-2xl border border-border shadow-card p-10 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {status === 'error' && (
          <div className="bg-bg-card rounded-2xl border border-border shadow-card p-8 text-center">
            <p className="text-text-primary font-medium mb-1">Couldn't load this post</p>
            <p className="text-text-secondary text-sm">It may have been removed, or the backend is unreachable.</p>
          </div>
        )}

        {status === 'ready' && post && <PostCard post={post} />}
      </div>
    </div>
  );
};
