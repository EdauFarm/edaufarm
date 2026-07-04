export const metadata = {
  title: 'Terms of Service - Edau Farm',
  description: 'Terms and conditions for using Edau Farm',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>

      <div className="prose max-w-none space-y-6">
        <p className="text-sm text-gray-600">Last updated: January 27, 2026</p>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-700">
            By accessing and using Edau Farm's website and services, you agree to be bound by these
            Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Account Registration</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>You must provide accurate and complete information when creating an account</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You must be at least 18 years old to create an account</li>
            <li>One person or entity may not maintain more than one account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Product Information and Pricing</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>We strive to display accurate product information and pricing</li>
            <li>Prices are subject to change without notice</li>
            <li>We reserve the right to correct pricing errors</li>
            <li>Product availability is not guaranteed until payment is confirmed</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Payment Terms</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Payment must be made at the time of order placement</li>
            <li>We accept various payment methods including M-Pesa, credit/debit cards</li>
            <li>All transactions are processed securely</li>
            <li>You authorize us to charge your selected payment method</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Shipping and Delivery</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Delivery times are estimates and not guaranteed</li>
            <li>Risk of loss passes to you upon delivery</li>
            <li>You must inspect items upon delivery and report damages within 48 hours</li>
            <li>Additional customs or import duties are your responsibility</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Prohibited Uses</h2>
          <p className="text-gray-700 mb-2">You agree not to:</p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Use our services for any illegal purpose</li>
            <li>Violate any local, national, or international law</li>
            <li>Infringe upon the rights of others</li>
            <li>Transmit any harmful code or malware</li>
            <li>Attempt to gain unauthorized access to our systems</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Intellectual Property</h2>
          <p className="text-gray-700">
            All content on this website, including text, graphics, logos, and software, is the 
            property of Edau Farm or its content suppliers and is protected by intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Limitation of Liability</h2>
          <p className="text-gray-700">
            Edau Farm shall not be liable for any indirect, incidental, special, consequential, or 
            punitive damages resulting from your use of or inability to use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Governing Law</h2>
          <p className="text-gray-700">
            These Terms shall be governed by and construed in accordance with the laws of Kenya, 
            without regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Contact Information</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">Email: legal@edaufarm.com</p>
            <p className="text-gray-700">Phone: +254 700 000 000</p>
            <p className="text-gray-700">Address: Nairobi, Kenya</p>
          </div>
        </section>
      </div>
    </div>
  );
}
