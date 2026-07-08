'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FarmStoryVideo() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideoUrl() {
      try {
        const response = await fetch('/api/site-settings');
        const data = await response.json();
        if (data.settings?.farm_story_video_url) {
          setVideoUrl(data.settings.farm_story_video_url);
        }
      } catch (error) {
        console.error('Failed to fetch video URL:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchVideoUrl();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[300px] lg:h-[450px] rounded-2xl overflow-hidden bg-neutral-800 animate-pulse" />
    );
  }

  return (
    <div className="order-1 lg:order-2">
      <div className="relative w-full h-[300px] lg:h-[450px] rounded-2xl overflow-hidden bg-neutral-900 shadow-2xl">
        {videoUrl ? (
          <iframe
            src={videoUrl}
            title="Edau Farm Story"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-900 to-primary-950">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-white/60">Video coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
