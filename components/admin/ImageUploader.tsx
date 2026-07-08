'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, GripVertical } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }
      formData.append('files', file);
    });

    try {
      const response = await axios.post('/api/cloudinary/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newUrls = response.data.urls.map((item: any) => item.url);
      // Preserve existing images and add new ones
      onChange([...images, ...newUrls]);
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  }, [images, onChange]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return;

    try {
      new URL(urlInput); // Validate URL
      onChange([...images, urlInput.trim()]);
      setUrlInput('');
      toast.success('Image URL added');
    } catch {
      toast.error('Please enter a valid URL');
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
    toast.success('Image removed');
  };

  const isCloudinaryUrl = (url: string) => {
    return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
  };

  // Image reordering functions
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleImageDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex === null) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];

    // Remove from old position
    newImages.splice(draggedIndex, 1);
    // Insert at new position
    newImages.splice(dropIndex, 0, draggedImage);

    onChange(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
    toast.success('Image order updated');
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const setAsPrimary = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const image = newImages.splice(index, 1)[0];
    newImages.unshift(image);
    onChange(newImages);
    toast.success('Set as primary image');
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setUploadMode('upload')}
          className={`px-4 py-2 font-medium flex items-center gap-2 transition-colors ${
            uploadMode === 'upload'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload Images
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('url')}
          className={`px-4 py-2 font-medium flex items-center gap-2 transition-colors ${
            uploadMode === 'url'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          Add Image URL
        </button>
      </div>

      {/* Upload Area */}
      {uploadMode === 'upload' && (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            multiple
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              {uploading ? (
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Upload className="w-8 h-8 text-primary-500" />
              )}
            </div>
            <div>
              <p className="text-gray-700 font-medium">
                {uploading ? 'Uploading...' : 'Drop images here or click to browse'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PNG, JPG, WEBP up to 10MB each
              </p>
            </div>
          </label>
        </div>
      )}

      {/* URL Input */}
      {uploadMode === 'url' && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleUrlAdd()}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-gray-50 focus:bg-white"
            placeholder="https://example.com/image.jpg"
          />
          <button
            type="button"
            onClick={handleUrlAdd}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium"
          >
            Add URL
          </button>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
            <GripVertical className="w-4 h-4" />
            <span>Drag images to reorder - First image is the primary display image</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <div
                key={imageUrl + index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleImageDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-move ${
                  draggedIndex === index
                    ? 'border-primary-500 opacity-50 scale-95'
                    : dragOverIndex === index
                    ? 'border-primary-500 scale-105'
                    : 'border-gray-200 hover:border-primary-400'
                }`}
              >
                {isCloudinaryUrl(imageUrl) ? (
                  <CldImage
                    src={imageUrl}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover pointer-events-none"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <img
                    src={imageUrl}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                )}

                {/* Drag handle */}
                <div className="absolute top-2 left-2 p-1.5 bg-gray-800/70 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Action buttons */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => setAsPrimary(index)}
                      className="p-1.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 text-xs font-semibold"
                      aria-label="Set as primary"
                      title="Set as primary image"
                    >
                      1st
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Primary badge */}
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary-600 text-white text-xs font-semibold rounded-lg shadow-lg flex items-center gap-1">
                    <span>★</span>
                    <span>Primary</span>
                  </div>
                )}

                {/* Image number */}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-gray-800/70 text-white text-xs font-semibold rounded">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No images added yet</p>
        </div>
      )}
    </div>
  );
}
