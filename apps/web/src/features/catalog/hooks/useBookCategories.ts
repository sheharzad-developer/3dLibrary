import { useQuery } from '@tanstack/react-query';

// Mock categories - in a real app, this would come from an API
const mockCategories = [
  'Fiction',
  'Technology',
  'History',
  'Fantasy',
  'Self-Help',
  'Science Fiction',
  'Biography',
  'Romance',
];

// Simulate API call to fetch book categories
const fetchCategories = async (): Promise<string[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockCategories;
};

export function useBookCategories() {
  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['book-categories'],
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    categories,
    isLoading,
    error,
  };
}