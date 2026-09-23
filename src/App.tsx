// App.tsx
import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/Layout/Header';
import { SearchBar } from './components/Search/SearchBar';
import { FilterPanel } from './components/Search/FilterPanel';
import { PostList } from './components/Posts/PostList';
import { Pagination } from './components/Posts/Pagination';
import { PhotoWall } from './components/Gallery/PhotoWall';
import { usePosts } from './hooks/usePosts';
import { SearchFilters } from './types';

type View = 'posts' | 'gallery';

function AppContent() {
  const {
    posts, pagination, isLoading, error,
    handlePageChange, handleFilterChange, refetch
  } = usePosts({ initialPagination: { page: 1, limit: 15 } });

  const [searchKeyword, setSearchKeyword] = useState('');
  const [view, setView] = useState<View>('posts');

  const handleSearch = (filters: SearchFilters) => {
    setSearchKeyword(filters.keyword || '');
    handleFilterChange(filters);
  };

  // 🛡️ NEW: Explicit error fallback to prevent white screens
  if (error && view === 'posts') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-700 mb-2">Failed to load posts</h2>
          <p className="text-red-600 mb-4 text-sm">{error.message}</p>
          <p className="text-gray-500 text-xs mb-4">
            Make sure the Go backend is running on http://localhost:8090
         . Check browser console (F12) for details.
          </p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-1 mb-6 bg-bg-secondary/50 border border-border rounded-full p-1 w-fit">
          {(['posts', 'gallery'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                view === v
                  ? 'bg-bg-card text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {v === 'posts' ? 'Posts' : 'Gallery'}
            </button>
          ))}
        </div>

        {view === 'posts' ? (
          <>
            <SearchBar onSearch={handleSearch} />
            <FilterPanel onFilterChange={handleFilterChange} />

            {!isLoading && (
              <div className="mb-4 text-text-secondary text-sm">
                {pagination.total} posts found
                {searchKeyword && ` for "${searchKeyword}"`}
              </div>
            )}

            <PostList
              posts={posts}
              isLoading={isLoading}
              error={error}
              onRetry={refetch}
            />

            {!isLoading && posts.length > 0 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <PhotoWall />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
