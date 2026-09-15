/**
 * Natural-language product search for the /products page.
 *
 * Sits above the existing category filter rather than replacing it — the filter
 * is the fast path for "show me spices", and this is for the way buyers
 * actually describe what they need: "bulk onions for the Gulf market",
 * "something hardy that ships well".
 *
 * Submits on Enter, never on keystroke. Search-as-you-type against a model
 * endpoint would be one API call per character on a public page.
 */

import { useState, type FormEvent } from 'react';
import { Search, Sparkles, X, Loader2 } from 'lucide-react';
import { searchProducts, type SearchResponse } from '../../services/aiApi';

const EXAMPLES = [
  'bulk onions for the Gulf market',
  'something with a long shelf life',
  'premium fruit for European retail',
];

interface ProductSearchProps {
  onResults: (result: SearchResponse | null) => void;
}

export default function ProductSearch({ onResults }: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [activeQuery, setActiveQuery] = useState('');

  async function runSearch(searchTerm: string) {
    const term = searchTerm.trim();
    if (!term) return;

    setIsSearching(true);
    setError('');
    try {
      const result = await searchProducts(term);
      setActiveQuery(term);
      onResults(result);
    } catch {
      // The endpoint degrades internally, so reaching here means the network
      // itself failed. Keep the catalogue visible rather than blanking it.
      setError('Search is unavailable right now. Browse by category below.');
      onResults(null);
    } finally {
      setIsSearching(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void runSearch(query);
  }

  function clear() {
    setQuery('');
    setActiveQuery('');
    setError('');
    onResults(null);
  }

  return (
    <div className="mb-6 sm:mb-8">
      <form onSubmit={handleSubmit} className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          size={18}
          aria-hidden
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe what you need — e.g. bulk onions for the Gulf market"
          aria-label="Search products by description"
          className="w-full pl-11 pr-28 py-3.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {activeQuery && (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear search"
              className="p-2 text-gray-400 hover:text-[#0a0a0a] transition-colors"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 text-xs sm:text-sm font-medium rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span className="hidden sm:inline">Searching</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span className="hidden sm:inline">Search</span>
              </>
            )}
          </button>
        </div>
      </form>

      {!activeQuery && !error && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <span className="text-xs text-gray-400">Try:</span>
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setQuery(example);
                void runSearch(example);
              }}
              className="text-xs text-gray-500 hover:text-green-600 border border-gray-200 hover:border-green-600 rounded-full px-3 py-1 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-2.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
