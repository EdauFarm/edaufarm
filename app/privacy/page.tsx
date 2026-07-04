export const metadata = {
  title: 'Privacy Policy - Edau Farm',
  description: 'Our privacy policy and how we protect your data',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
      
      <div className="prose max-w-none space-y-6">
        <p className="text-sm text-gray-600">Last updated: January 27, 2026</p>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
          <p className="text-gray-700 mb-2">We collect information that you provide directly to us, including:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Name, email address, and contact information</li>
            <li>Shipping and billing addresses</li>
            <li>Payment information (processed securely through payment providers)</li>
            <li>Purchase history and preferences</li>
            <li>Customer service communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
          <p className="text-gray-700 mb-2">We use the information we collect to:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about your orders and account</li>
            <li>Send you marketing communications (with your consent)</li>
            <li>Improve our services and user experience</li>
            <li>Prevent fraud and enhance security</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Information Sharing</h2>
          <p className="text-gray-700">
            We do not sell your personal information. We may share your information with:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Service providers who assist in order fulfillment and delivery</li>
            <li>Payment processors for secure transaction processing</li>
            <li>Marketing partners (only with your explicit consent)</li>
            <li>Law enforcement when required by law</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Data Security</h2>
          <p className="text-gray-700">
            We implement industry-standard security measures to protect your personal information, 
            including SSL encryption for data transmission and secure storage protocols. However, 
            no method of transmission over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Your Rights</h2>
          <p className="text-gray-700 mb-2">You have the right to:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Access and update your personal information</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Object to data processing</li>
            <li>Request a copy of your data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Cookies</h2>
          <p className="text-gray-700">
            We use cookies and similar tracking technologies to enhance your browsing experience, 
            analyze site traffic, and personalize content. You can control cookies through your 
            browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Contact Us</h2>
          <p className="text-gray-700">
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mt-2">
            <p className="text-gray-700">Email: privacy@edaufarm.com</p>
            <p className="text-gray-700">Phone: +254 700 000 000</p>
          </div>
        </section>
      </div>
    </div>
  );
}
