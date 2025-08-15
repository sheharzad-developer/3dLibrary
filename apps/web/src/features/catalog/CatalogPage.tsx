import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BookOpen, 
  Search, 
  Grid, 
  List, 
  Sparkles, 
  Star, 
  Eye, 
  Play,
  Zap,
  TrendingUp,
  Users,
  Globe
} from 'lucide-react';
import { CatalogProvider } from './CatalogContext';
import { SearchBar } from './components/SearchBar';
import { FilterPanel } from './components/FilterPanel';
import { Pagination } from './components/Pagination';
import { SortSelector } from './components/SortSelector';
import { useCatalogData } from './hooks/useCatalogData';
import { useModelPreloader } from './hooks/useModelPreloader';
import Book3DCard from '../../components/Book3DCard';
import type { Book } from './types';

const CatalogContent: React.FC = () => {
  const { books, isLoading, error } = useCatalogData();
  const { schedulePreload, cancelPreload } = useModelPreloader();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Stats for the impressive header
  const stats = [
    { label: "Total Books", value: "1,247", icon: <BookOpen className="w-5 h-5" /> },
    { label: "3D Models", value: "892", icon: <Sparkles className="w-5 h-5" /> },
    { label: "Active Readers", value: "15.2K", icon: <Users className="w-5 h-5" /> },
    { label: "Countries", value: "67", icon: <Globe className="w-5 h-5" /> }
  ];

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Books', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'fiction', name: 'Fiction', icon: <Star className="w-4 h-4" /> },
    { id: 'non-fiction', name: 'Non-Fiction', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'science', name: 'Science', icon: <Zap className="w-4 h-4" /> },
    { id: 'history', name: 'History', icon: <Eye className="w-4 h-4" /> }
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              Failed to load catalog data. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Impressive Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 mb-6 border border-white/20">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">Next Generation Digital Library</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Explore Our
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {" "}3D Library
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12">
            Immerse yourself in a revolutionary reading experience with stunning 3D models, 
            interactive elements, and cutting-edge technology
          </p>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="text-purple-400 mb-2 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12 space-y-8"
        >
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white/10 backdrop-blur-md text-gray-300 hover:bg-white/20 border border-white/20'
                }`}
              >
                {category.icon}
                <span className="font-medium">{category.name}</span>
              </motion.button>
            ))}
          </div>

          {/* Search and Controls */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1">
                <SearchBar />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex bg-white/10 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === 'list' ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
                <SortSelector />
              </div>
            </div>
            <div className="mt-4">
              <FilterPanel />
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden bg-white/10 backdrop-blur-sm border-white/20">
                  <Skeleton className="h-48 w-full bg-white/20" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2 bg-white/20" />
                    <Skeleton className="h-4 w-1/2 mb-2 bg-white/20" />
                    <Skeleton className="h-4 w-full mb-4 bg-white/20" />
                    <Skeleton className="h-6 w-20 mb-4 bg-white/20" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 flex-1 bg-white/20" />
                      <Skeleton className="h-8 flex-1 bg-white/20" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Enhanced Books Grid */}
        {!isLoading && (
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-8">
                  {books.map((book: Book, index: number) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -10, scale: 1.05 }}
                      className="relative group"
                    >
                      <Book3DCard
                        coverImage={book.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop'}
                        title={book.title}
                        author={book.author}
                        onClick={() => navigate(`/books/${book.id}`)}
                        className="transition-all duration-300"
                      />
                      
                      {/* Enhanced Book Info Overlay */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-6 min-w-[250px] z-10 border border-white/20"
                      >
                        <div className="text-center">
                          <h3 className="font-bold text-sm mb-2 line-clamp-2 text-white">{book.title}</h3>
                          <p className="text-xs text-gray-300 mb-3">{book.author}</p>
                          
                          <div className="flex items-center justify-center mb-4">
                            <Badge 
                              variant={book.isAvailable ? "default" : "secondary"}
                              className={`text-xs ${book.isAvailable ? "bg-green-500 hover:bg-green-600" : "bg-gray-500"}`}
                            >
                              {book.isAvailable ? 'Available' : 'Unavailable'}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
                              asChild
                            >
                              <Link to={`/books/${book.id}`}>
                                <Eye className="w-3 h-3 mr-1" />
                                View Details
                              </Link>
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="text-xs bg-white/20 hover:bg-white/30" 
                              asChild
                              onMouseEnter={() => schedulePreload(book.id, 200)}
                              onMouseLeave={() => cancelPreload(book.id)}
                            >
                              <Link to={`/books/${book.id}/viewer`} state={{ bookTitle: book.title }}>
                                <Play className="w-3 h-3 mr-1" />
                                3D View
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {books.map((book: Book, index: number) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ x: 10 }}
                      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-6">
                        <div className="w-20 h-28 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-2">{book.title}</h3>
                          <p className="text-gray-300 mb-3">{book.author}</p>
                          <div className="flex items-center space-x-4">
                            <Badge 
                              variant={book.isAvailable ? "default" : "secondary"}
                              className={book.isAvailable ? "bg-green-500 hover:bg-green-600" : "bg-gray-500"}
                            >
                              {book.isAvailable ? 'Available' : 'Unavailable'}
                            </Badge>
                            <span className="text-gray-400 text-sm">• 3D Model Available</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/20" asChild>
                            <Link to={`/books/${book.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" asChild>
                            <Link to={`/books/${book.id}/viewer`} state={{ bookTitle: book.title }}>
                              <Play className="w-4 h-4 mr-1" />
                              3D View
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
        
        {/* Enhanced No Results */}
        {!isLoading && books.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="text-8xl mb-6">📚</div>
            <h3 className="text-2xl font-bold text-white mb-4">No books found</h3>
            <p className="text-gray-300 text-lg mb-8">Try adjusting your search or filter criteria.</p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Search className="w-4 h-4 mr-2" />
              Browse All Books
            </Button>
          </motion.div>
        )}
        
        {/* Enhanced Pagination */}
        {!isLoading && books.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center"
          >
            <Pagination />
          </motion.div>
        )}
      </div>
    </div>
  );
};

const CatalogPage: React.FC = () => {
  return (
    <CatalogProvider>
      <CatalogContent />
    </CatalogProvider>
  );
};

export default CatalogPage;