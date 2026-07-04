export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        {/* Logo Pulse Animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gray-200 rounded-2xl animate-pulse" />
          </div>
          <div className="relative">
            <div className="w-16 h-16 bg-gray-900 rounded-xl mx-auto flex items-center justify-center">
              <span className="text-white text-2xl font-bold">G</span>
            </div>
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex gap-2 justify-center">
          <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
