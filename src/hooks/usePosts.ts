// hooks/usePosts.ts
import { useState, useEffect, useCallback } from 'react';
import { Post, SearchFilters, PaginationParams, ImageData } from '../types';
import { ApiClient } from '../api/client';

interface UsePostsOptions {
  initialFilters?: SearchFilters;
  initialPagination?: PaginationParams;
}

export const usePosts = (options: UsePostsOptions = {}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(options.initialPagination?.page || 1);
  const [limit] = useState(options.initialPagination?.limit || 15); // Limit is static
  const [total, setTotal] = useState(0);
  
  const [filters, setFilters] = useState<SearchFilters>(options.initialFilters || {});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Stable fetch function that does NOT mutate filters or page
  const fetchPosts = useCallback(async (currentPage: number, currentFilters: SearchFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ApiClient.fetchPostsWithImages(currentFilters, {
        page: currentPage,
        limit,
        sortOrder: 'desc'
      });

      const shouldFilterImages = Boolean(currentFilters.hasImages);
      const filteredPosts = shouldFilterImages
        ? response.posts.filter((post) => {
            const count = Number(post.image_count ?? 0);
            const imageUrls = Array.isArray(post.image_urls)
              ? post.image_urls.filter((url): url is string => typeof url === 'string' && url.trim().length > 0)
              : [];
            return count > 0 || imageUrls.length > 0;
          })
        : response.posts;

      const backendTotal = response.pagination.total || filteredPosts.length;
      
      setPosts(filteredPosts);
      setTotal(backendTotal);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch posts';
      setError(new Error(errorMsg));
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  // Debounced fetch: runs when `page` or `filters` changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts(page, filters);
    }, 300);
    return () => clearTimeout(timer);
  }, [page, filters, fetchPosts]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    setPage(1); // Automatically reset to page 1 when filters change
  };

  const fetchImagesForPost = useCallback(async (postId: string): Promise<ImageData[]> => {
    return await ApiClient.fetchPostImages(postId);
  }, []);

  const totalPages = Math.ceil(total / limit);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    filters,
    isLoading,
    error,
    handlePageChange,
    handleFilterChange,
    fetchImagesForPost,
    refetch: () => fetchPosts(page, filters),
  };
};