// types/gallery.ts
//
// New types for the site-wide photo gallery. Kept separate from the main
// types.ts so this doesn't clash with whatever's already in there — import
// alongside your existing `Post` / `ImageData` types.

export interface GalleryImage {
  id: number;
  post_id: string;
  filename: string | null;
  content_type: string | null;
  file_size: number | null;
  downloaded_at: string;
  post_title: string | null;
  username: string | null;
  thread_url: string | null;
}

export interface GalleryPagination {
  total: number;
  limit: number;
  offset: number;
  hasNext: boolean;
}

export interface GalleryResponse {
  images: GalleryImage[];
  pagination: GalleryPagination;
}
