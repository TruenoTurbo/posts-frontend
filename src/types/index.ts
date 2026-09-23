// types/index.ts

export interface Post {
  id: number;
  continent: string | null;
  country: string | null;
  city: string | null;
  thread_url: string | null;
  page_current: number | null;
  page_total: number | null;
  post_id: string;
  post_number: number | null;
  posted_date: string | null;
  posted_time: string | null;
  username: string | null;
  user_type: string | null;
  post_title: string | null;
  quoted_author: string | null;
  quoted_content: string | null;
  quoted_post_url: string | null;
  post_content: string | null;
  urls: string | null;
  scraped_at: string;
  
  // NEW: Optional fields returned by the /with-images endpoint
  image_count?: number;
  image_urls?: string[];
}

export interface PostImage {
  id: number;
  post_id: string;
  image_url: string;
  filename: string | null;
  content_type: string | null;
  file_size: number | null;
  downloaded_at: string;
}

// NEW: For on-demand base64 image fetching
export interface ImageData {
  image_url: string;
  filename: string | null;
  content_type: string | null;
  file_size: number | null;
  image_data: string; // Base64 encoded string
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: {
    continents: string[];
    countries: string[];
    cities: string[];
    dateRange: { min: string; max: string };
  };
}

export interface SearchFilters {
  keyword?: string;
  continent?: string;
  country?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
  username?: string;
  user_type?: string;
  hasImages?: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: 'posted_date' | 'scraped_at' | 'post_number';
  sortOrder?: 'asc' | 'desc';
}