'use client';

import { useState, useEffect } from 'react';
import { countries } from '@/lib/countries';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';
import { useCurrency } from '@/contexts/CurrencyContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import PaymentTabs from '@/components/PaymentTabs';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, total, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [counties, setCounties] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [useWallet, setUseWallet] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    country: 'Kenya', // Default country
    city: '',
    county: '',
    postalCode: '',
    paymentMethod: 'paybill', // Default to STK Push
    mpesaPhone: '',
    mpesaCode: '',
    saveAddress: false,
    addressLabel: 'Home',
  });

  const [showMpesaCode, setShowMpesaCode] = useState(false);
  // const [mpesaPaybill, setMpesaPaybill] = useState('522533'); // Removed paybill
  // const [accountNumber] = useState('GADGET2026');
  const [paymentPending, setPaymentPending] = useState(false);
  const [stkTransactionId, setStkTransactionId] = useState<string | null>(null);
  const [pollingStopped, setPollingStopped] = useState(false);

  const { currency } = useCurrency();
  // Currency-aware formatter
  const formatCurrency = (amount: number) =>
    require('@/lib/currencyFormat').convertAndFormatPrice(amount, 'KES', currency.code);

  // TODO: If you want to convert Ksh prices to other currencies, add conversion logic here using currency.code
  // For now, all prices are assumed to be in Ksh and only the symbol/code changes visually.

  // Fetch saved addresses and user info
  useEffect(() => {
    fetchCounties();
    if (session?.user) {
      fetchUserData();
      fetchWalletBalance();
    }
  }, [session]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/api/user/addresses');
      if (response.data.success) {
        setSavedAddresses(response.data.addresses);
        
        // Autofill with user info if no saved addresses
        if (response.data.userInfo && response.data.addresses.length === 0) {
          setFormData(prev => ({
            ...prev,
            fullName: response.data.userInfo.name || '',
            phone: response.data.userInfo.phone || '',
          }));
        }
        
        // Auto-select default address
        const defaultAddress = response.data.addresses.find((addr: any) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
          fillFormWithAddress(defaultAddress);
        }
      }
    } catch (error) {
    }
  };

  const fetchWalletBalance = async () => {
    setWalletLoading(true);
    try {
      const response = await axios.get('/api/wallet');
      if (response.data.success) {
        setWalletBalance(response.data.wallet.balance);
      }
    } catch (error) {
    } finally {
      setWalletLoading(false);
    }
  };

  const fetchCounties = async () => {
    // Check localStorage cache first
    const cachedCounties = localStorage.getItem('kenya_counties');
    const cacheTime = localStorage.getItem('kenya_counties_time');
    const now = Date.now();
    
    // Use cache if less than 24 hours old
    if (cachedCounties && cacheTime && (now - parseInt(cacheTime)) < 86400000) {
      setCounties(JSON.parse(cachedCounties));
      return;
    }
    
    setLocationsLoading(true);
    try {
      const response = await axios.get('/api/locations');
      if (response.data.success) {
        const countiesData = response.data.counties;
        setCounties(countiesData);
        // Cache for 24 hours
        localStorage.setItem('kenya_counties', JSON.stringify(countiesData));
        localStorage.setItem('kenya_counties_time', now.toString());
      }
    } catch (error) {
    } finally {
      setLocationsLoading(false);
    }
  };

  const fetchCities = async (county: string) => {
    // Check localStorage cache first
    const cacheKey = `kenya_cities_${county}`;
    const cachedCities = localStorage.getItem(cacheKey);
    const cacheTimeKey = `${cacheKey}_time`;
    const cacheTime = localStorage.getItem(cacheTimeKey);
    const now = Date.now();
    
    // Use cache if less than 24 hours old
    if (cachedCities && cacheTime && (now - parseInt(cacheTime)) < 86400000) {
      setCities(JSON.parse(cachedCities));
      return;
    }
    
    setLocationsLoading(true);
    try {
      const response = await axios.get(`/api/locations?county=${encodeURIComponent(county)}`);
      if (response.data.success) {
        const citiesData = response.data.cities;
        setCities(citiesData);
        // Cache for 24 hours
        localStorage.setItem(cacheKey, JSON.stringify(citiesData));
        localStorage.setItem(cacheTimeKey, now.toString());
      }
    } catch (error) {
    } finally {
      setLocationsLoading(false);
    }
  };

  const fillFormWithAddress = (address: any) => {
    setFormData(prev => ({
      ...prev,
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      county: address.county,
      postalCode: address.postalCode || '',
    }));
    
    if (address.county) {
      fetchCities(address.county);
    }
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    
    if (addressId === 'new') {
      // Reset form
      setFormData(prev => ({
        ...prev,
        fullName: session?.user?.name || '',
        phone: '',
        address: '',
        city: '',
        county: '',
        postalCode: '',
      }));
      setCities([]);
    } else {
      const address = savedAddresses.find(addr => addr._id === addressId);
      if (address) {
        fillFormWithAddress(address);
      }
    }
  };

  if (status === 'loading') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const subtotal = total();
  
  // Tiered shipping calculation
  let shipping = 0;
  if (subtotal < 1000) {
    shipping = 95;
  } else if (subtotal < 10000) {
    shipping = 125;
  } else if (subtotal < 20000) {
    shipping = 200;
  } else {
    shipping = 0; // Free shipping above 20k
  }
  
  const fee = 0; // No service fee
  const orderTotal = subtotal + shipping + fee;

  // Calculate wallet deduction
  const walletDeduction = useWallet ? Math.min(walletBalance, orderTotal) : 0;
  const remainingAmount = orderTotal - walletDeduction;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => {
      // Fix: Only update city if county actually changed
      if (name === 'county' && value !== prev.county) {
        fetchCities(value);
        return { ...prev, county: value, city: '' };
      }
      return { ...prev, [name]: newValue };
    });
  };

  const handleWhatsAppOrder = () => {
    // Build WhatsApp message with order details
    const formatCurrency = (amount: number) => `${currency.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency.code}`;
    const productDetails = items.map((item, index) => 
      `${index + 1}. ${item.title}${item.variant ? ` (${item.variant})` : ''}\n   Qty: ${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.price * item.quantity)}`
    ).join('\n\n');

    const shippingDetails = `
📍 *Shipping Address:*
Name: ${formData.fullName || '[Not provided]'}
Phone: ${formData.phone || '[Not provided]'}
Address: ${formData.address || '[Not provided]'}
Country: ${formData.country || '[Not provided]'}
City: ${formData.city || '[Not provided]'}
County: ${formData.county || '[Not provided]'}
${formData.postalCode ? `Postal Code: ${formData.postalCode}` : ''}`;

    const orderSummary = `
💰 *Order Summary:*
Subtotal: ${formatCurrency(subtotal)}
Shipping: ${shipping === 0 ? 'FREE' : formatCurrency(shipping)}
${useWallet && walletDeduction > 0 ? `Wallet Payment: -${formatCurrency(walletDeduction)}` : ''}
*Total: ${formatCurrency(useWallet ? remainingAmount : orderTotal)}*`;

    const message = `🛒 *New Order Request*

*Products:*
${productDetails}

${shippingDetails}

${orderSummary}

Please confirm this order. Thank you!`;

    // Updated WhatsApp info
    const whatsappNumber = '254727690165';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Handle Wallet-only payment (no additional payment needed)
      if (useWallet && remainingAmount === 0) {
        const orderData = {
          items: items.map((item) => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            variant: item.variant,
          })),
          shippingAddress: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            county: formData.county,
            ...(formData.postalCode && { postalCode: formData.postalCode }),
          },
          paymentMethod: 'wallet',
          walletAmount: walletDeduction,
          userId: session?.user?.id || null,
        };

        const res = await axios.post('/api/orders', orderData);

        // Save address if requested
        if (formData.saveAddress && selectedAddressId === 'new') {
          try {
            await axios.post('/api/user/addresses', {
              fullName: formData.fullName,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              county: formData.county,
              postalCode: formData.postalCode,
              label: formData.addressLabel,
              isDefault: savedAddresses.length === 0,
            });
          } catch (saveError) {}
        }

        toast.success('🎉 Order placed successfully using wallet balance!');
        clearCart();
        router.push(`/orders/${res.data.order._id}`);
        return;
      }

      // Handle STK Push payment (with optional wallet partial payment)
      if (formData.paymentMethod === 'stk-push') {
        // Initiate STK Push
        // Ensure amount is a plain number (remove commas, currency symbols, etc)
        let rawAmount = remainingAmount > 0 ? remainingAmount : orderTotal;
        // Always convert to string for replace, then back to number
        rawAmount = Number(String(rawAmount).replace(/[^\d.]/g, ''));
        const stkResponse = await axios.post('/api/orders/stk-push', {
          phone: formData.phone,
          amount: rawAmount,
          walletAmount: useWallet ? walletDeduction : 0,
          orderData: {
            items: items.map((item) => ({
              productId: item.productId,
              title: item.title,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              variant: item.variant,
            })),
            shippingAddress: {
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              county: formData.county,
              ...(formData.postalCode && { postalCode: formData.postalCode }),
            },
            userId: session?.user?.id || null,
          },
        });

        if (stkResponse.data.success) {
          toast.success('📱 STK push sent! Please check your phone and enter your M-Pesa PIN.');
          setPaymentPending(true);
          setStkTransactionId(stkResponse.data.transactionId);
          // Poll for payment status
          pollPaymentStatus(stkResponse.data.transactionId);
        }
      }

      // Handle Paybill payment: Always save order as pending
      if (formData.paymentMethod === 'paybill') {
        const orderData = {
          items: items.map((item) => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            variant: item.variant,
          })),
          shippingAddress: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            county: formData.county,
            ...(formData.postalCode && { postalCode: formData.postalCode }),
          },
          paymentMethod: 'paybill',
          mpesaCode: formData.mpesaCode,
          status: 'pending',
          userId: session?.user?.id || null,
        };

        const res = await axios.post('/api/orders', orderData);

        // Save address if requested
        if (formData.saveAddress && selectedAddressId === 'new') {
          try {
            await axios.post('/api/user/addresses', {
              fullName: formData.fullName,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              county: formData.county,
              postalCode: formData.postalCode,
              label: formData.addressLabel,
              isDefault: savedAddresses.length === 0,
            });
          } catch (saveError) {}
        }

        toast.success('Order submitted! Admin will follow up for payment confirmation.');
        clearCart();
        router.push(`/orders/${res.data.order._id}`);
        return;
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to place order';
      // Provide user-friendly error messages
      if (errorMessage.includes('phone')) {
        toast.error('❌ Invalid phone number. Please check and try again.');
      } else if (errorMessage.includes('amount')) {
        toast.error('❌ Order amount error. Please refresh and try again.');
      } else {
        toast.error(`❌ ${errorMessage}`);
      }
      setPaymentPending(false);
      setStkTransactionId(null);
    } finally {
      setLoading(false);
    }
  };

  // Poll payment status for STK Push
  const pollPaymentStatus = async (transactionId: string) => {
    const maxAttempts = 90; // 3 minutes max with 2s interval
    let attempts = 0;
    setPollingStopped(false);


    const checkStatus = async () => {
      if (pollingStopped) {
        return true;
      }

      try {
        const response = await axios.get(`/api/orders/stk-status?transactionId=${transactionId}`);

        // Provide progress feedback every 10 seconds
        if (attempts > 0 && attempts % 5 === 0 && response.data.status === 'pending') {
          const elapsed = (attempts * 2);
          if (elapsed === 10) {
            toast.loading('⏳ Waiting for M-Pesa confirmation...', { duration: 3000 });
          } else if (elapsed === 30) {
            toast.loading('⏳ Still checking... This can take up to 2 minutes.', { duration: 3000 });
          } else if (elapsed === 60) {
            toast.loading('⏳ Almost there... Checking payment status.', { duration: 3000 });
          }
        }

        if (response.data.status === 'completed') {
          setPaymentPending(false);
          setPollingStopped(true);
          toast.success('✅ Payment successful! Redirecting to your order...');
          clearCart();
          setTimeout(() => router.push(`/orders/${response.data.orderId}`), 1500);
          return true;
        } else if (response.data.status === 'failed') {
          setPaymentPending(false);
          setPollingStopped(true);
          const failureReason = response.data.message || 'Payment was cancelled or declined';
          toast.error(`❌ ${failureReason}\n\nYou can try again or use manual paybill.`, { duration: 5000 });
          return true;
        } else if (attempts >= maxAttempts) {
          setPaymentPending(false);
          setPollingStopped(true);
          toast.error('⏱️ Payment verification taking longer than expected.\n\nPlease check your M-Pesa messages. If payment succeeded, we\'ll process your order automatically.', { duration: 8000 });
          return true;
        }

        attempts++;
        if (!pollingStopped) {
          // Poll every 2 seconds for faster feedback
          setTimeout(checkStatus, 2000);
        }
      } catch (error) {
        attempts++;
        if (attempts < maxAttempts && !pollingStopped) {
          // Retry on errors with same interval
          setTimeout(checkStatus, 2000);
        } else {
          setPaymentPending(false);
          setPollingStopped(true);
          toast.error('Unable to verify payment status.\n\nCheck your M-Pesa messages or contact support.', { duration: 6000 });
        }
      }
    };

    checkStatus();
  };

  // Cancel payment verification
  const cancelPaymentVerification = () => {
    setPollingStopped(true);
    setPaymentPending(false);
    setStkTransactionId(null);
    toast('Payment verification cancelled. If you completed the payment, your order will still be processed.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded p-6">
            <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>

            {/* Saved Addresses Selection - Only show if user is authenticated */}
            {session?.user && savedAddresses.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Saved Address
                </label>
                <select
                  value={selectedAddressId}
                  onChange={(e) => handleAddressSelect(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {savedAddresses.map((addr) => (
                    <option key={addr._id} value={addr._id}>
                      {addr.label || 'Address'} - {addr.fullName} ({addr.city}, {addr.county})
                      {addr.isDefault && ' ✓ Default'}
                    </option>
                  ))}
                  <option value="new">+ Add New Address</option>
                </select>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="customer@edaufarm.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 0712345678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address / Location *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="e.g., Moi Avenue, Building Name, Apartment No."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {countries.map((country) => (
                      <option key={country.alpha2} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.country === 'Kenya' ? 'County *' : formData.country === 'United States' ? 'State *' : 'Region / State / County *'}
                </label>
                {formData.country === 'Kenya' ? (
                  <select
                    name="county"
                    value={formData.county}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select County</option>
                    {counties.map((county) => (
                      <option key={county} value={county}>
                        {county}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="county"
                    value={formData.county}
                    onChange={handleChange}
                    required
                    placeholder={formData.country === 'United States' ? 'Enter State' : 'Enter Region, State, or County'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City / Town *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  disabled={formData.country === 'Kenya' && !formData.county}
                  placeholder={formData.country === 'Kenya' ? (!formData.county ? 'Select County First' : cities.length === 0 ? 'Loading cities...' : 'Select or type city name') : 'Enter city/town'}
                  list={formData.country === 'Kenya' ? 'cities-list' : undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                />
                {formData.country === 'Kenya' && (
                  <datalist id="cities-list">
                    {cities.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code (Optional)
                </label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="e.g., 00100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Save Address Option */}
            {selectedAddressId === 'new' && session?.user && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="saveAddress"
                    checked={formData.saveAddress}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Save this address for future orders</span>
                </label>
                {formData.saveAddress && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Label (e.g., Home, Office, Workplace)
                    </label>
                    <input
                      type="text"
                      name="addressLabel"
                      value={formData.addressLabel}
                      onChange={handleChange}
                      placeholder="e.g., Home"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            )}

            <h2 className="text-xl font-semibold mt-8 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              Payment Method
            </h2>
            <PaymentTabs
              selected={formData.paymentMethod}
              onSelect={method => setFormData(prev => ({ ...prev, paymentMethod: method }))}
              country={formData.country}
              session={session}
              walletBalance={walletBalance}
            />

            {/* Wallet Balance Display - Only for authenticated users */}
            {session?.user && walletBalance > 0 && (
              <div className="mb-6 p-5 bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 border-2 border-purple-200 rounded-xl shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Available Balance</p>
                      <p className="text-2xl font-bold text-purple-700">{formatCurrency(walletBalance)}</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg shadow-sm border border-purple-200 hover:bg-purple-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={useWallet}
                      onChange={(e) => setUseWallet(e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Use Wallet</span>
                  </label>
                </div>
                {useWallet && (
                  <div className="mt-4 p-4 bg-white rounded-lg shadow-inner border border-purple-200">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Order Total</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(orderTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-purple-600 font-medium">Wallet Payment</span>
                        <span className="font-bold text-purple-600">-{formatCurrency(walletDeduction)}</span>
                      </div>
                      <div className="border-t-2 border-purple-100 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900">Remaining Amount</span>
                          <span className={`font-bold text-lg ${remainingAmount > 0 ? 'text-green-600' : 'text-purple-600'}`}>
                            {remainingAmount > 0 ? formatCurrency(remainingAmount) : '✓ PAID IN FULL'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment Panels */}
            {formData.paymentMethod === 'stk-push' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>How it works:</strong> Click "Place Order" and enter your M-Pesa PIN when prompted on your phone.
                </p>
                <p className="text-xs text-gray-600">
                  Amount to pay: <strong>{formatCurrency(useWallet ? remainingAmount : orderTotal)}</strong>
                </p>
              </div>
            )}

            {formData.paymentMethod === 'paybill' && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  BANK DETAILS
                </h4>

                <div className="text-sm text-gray-700 space-y-2">
                  <p>
                    <strong>Business Name:</strong> LOOP FOR BUSINESS
                  </p>

                  <p>
                    <strong>Paybill Number:</strong> 880100
                  </p>

                  <p>
                    <strong>Account Number:</strong> 880200345955
                  </p>

                  <p>
                    <strong>Bank:</strong> NCBA Bank 🏦
                  </p>
                </div>

                <div className="mt-3 text-xs text-gray-600">
                  <p>
                    Amount to pay: {" "}
                    <strong>
                      {formatCurrency(useWallet ? remainingAmount : orderTotal)}
                    </strong>
                  </p>
                  <p className="mt-1">
                    After payment, enter the transaction code or payment message to confirm your order.
                  </p>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Proof (Code or Message)
                  </label>
                  <textarea
                    name="mpesaCode"
                    value={formData.mpesaCode}
                    onChange={e => setFormData(prev => ({ ...prev, mpesaCode: e.target.value }))}
                    placeholder="Paste M-Pesa code or payment message here"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    autoComplete="off"
                    spellCheck={false}
                    inputMode="text"
                  />
                  <p className="text-xs text-gray-500 mt-1">You can paste the full SMS or just the code. We'll extract it automatically.</p>
                </div>
              </div>
            )}

            {formData.paymentMethod === 'wallet' && (
              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Wallet Payment:</strong> Full payment using your wallet balance.
                </p>
                <p className="text-xs text-gray-600">
                  Amount to pay: <strong>{formatCurrency(orderTotal)}</strong>
                </p>
              </div>
            )}

            {/* WhatsApp Order Alternative - Minimal */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Need help? Contact us on <strong>WhatsApp: +254 727 690165</strong></p>
              <button
                type="button"
                onClick={handleWhatsAppOrder}
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Order via WhatsApp
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || paymentPending}
              className="w-full mt-6 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {paymentPending ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Waiting for payment confirmation...
                </span>
              ) : loading ? (
                'Processing...'
              ) : formData.paymentMethod === 'stk-push' ? (
                '📱 Pay with M-Pesa STK Push'
              ) : (
                'Place Order'
              )}
            </button>

            {/* Cancel payment verification button */}
            {paymentPending && (
              <button
                type="button"
                onClick={cancelPaymentVerification}
                className="w-full mt-4 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600"
              >
                Cancel Payment Verification
              </button>
            )}
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.variant}`}
                  className="flex justify-between text-sm"
                >
                  <span className="text-gray-600">
                    {item.title} x {item.quantity}
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">
                  {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-bold text-primary-600">
                  {formatCurrency(orderTotal)}
                </span>
              </div>
              {useWallet && walletDeduction > 0 && (
                <>
                  <div className="flex justify-between text-purple-600">
                    <span className="font-semibold">Wallet Payment</span>
                    <span className="font-semibold">-{formatCurrency(walletDeduction)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg">
                    <span className="font-bold">Amount to Pay</span>
                    <span className="font-bold text-green-600">
                      {remainingAmount > 0 ? formatCurrency(remainingAmount) : 'PAID'}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
