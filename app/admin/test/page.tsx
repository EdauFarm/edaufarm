'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAdmin } from '@/lib/roleCheck';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  ShoppingCart,
  Users,
  Database
} from 'lucide-react';
import Link from 'next/link';
import ImageUploader from '@/components/admin/ImageUploader';
import { CldImage } from 'next-cloudinary';

export default function AdminTestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [testImages, setTestImages] = useState<string[]>([]);
  const [apiTestResult, setApiTestResult] = useState<string>('');
  const [dbTestResult, setDbTestResult] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/test');
    } else if (status === 'authenticated') {
      if (!isAdmin(session?.user?.role)) {
        toast.error('Access denied. Admin privileges required.');
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

  const handleTestApiConnection = async () => {
    try {
      const response = await fetch('/api/products?limit=1');
      if (response.ok) {
        setApiTestResult('✅ API Connected Successfully');
        toast.success('API test passed');
      } else {
        setApiTestResult('❌ API Connection Failed');
        toast.error('API test failed');
      }
    } catch (error) {
      setApiTestResult('❌ Error: ' + (error as Error).message);
      toast.error('API test error');
    }
  };

  const handleTestDatabase = async () => {
    try {
      const response = await fetch('/api/products?limit=1');
      const data = await response.json();
      if (data.products && Array.isArray(data.products)) {
        setDbTestResult(`✅ Database Connected - ${data.total || 0} products found`);
        toast.success('Database test passed');
      } else {
        setDbTestResult('❌ Database query failed');
        toast.error('Database test failed');
      }
    } catch (error) {
      setDbTestResult('❌ Error: ' + (error as Error).message);
      toast.error('Database test error');
    }
  };

  const handleClearTestImages = () => {
    setTestImages([]);
    toast.success('Test images cleared');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Test Center</h1>
              <p className="text-gray-600 mt-1">Test various system components and features</p>
            </div>
          </div>
        </div>

        {/* Test Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Image Upload Test */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Image Upload Test</h2>
                <p className="text-sm text-gray-600">Test Cloudinary integration</p>
              </div>
            </div>
            
            <ImageUploader images={testImages} onChange={setTestImages} />
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleClearTestImages}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Clear Test Images
              </button>
              <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700">
                {testImages.length} image(s)
              </div>
            </div>
          </div>

          {/* Image with Link Icon Display */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Image Display Test</h2>
                <p className="text-sm text-gray-600">Test image rendering with icons</p>
              </div>
            </div>

            {testImages.length > 0 ? (
              <div className="space-y-4">
                {testImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors">
                      {imageUrl.includes('cloudinary.com') ? (
                        <CldImage
                          src={imageUrl}
                          alt={`Test image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <img
                          src={imageUrl}
                          alt={`Test image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      {/* Link Icon Overlay */}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg">
                        <LinkIcon className="w-5 h-5 text-blue-600" />
                      </div>

                      {/* Image Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <p className="text-white text-sm font-medium truncate">
                          {imageUrl}
                        </p>
                        <p className="text-white/80 text-xs">Image #{index + 1}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <LinkIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">Upload images to see them with link icons</p>
              </div>
            )}
          </div>

          {/* API Connection Test */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">API Connection Test</h2>
                <p className="text-sm text-gray-600">Test API endpoints</p>
              </div>
            </div>

            <button
              onClick={handleTestApiConnection}
              className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium mb-4"
            >
              Test API Connection
            </button>

            {apiTestResult && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-mono">{apiTestResult}</p>
              </div>
            )}
          </div>

          {/* Database Test */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-yellow-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Database Test</h2>
                <p className="text-sm text-gray-600">Test MongoDB connection</p>
              </div>
            </div>

            <button
              onClick={handleTestDatabase}
              className="w-full px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium mb-4"
            >
              Test Database Query
            </button>

            {dbTestResult && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-mono">{dbTestResult}</p>
              </div>
            )}
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-indigo-200 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
                <p className="text-sm text-gray-600">Current system information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Session</span>
                </div>
                <p className="text-lg font-bold text-purple-600">
                  {session?.user?.email || 'N/A'}
                </p>
                <p className="text-xs text-purple-700 mt-1">
                  Role: {session?.user?.role || 'unknown'}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Cloudinary</span>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'Not configured'}
                </p>
                <p className="text-xs text-blue-700 mt-1">Cloud Name</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Test Images</span>
                </div>
                <p className="text-lg font-bold text-green-600">{testImages.length}</p>
                <p className="text-xs text-green-700 mt-1">Uploaded in session</p>
              </div>
            </div>
          </div>

          {/* Test URLs */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-pink-200 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Sample Image URLs</h2>
                <p className="text-sm text-gray-600">Test URLs for quick testing</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
                'https://images.unsplash.com/photo-1572635196237-14b3f281503f'
              ].map((url, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <LinkIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <code className="text-xs text-gray-600 flex-1 truncate">{url}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(url);
                      toast.success('URL copied!');
                    }}
                    className="px-3 py-1 text-xs bg-pink-500 text-white rounded hover:bg-pink-600"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Testing Instructions</h3>
          </div>
          <ul className="space-y-2 text-sm text-white/90">
            <li>• <strong>Image Upload:</strong> Test Cloudinary integration by uploading images</li>
            <li>• <strong>Image Display:</strong> Uploaded images will show with link icons</li>
            <li>• <strong>API Test:</strong> Verify API endpoints are responding</li>
            <li>• <strong>Database Test:</strong> Check MongoDB connection and data retrieval</li>
            <li>• <strong>System Status:</strong> View current session and configuration</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
