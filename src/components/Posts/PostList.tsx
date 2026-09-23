import React from 'react';
import { Post } from '../../types';
import { PostCard } from './PostCard';
import { PostSkeleton } from './PostSkeleton';

interface PostListProps {
  posts: Post[];
  isLoading: boolean;
  error: Error | null;
  onPostClick?: (post: Post) => void;
  onRetry?: () => void;
}

export const PostList: React.FC<PostListProps> = ({
  posts,
  isLoading,
  error,
  onPostClick,
  onRetry,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-error">
        <p className="mb-2">Error loading posts: {error.message}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="text-accent hover:underline font-medium"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <p className="text-lg mb-2">No posts found</p>
        <p className="text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard key={post.post_id} post={post} onClick={onPostClick} />
      ))}
    </div>
  );
};
