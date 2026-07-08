'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { isAdmin } from '@/lib/roleCheck';
import toast from 'react-hot-toast';
import Link from 'next/link';
import axios from 'axios';
import {
  FiChevronLeft,
  FiCopy,
  FiRefreshCw,
  FiZap,
  FiLoader,
  FiCheck,
  FiHash,
  FiTarget,
  FiUsers
} from 'react-icons/fi';

interface CaptionResult {
  caption: string;
  hashtags: string[];
}

const captionStyles = [
  { id: 'market', label: 'Market Day', description: 'Perfect for showcasing fresh produce at the market' },
  { id: 'story', label: 'Farm Story', description: 'Share the journey from seed to harvest' },
  { id: 'seasonal', label: 'Seasonal Harvest', description: 'Highlight what is in season now' },
  { id: 'benefit', label: 'Health Benefits', description: 'Focus on nutritional value and wellness' },
  { id: 'tradition', label: 'Traditional Methods', description: 'Emphasize heritage farming practices' },
];

const targetAudiences = [
  { id: 'families', label: 'Families', description: 'Health-conscious parents buying for the household' },
  { id: 'chefs', label: 'Chefs and Restaurants', description: 'Professional kitchens seeking quality ingredients' },
  { id: 'farmers', label: 'Fellow Farmers', description: 'Agricultural community and breeding stock buyers' },
  { id: 'wholesale', label: 'Wholesale Buyers', description: 'Bulk purchasers and distributors' },
];

export default function AICaptionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('market');
  const [selectedAudience, setSelectedAudience] = useState('families');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<CaptionResult[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/ai-captions');
    } else if (status === 'authenticated' && !isAdmin(session?.user?.role)) {
      toast.error('Access denied. Admin privileges required.');
      router.push('/dashboard');
    }
  }, [status, session, router]);

  const generateCaptions = useCallback(async () => {
    if (!productName.trim()) {
      toast.error('Please enter a product name');
      return;
    }

    setGenerating(true);
    setResults([]);

    try {
      const response = await axios.post('/api/admin/ai-captions', {
        productName: productName.trim(),
        productDescription: productDescription.trim(),
        style: selectedStyle,
        audience: selectedAudience,
        additionalNotes: additionalNotes.trim(),
      });

      setResults(response.data.captions || []);
      toast.success('Captions generated successfully');
    } catch (error: any) {
      console.error('Error generating captions:', error);
      toast.error(error.response?.data?.error || 'Failed to generate captions. Please check your API key.');
    } finally {
      setGenerating(false);
    }
  }, [productName, productDescription, selectedStyle, selectedAudience, additionalNotes]);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const copyHashtags = async (hashtags: string[]) => {
    try {
      await navigator.clipboard.writeText(hashtags.join(' '));
      toast.success('Hashtags copied');
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-800 mb-4"
          >
            <FiChevronLeft className="w-5 h-5" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
              <FiZap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary-800">AI Marketing Captions</h1>
              <p className="text-gray-600">Generate compelling marketing content for your farm products</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-primary-100 p-6">
            <h2 className="text-xl font-semibold text-primary-800 mb-6 flex items-center gap-2">
              <FiTarget className="w-5 h-5" />
              Product Details
            </h2>

            <div className="space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g., Pure Acacia Honey 500g"
                  className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Product Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Description
                </label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Describe your product (origin, quality, what makes it special)..."
                  rows={3}
                  className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Caption Style */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Caption Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {captionStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-3 rounded-xl text-left transition-all border ${
                        selectedStyle === style.id
                          ? 'bg-primary-100 border-primary-500 text-primary-800'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-primary-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{style.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <FiUsers className="w-4 h-4 inline mr-1" />
                  Target Audience
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {targetAudiences.map((audience) => (
                    <button
                      key={audience.id}
                      onClick={() => setSelectedAudience(audience.id)}
                      className={`p-3 rounded-xl text-left transition-all border ${
                        selectedAudience === audience.id
                          ? 'bg-primary-100 border-primary-500 text-primary-800'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-primary-300'
                      }`}
                    >
                      <div className="font-medium text-sm">{audience.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any specific details to include (seasonal availability, special offer, harvest date)..."
                  rows={2}
                  className="w-full px-4 py-3 border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={generateCaptions}
                disabled={generating || !productName.trim()}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {generating ? (
                  <>
                    <FiLoader className="w-5 h-5 animate-spin" />
                    <span>Generating Captions...</span>
                  </>
                ) : (
                  <>
                    <FiZap className="w-5 h-5" />
                    <span>Generate Captions</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-primary-100 p-6">
            <h2 className="text-xl font-semibold text-primary-800 mb-6 flex items-center gap-2">
              <FiHash className="w-5 h-5" />
              Generated Captions
            </h2>

            {results.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <FiZap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium text-gray-700 mb-2">No captions yet</p>
                <p className="text-sm">Fill in your product details and click generate</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-primary-50 to-green-50 rounded-xl p-5 border border-primary-100"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="text-xs font-semibold text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
                        Option {index + 1}
                      </span>
                      <button
                        onClick={() => copyToClipboard(result.caption, index)}
                        className={`p-2 rounded-lg transition-all ${
                          copiedIndex === index
                            ? 'bg-green-500 text-white'
                            : 'bg-white text-primary-600 hover:bg-primary-100'
                        }`}
                        title="Copy caption"
                      >
                        {copiedIndex === index ? (
                          <FiCheck className="w-5 h-5" />
                        ) : (
                          <FiCopy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-gray-800 leading-relaxed mb-3">{result.caption}</p>
                    {result.hashtags && result.hashtags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-gray-500">Hashtags:</span>
                        <button
                          onClick={() => copyHashtags(result.hashtags)}
                          className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1"
                        >
                          <FiCopy className="w-3 h-3" />
                          Copy all
                        </button>
                        <div className="flex flex-wrap gap-1">
                          {result.hashtags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Regenerate Button */}
                <button
                  onClick={generateCaptions}
                  disabled={generating}
                  className="w-full flex items-center justify-center gap-2 border-2 border-primary-200 text-primary-700 px-6 py-3 rounded-xl font-medium hover:bg-primary-50 transition-all disabled:opacity-50"
                >
                  <FiRefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                  <span>Generate More</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
