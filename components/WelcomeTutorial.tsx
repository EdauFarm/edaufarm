'use client';

import { useState, useEffect } from 'react';
import { FiX, FiChevronRight, FiSmartphone, FiShoppingCart, FiPhone, FiMail, FiDownload, FiCheckCircle } from 'react-icons/fi';

interface WelcomeTutorialProps {
  onClose: () => void;
}

export default function WelcomeTutorial({ onClose }: WelcomeTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop' | 'unknown'>('unknown');

  // Detect device type
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isDesktop = !isIOS && !isAndroid;

    if (isIOS) {
      setDeviceType('ios');
    } else if (isAndroid) {
      setDeviceType('android');
    } else if (isDesktop) {
      setDeviceType('desktop');
    }
  }, []);

  const steps = [
    {
      title: "Welcome to Edau Farm! 👋",
      content: "Thank you for visiting! For the best shopping experience, we recommend installing our app on your device. It's fast, works offline, and feels like a native app!",
      icon: <FiSmartphone className="w-6 h-6" />,
      action: "Get Started"
    },
    {
      title: deviceType === 'ios' ? "Install on iPhone/iPad 📱" : deviceType === 'android' ? "Install on Android 📱" : "Install on Your Device 💻",
      content: deviceType === 'ios' 
        ? "Follow these simple steps to add Edau Farm to your home screen:"
        : deviceType === 'android'
        ? "Follow these simple steps to install the app:"
        : "Install Edau Farm for quick access from your desktop:",
      icon: <FiDownload className="w-6 h-6" />,
      action: "Show Me How"
    },
    {
      title: "Installation Steps",
      content: "Let me guide you through the installation process step by step...",
      icon: <FiCheckCircle className="w-6 h-6" />,
      action: "Next"
    },
    {
      title: "Ready to Shop! 🛒",
      content: "Browse our premium honey, fresh fruits, livestock, and poultry products. Add items to cart and checkout securely with M-Pesa or other payment methods.",
      icon: <FiShoppingCart className="w-6 h-6" />,
      action: "Start Shopping"
    },
    {
      title: "Need Help? We're Here! 📞",
      content: "Contact us anytime! We're here to help with orders, returns, product questions, or technical support.",
      icon: <FiPhone className="w-6 h-6" />,
      action: "Finish Tutorial"
    }
  ];

  const typeText = (text: string, speed: number = 30) => {
    setIsTyping(true);
    setDisplayedText('');
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, speed);
  };

  useEffect(() => {
    typeText(steps[currentStep].content);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Mark tutorial as completed
      localStorage.setItem('edaufarm-tutorial-guided', 'true');
      localStorage.setItem('edaufarm-tutorial-completed-date', new Date().toISOString());
      onClose();
    }
  };

  const handleSkip = () => {
    // Mark as guided but skipped
    localStorage.setItem('edaufarm-tutorial-guided', 'skipped');
    localStorage.setItem('edaufarm-tutorial-completed-date', new Date().toISOString());
    onClose();
  };

  // Render installation instructions based on device
  const renderInstallationSteps = () => {
    if (currentStep !== 2) return null;

    if (deviceType === 'ios') {
      return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 space-y-4">
          <h4 className="font-semibold text-gray-900 text-sm">Step-by-Step Guide:</h4>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div className="flex-1">
                <p className="text-sm text-gray-800"><strong>Open Safari</strong></p>
                <p className="text-xs text-gray-600 mt-1">This only works in Safari browser on iOS</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div className="flex-1">
                <p className="text-sm text-gray-800"><strong>Tap the Share button</strong></p>
                <p className="text-xs text-gray-600 mt-1">Look for the 📤 icon at the bottom of your screen</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div className="flex-1">
                <p className="text-sm text-gray-800"><strong>Scroll and find &quot;Add to Home Screen&quot;</strong></p>
                <p className="text-xs text-gray-600 mt-1">You may need to scroll down in the menu</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <div className="flex-1">
                <p className="text-sm text-gray-800"><strong>Tap &quot;Add&quot;</strong></p>
                <p className="text-xs text-gray-600 mt-1">The Edau Farm icon will appear on your home screen! 🎉</p>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (deviceType === 'android') {
      return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 space-y-4">
          <h4 className="font-semibold text-gray-900 text-sm">Step-by-Step Guide:</h4>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div className="flex-1">
                <p className="text-sm text-gray-800"><strong>Look for the Install prompt</strong></p>
                <p className="text-xs text-gray-600 mt-1">Chrome may show an &quot;Install App&quot; banner at the top or bottom</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div className="flex-1">
                <p className="text-sm text-gray-800"><strong>Or tap the Menu (⋮)</strong></p>
                <p className="text-xs text-gray-600 mt-1">Find the three dots menu in the top-right corner</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div className="flex-1">
                <p className="text-sm text-gray-800"><strong>Select &quot;Add to Home Screen&quot; or &quot;Install App&quot;</strong></p>
                <p className="text-xs text-gray-600 mt-1">The option might vary based on your browser</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <div className="flex-1">
                <p className="text-sm text-gray-800"><strong>Tap &quot;Install&quot;</strong></p>
                <p className="text-xs text-gray-600 mt-1">Edau Farm will install like a native app! 🎉</p>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (deviceType === 'desktop') {
      return (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 space-y-4">
          <h4 className="font-semibold text-gray-900 text-sm">Step-by-Step Guide:</h4>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div className="flex-1">
                <p className="text-sm text-gray-800"><strong>Look for the Install icon</strong></p>
                <p className="text-xs text-gray-600 mt-1">Check the address bar for a ⊕ or ⬇️ install icon</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div className="flex-1">
                <p className="text-sm text-gray-800"><strong>Click &quot;Install&quot;</strong></p>
                <p className="text-xs text-gray-600 mt-1">Or go to Menu (⋮) → &quot;Install Edau Farm&quot;</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div className="flex-1">
                <p className="text-sm text-gray-800"><strong>Confirm installation</strong></p>
                <p className="text-xs text-gray-600 mt-1">Edau Farm will open in its own window! 🎉</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Getting Started</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Icon and Title */}
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gray-100 rounded-full text-gray-900">
              {steps[currentStep].icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {steps[currentStep].title}
            </h3>
          </div>

          {/* Conversation Bubble */}
          <div className="relative">
            <div className="bg-gray-100 rounded-2xl px-5 py-3 max-w-xs">
              <p className="text-gray-800 text-sm leading-relaxed">
                {displayedText}
                {isTyping && <span className="animate-pulse">|</span>}
              </p>
            </div>

            {/* Arrow */}
            <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-gray-100"></div>
          </div>

          {/* Installation Steps */}
          {renderInstallationSteps()}

          {/* Special content for contact step */}
          {currentStep === 4 && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <FiPhone className="w-4 h-4 text-gray-600" />
                <a href="https://wa.me/254753466211" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 underline">
                  WhatsApp: 0753466211
                </a>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <FiMail className="w-4 h-4 text-gray-600" />
                <a href="mailto:support@edaufarm.com" className="text-gray-700 hover:text-gray-900 underline break-all">
                  support@edaufarm.com
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={handleNext}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors"
          >
            <span>{steps[currentStep].action}</span>
            <FiChevronRight className="w-5 h-5" />
          </button>
          
          {currentStep === 0 && (
            <button
              onClick={handleSkip}
              className="w-full text-gray-600 hover:text-gray-900 text-sm font-medium py-2 transition-colors"
            >
              Skip Tutorial
            </button>
          )}

          {/* Step counter */}
          <div className="text-center text-xs text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </div>
    </div>
  );
}