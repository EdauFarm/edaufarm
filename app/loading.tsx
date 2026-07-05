export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-green-50 flex items-center justify-center">
      <div className="text-center">
        {/* Logo Pulse Animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-primary-200 rounded-2xl animate-pulse" />
          </div>
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mx-auto flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-bold">EF</span>
            </div>
          </div>
        </div>

        {/* Farm Icon */}
        <div className="text-4xl mb-4 animate-pulse">🌾</div>

        {/* Brand Name */}
        <h2 className="text-lg font-bold text-primary-700 mb-4">Edau Farm</h2>

        {/* Loading Dots */}
        <div className="flex gap-2 justify-center">
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>

        {/* Loading Text */}
        <p className="text-sm text-primary-500 mt-4">Loading fresh products...</p>
      </div>
    </div>
  );
}
