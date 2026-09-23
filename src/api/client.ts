// api/client.ts

import { PostsResponse, SearchFilters, PaginationParams, ImageData, Post } from '../types';
import { GalleryResponse } from '../types/gallery';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8090/api/v1';

export class ApiClient {
  private static async fetchPostsPayload(
    filters: SearchFilters,
    pagination: PaginationParams
  ): Promise<{ payload: any; response: Response }> {
    const params = new URLSearchParams();

    // Backend uses offset, so we calculate it from the page number
    const offset = (pagination.page - 1) * pagination.limit;
    params.append('limit', pagination.limit.toString());
    params.append('offset', offset.toString());

    if (filters.keyword) params.append('q', filters.keyword);
    if (filters.continent) params.append('continent', filters.continent);
    if (filters.country) params.append('country', filters.country);
    if (filters.city) params.append('city', filters.city);
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    if (filters.username) params.append('username', filters.username);
    if (filters.user_type) params.append('user_type', filters.user_type);

    const endpoint = filters.hasImages ? '/posts/with-images' : '/posts';
    const response = await fetch(`${API_BASE}${endpoint}?${params}`);
    const payload = await response.json().catch(() => null);
    return { payload, response };
  }

  static async fetchPostsWithImages(
    filters: SearchFilters = {},
    pagination: PaginationParams = { page: 1, limit: 20, sortOrder: 'desc' }
  ): Promise<PostsResponse> {
    const { payload, response } = await this.fetchPostsPayload(filters, pagination);
    if (!response.ok) throw new Error('Failed to fetch posts');

    const data = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.posts)
        ? payload.posts
        : Array.isArray(payload?.results)
          ? payload.results
          : [];

    const total = payload?.meta?.total || payload?.pagination?.total || 0;
    const totalPages = Math.ceil(total / pagination.limit);

    return {
      posts: data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: total,
        totalPages: totalPages,
        hasNext: pagination.page < totalPages,
        hasPrev: pagination.page > 1,
      },
      filters: payload?.filters || undefined
    };
  }

  // Fetch a single post by its post_id, for deep-linking from the gallery CTA.
  // Reuses the existing /posts endpoint's post_id filter, so what comes back
  // is identical in shape to a post from the normal list — same image_urls,
  // image_count, everything.
  static async fetchPostById(postId: string): Promise<Post | null> {
    const params = new URLSearchParams({ post_id: postId, limit: '1' });
    const response = await fetch(`${API_BASE}/posts?${params}`);
    if (!response.ok) throw new Error('Failed to fetch post');

    const payload = await response.json().catch(() => null);
    const list = Array.isArray(payload?.data) ? payload.data : [];
    return list[0] || null;
  }

  // Fetch image data for a specific post on-demand.
  // The backend may return either a JSON array/object or a raw image payload.
  static async fetchPostImages(postId: string): Promise<ImageData[]> {
    const response = await fetch(`${API_BASE}/posts/images?post_id=${encodeURIComponent(postId)}`);
    if (!response.ok) throw new Error('Failed to fetch post images');

    const contentType = response.headers.get('content-type') || '';

    const normalizeImageData = (rawData: unknown, mimeType: string) => {
      const data = typeof rawData === 'string' ? rawData.trim() : '';
      if (!data) return '';
      if (data.startsWith('data:')) return data;
      const base64 = data.replace(/\s+/g, '');
      return `data:${mimeType};base64,${base64}`;
    };

    if (contentType.includes('application/json') || contentType.includes('+json')) {
      try {
        const payload = await response.json();

        if (Array.isArray(payload)) {
          return payload.map((item: any) => {
            const mime = item?.content_type || item?.mime_type || 'image/jpeg';
            return {
              image_url: item?.image_url || item?.url || item?.src || '',
              filename: item?.filename || null,
              content_type: mime,
              file_size: item?.file_size || null,
              image_data: normalizeImageData(item?.image_data || item?.base64 || '', mime)
            };
          });
        }

        const items = payload?.data || payload?.images || payload?.results || [];
        if (Array.isArray(items)) {
          return items.map((item: any) => {
            const mime = item?.content_type || item?.mime_type || 'image/jpeg';
            return {
              image_url: item?.image_url || item?.url || item?.src || '',
              filename: item?.filename || null,
              content_type: mime,
              file_size: item?.file_size || null,
              image_data: normalizeImageData(item?.image_data || item?.base64 || '', mime)
            };
          });
        }

        if (payload && typeof payload === 'object') {
          const mime = payload.content_type || payload.mime_type || 'image/jpeg';
          return [{
            image_url: payload.image_url || payload.url || payload.src || '',
            filename: payload.filename || null,
            content_type: mime,
            file_size: payload.file_size || null,
            image_data: normalizeImageData(payload.image_data || payload.base64 || '', mime)
          }];
        }
      } catch {
        // Fall back to binary image handling below.
      }
    }

    const arrayBuffer = await response.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) return [];

    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }

    const base64 = btoa(binary);
    return [{
      image_url: '',
      filename: null,
      content_type: contentType || 'image/jpeg',
      file_size: arrayBuffer.byteLength,
      image_data: `data:${contentType || 'image/jpeg'};base64,${base64}`
    }];
  }

  // --- Gallery: every scraped image, newest first, paginated ---

  static async fetchGalleryImages(offset: number, limit: number): Promise<GalleryResponse> {
    const params = new URLSearchParams({ offset: String(offset), limit: String(limit) });
    const response = await fetch(`${API_BASE}/images?${params}`);
    if (!response.ok) throw new Error('Failed to fetch gallery images');

    const payload = await response.json();
    const images = Array.isArray(payload?.data) ? payload.data : [];
    const total = payload?.meta?.total ?? 0;

    return {
      images,
      pagination: { total, limit, offset, hasNext: offset + images.length < total },
    };
  }

  // Raw bytes, served directly — no base64/JSON overhead, and the browser
  // caches it like any other <img src>. Query-param style to match the
  // rest of this backend's routing.
  static getImageSrc(imageId: number): string {
    return `${API_BASE}/images/data?id=${imageId}`;
  }

  static async getFilterOptions(): Promise<{
    continents: string[];
    countries: string[];
    cities: string[];
  }> {
    const response = await fetch(`${API_BASE}/filters`);
    if (!response.ok) throw new Error('Failed to fetch filters');

    const payload = await response.json();
    const source = payload && typeof payload === 'object'
      ? (payload.data && typeof payload.data === 'object' ? payload.data : payload.filters && typeof payload.filters === 'object' ? payload.filters : payload)
      : {};

    return {
      continents: Array.isArray(source.continents) ? source.continents : [],
      countries: Array.isArray(source.countries) ? source.countries : [],
      cities: Array.isArray(source.cities) ? source.cities : []
    };
  }
}
