import { useState, useRef, useEffect } from 'react';
import { Search, X, Pill, Activity, Camera, Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const typeConfig = {
  medications: { icon: Pill, color: 'text-blue-600', bg: 'bg-blue-100', path: '/medications', label: 'Medication' },
  physicalTherapy: { icon: Activity, color: 'text-green-600', bg: 'bg-green-100', path: '/physical-therapy', label: 'Exercise' },
  skinScans: { icon: Camera, color: 'text-purple-600', bg: 'bg-purple-100', path: '/skin-scans', label: 'Skin Scan' },
  visionTests: { icon: Eye, color: 'text-orange-600', bg: 'bg-orange-100', path: '/vision-tests', label: 'Vision Test' },
  medicalHistory: { icon: FileText, color: 'text-red-600', bg: 'bg-red-100', path: '/medical-history', label: 'Medical Record' },
};

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
        setResults(response.data);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const getItemName = (type, item) => {
    switch (type) {
      case 'medications': return item.name;
      case 'physicalTherapy': return item.exerciseName;
      case 'skinScans': return item.bodyLocation;
      case 'visionTests': return item.testType;
      case 'medicalHistory': return item.condition;
      default: return 'Unknown';
    }
  };

  const getItemSubtext = (type, item) => {
    switch (type) {
      case 'medications': return item.purpose;
      case 'physicalTherapy': return item.bodyPart;
      case 'skinScans': return item.symptomDescription?.substring(0, 60) + '...';
      case 'visionTests': return `${item.leftEyeResult || 'N/A'} / ${item.rightEyeResult || 'N/A'}`;
      case 'medicalHistory': return item.status;
      default: return '';
    }
  };

  const handleSelect = (type) => {
    const config = typeConfig[type];
    if (config) {
      navigate(config.path);
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl" role="search" aria-label="Global search">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search medications, records, exercises..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results && setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2.5 bg-gray-100 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent text-sm"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults(null); setIsOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
        {loading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && results && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-96 overflow-y-auto z-50" role="listbox">
          {results.totalResults === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <div className="p-2">
              <p className="text-xs text-gray-400 px-3 py-2">{results.totalResults} result{results.totalResults !== 1 ? 's' : ''} found</p>
              {Object.entries(results.results).map(([type, items]) => {
                if (!items || items.length === 0) return null;
                const config = typeConfig[type];
                if (!config) return null;
                const Icon = config.icon;

                return (
                  <div key={type}>
                    <p className="text-xs font-semibold text-gray-400 uppercase px-3 py-2 mt-1">{config.label}s</p>
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(type)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-left transition-colors"
                        role="option"
                      >
                        <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-800 truncate">{getItemName(type, item)}</p>
                          <p className="text-xs text-gray-500 truncate">{getItemSubtext(type, item)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
