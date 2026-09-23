export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Unknown';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return 'Unknown';
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

export const truncateText = (text: string | null, maxLength: number = 200): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const parseUrls = (urlsString: string | null): string[] => {
  if (!urlsString) return [];
  try {
    const parsed = JSON.parse(urlsString);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [urlsString];
  }
};
