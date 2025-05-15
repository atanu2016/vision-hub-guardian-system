
import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

type SearchResult = {
  id: string;
  name: string;
  type: 'camera' | 'recording' | 'alert' | 'log';
  description?: string;
  path: string;
};

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Close results when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (query.length >= 2) {
        performSearch(query);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Search cameras
      const { data: cameras, error: cameraError } = await supabase
        .from('cameras')
        .select('id, name, location')
        .ilike('name', `%${searchQuery}%`)
        .order('name')
        .limit(5);

      if (cameraError) throw cameraError;

      // Search logs
      const { data: logs, error: logError } = await supabase
        .from('system_logs')
        .select('id, message, source, level')
        .ilike('message', `%${searchQuery}%`)
        .order('timestamp', { ascending: false })
        .limit(5);
        
      if (logError) throw logError;
      
      // Format results
      const formattedResults: SearchResult[] = [
        ...(cameras || []).map(camera => ({
          id: camera.id,
          name: camera.name,
          type: 'camera' as const,
          description: camera.location,
          path: `/cameras/${camera.id}`,
        })),
        ...(logs || []).map(log => ({
          id: log.id,
          name: `${log.level.toUpperCase()}: ${log.message.substring(0, 30)}${log.message.length > 30 ? '...' : ''}`,
          type: 'log' as const,
          description: `Source: ${log.source}`,
          path: `/settings/logs`,
        })),
      ];

      setResults(formattedResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(result.path);
    setShowResults(false);
    setQuery('');
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-sm">
      <div className="relative">
        <Search
          className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search cameras, recordings, alerts..."
          className="w-full pl-8 bg-secondary/50"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => {
            if (query.length >= 2) {
              setShowResults(true);
            }
          }}
        />
      </div>
      
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-[300px] overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map(result => (
                <div
                  key={result.id}
                  className="p-2 hover:bg-accent rounded-sm cursor-pointer"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{result.name}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                      {result.type}
                    </span>
                  </div>
                  {result.description && (
                    <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center">
              <p>No results found</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
