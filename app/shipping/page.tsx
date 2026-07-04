import { FiTruck, FiPackage, FiMapPin, FiClock } from 'react-icons/fi';

export const metadata = {
  title: 'Shipping Information - Edau Farm',
  description: 'Learn about our shipping policies and delivery options for farm products',
};

export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Shipping Information</h1>
      
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 rounded-lg mb-8">
        <p className="text-lg text-gray-800">
          We offer fast and reliable shipping across Kenya and beyond. Get your orders delivered safely to your doorstep.
        </p>
      </div>

      <div className="space-y-8">
        <section className="bg-white p-6 border border-gray-200 rounded">
          <div className="flex items-start gap-4">
            <FiTruck className="w-8 h-8 text-primary-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Delivery Options</h2>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Standard Delivery:</strong> 3-7 business days - Free for orders over KSh 10,000</li>
                <li><strong>Express Delivery:</strong> 1-2 business days - KSh 500</li>
                <li><strong>Same Day Delivery:</strong> Available in Nairobi - KSh 800</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 border border-gray-200 rounded">
          <div className="flex items-start gap-4">
            <FiMapPin className="w-8 h-8 text-primary-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Delivery Areas</h2>
              <p className="text-gray-700 mb-2">We deliver to all major cities and towns in Kenya:</p>
              <ul className="grid grid-cols-2 gap-2 text-gray-700">
                <li>• Nairobi</li>
                <li>• Mombasa</li>
                <li>• Kisumu</li>
                <li>• Nakuru</li>
                <li>• Eldoret</li>
                <li>• Thika</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 border border-gray-200 rounded">
          <div className="flex items-start gap-4">
            <FiPackage className="w-8 h-8 text-primary-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Order Tracking</h2>
              <p className="text-gray-700">
                Once your order is shipped, you'll receive a tracking number via email and SMS. 
                You can track your package in real-time through our website or mobile app.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 border border-gray-200 rounded">
          <div className="flex items-start gap-4">
            <FiClock className="w-8 h-8 text-primary-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Processing Time</h2>
              <p className="text-gray-700">
                Orders are typically processed within 1-2 business days. During peak seasons 
                (holidays, flash sales), processing may take slightly longer. We'll keep you 
                updated every step of the way.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
