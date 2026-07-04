import { FiShoppingBag, FiTruck, FiShield, FiHeart } from 'react-icons/fi';

export const metadata = {
  title: 'About Us - Edau Farm',
  description: 'Learn about Edau Farm - West Pokots premier sustainable farm for honey, fruits, and livestock',
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">About Edau Farm</h1>

      <div className="prose max-w-none">
        <p className="text-lg text-gray-700 mb-6">
          Edau Farm is West Pokots premier sustainable farm, providing customers with premium Acacia honey, fresh seasonal fruits, Dorper sheep, and free-range poultry products.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 my-12">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FiShoppingBag className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Wide Selection</h3>
            <p className="text-gray-600 text-sm">Millions of products across all categories</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FiTruck className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Fast Delivery</h3>
            <p className="text-gray-600 text-sm">Quick and reliable shipping to your doorstep</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FiShield className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Secure Payment</h3>
            <p className="text-gray-600 text-sm">Safe and secure payment options</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FiHeart className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Customer First</h3>
            <p className="text-gray-600 text-sm">Dedicated customer support team</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-gray-700 mb-6">
          To improve the quality of everyday life in Africa by leveraging technology and innovation to deliver seamless shopping experiences.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
        <p className="text-gray-700 mb-6">
          To be the most trusted and convenient shopping destination for Africans, making quality products accessible to everyone.
        </p>
      </div>
    </div>
  );
}
