import { FiRotateCcw, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

export const metadata = {
  title: 'Returns & Refunds - Edau Farm',
  description: 'Our return and refund policy for farm products',
};

export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Returns & Refunds Policy</h1>
      
      <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg mb-8">
        <p className="text-lg text-gray-800">
          We want you to be completely satisfied with your purchase. If you're not happy, we offer easy returns within 14 days.
        </p>
      </div>

      <div className="space-y-8">
        <section className="bg-white p-6 border border-gray-200 rounded">
          <div className="flex items-start gap-4">
            <FiRotateCcw className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Return Window</h2>
              <p className="text-gray-700 mb-4">
                You have 14 days from the date of delivery to return most items. Simply initiate 
                a return request through your account, and we'll arrange for pickup.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Electronics:</strong> 7 days return window</li>
                <li><strong>Fashion & Apparel:</strong> 14 days return window</li>
                <li><strong>Opened items:</strong> May be subject to restocking fee</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 border border-gray-200 rounded">
          <div className="flex items-start gap-4">
            <FiCheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Eligible Returns</h2>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Item received is damaged or defective</li>
                <li>✓ Wrong item delivered</li>
                <li>✓ Item doesn't match description</li>
                <li>✓ Changed your mind (for eligible categories)</li>
                <li>✓ Item in original condition with tags attached</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 border border-gray-200 rounded">
          <div className="flex items-start gap-4">
            <FiXCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Non-Returnable Items</h2>
              <ul className="space-y-2 text-gray-700">
                <li>✗ Personalized or customized products</li>
                <li>✗ Perishable goods</li>
                <li>✗ Intimate apparel and swimwear</li>
                <li>✗ Downloaded software or digital content</li>
                <li>✗ Gift cards and vouchers</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 border border-gray-200 rounded">
          <div className="flex items-start gap-4">
            <FiAlertCircle className="w-8 h-8 text-primary-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Refund Process</h2>
              <p className="text-gray-700 mb-4">
                Once we receive and inspect your returned item, we'll process your refund within 5-7 business days.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>1. Initiate return request through your account</li>
                <li>2. Pack item securely in original packaging</li>
                <li>3. Our courier will pick up the item</li>
                <li>4. Item inspected at our facility</li>
                <li>5. Refund processed to original payment method</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
