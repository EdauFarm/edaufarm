'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAdmin } from '@/lib/roleCheck';
import toast from 'react-hot-toast';
import {
  Package,
  ArrowLeft,
  Save,
  X
} from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import ImageUploader from '@/components/admin/ImageUploader';

interface Product {
  _id: string;
  title: string;
  title_fr?: string;
  title_ar?: string;
  description: string;
  description_fr?: string;
  description_ar?: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  brand?: string;
  sku: string;
  stock: number;
  variants?: {
    name: string;
    options: string[];
    price?: number;
    stock?: number;
  }[];
  specifications?: {
    key: string;
    value: string;
  }[];
  rating: {
    average: number;
    count: number;
  };
  tags: string[];
  featured: boolean;
  active: boolean;
  buybackEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function EditProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    title_fr: '',
    title_ar: '',
    description: '',
    description_fr: '',
    description_ar: '',
    price: '',
    compareAtPrice: '',
    category: '',
    subcategory: '',
    brand: '',
    sku: '',
    stock: '',
    images: [] as string[],
    specifications: [{ key: '', value: '' }],
    tags: '',
    featured: false,
    active: true,
    buybackEnabled: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/products');
    } else if (status === 'authenticated') {
      if (!isAdmin(session?.user?.role)) {
        toast.error('Access denied. Admin privileges required.');
        router.push('/dashboard');
      } else {
        fetchProduct();
      }
    }
  }, [status, session, router, productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${productId}`);
      const product: Product = response.data.product || response.data;

      // Populate form with existing data
      setFormData({
        title: product.title || '',
        title_fr: product.title_fr || '',
        title_ar: product.title_ar || '',
        description: product.description || '',
        description_fr: product.description_fr || '',
        description_ar: product.description_ar || '',
        price: product.price?.toString() || '',
        compareAtPrice: product.compareAtPrice?.toString() || '',
        category: product.category || '',
        subcategory: product.subcategory || '',
        brand: product.brand || '',
        sku: product.sku || '',
        stock: product.stock?.toString() || '',
        images: product.images?.length > 0 ? product.images : [],
        specifications: product.specifications && product.specifications.length > 0
          ? product.specifications.map(spec => ({ key: spec.key, value: spec.value }))
          : [{ key: '', value: '' }],
        tags: product.tags?.join(', ') || '',
        featured: product.featured || false,
        active: product.active !== undefined ? product.active : true,
        buybackEnabled: product.buybackEnabled || false,
      });
    } catch (error: any) {
      toast.error('Failed to load product data');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
        stock: parseInt(formData.stock),
        images: formData.images.filter(img => img.trim() !== ''),
        specifications: formData.specifications.filter(spec => spec.key && spec.value),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      };

      const response = await axios.put(`/api/products/${productId}`, productData);

      toast.success('Product updated successfully');
      router.push('/admin/products');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData(prev => ({ ...prev, specifications: newSpecs }));
  };

  const addSpecField = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }],
    }));
  };

  const removeSpecField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600 mt-2">Update product information and settings</p>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Edit Mode:</strong> All fields are pre-filled with existing product data. Modify any field and save to update.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="Enter product title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="Enter product description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compare at Price
                  </label>
                  <input
                    type="number"
                    name="compareAtPrice"
                    value={formData.compareAtPrice}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Category & Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Category & Details</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    list="category-suggestions"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Type or select a category"
                  />
                  <datalist id="category-suggestions">
                    <option value="phones" />
                    <option value="laptops" />
                    <option value="tablets" />
                    <option value="soundbars" />
                    <option value="fridges" />
                    <option value="cookers" />
                    <option value="accessories" />
                    <option value="high-end-gadgets" />
                    <option value="smartwatches" />
                    <option value="headphones" />
                    <option value="cameras" />
                    <option value="gaming" />
                    <option value="tvs" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="e.g., Smartphones"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="e.g., Samsung"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="e.g., PHN-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="e.g., premium, bestseller, new"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Images</h2>
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-700">
                ✨ <strong>Drag to reorder:</strong> Drag images to change their order. The first image is your primary display image.
                Click <span className="font-semibold">"1st"</span> button to set any image as primary.
              </p>
            </div>
            <ImageUploader images={formData.images} onChange={handleImagesChange} />
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Specifications</h2>

            <div className="space-y-3">
              {formData.specifications.map((spec, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Key (e.g., Display)"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      placeholder="Value (e.g., 6.5 inch)"
                    />
                    {formData.specifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpecField(index)}
                        className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addSpecField}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-slate-500 hover:text-slate-600 transition-colors"
              >
                + Add Specification
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Options</h2>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-5 h-5 text-slate-600 border-gray-300 rounded focus:ring-slate-500"
                />
                <span className="text-gray-700">Featured Product</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="w-5 h-5 text-slate-600 border-gray-300 rounded focus:ring-slate-500"
                />
                <span className="text-gray-700">Active (Visible to customers)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="buybackEnabled"
                  checked={formData.buybackEnabled}
                  onChange={handleChange}
                  className="w-5 h-5 text-slate-600 border-gray-300 rounded focus:ring-slate-500"
                />
                <span className="text-gray-700">Enable Buyback</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-3 rounded-lg hover:shadow-lg disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Update Product
                </>
              )}
            </button>
            <Link
              href="/admin/products"
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-semibold"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}