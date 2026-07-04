'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.categories': 'Categories',
    'nav.cart': 'Cart',
    'nav.account': 'Account',
    'nav.search': 'Search products...',
    'nav.help': 'Help',
    'nav.signIn': 'Sign In',
    'nav.signOut': 'Sign Out',
    'nav.myAccount': 'My Account',
    
    // TopBar
    'topbar.sellOnJumia': 'Sell on Jumia',
    'topbar.searchPlaceholder': 'Search products, brands and categories',
    'topbar.search': 'Search',
    'topbar.helpSupport': 'Help & Support',
    'topbar.language': 'Language',
    'topbar.openMenu': 'Open menu',
    
    // Auth
    'auth.signin': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.signout': 'Sign Out',
    'auth.welcome': 'Welcome Back',
    'auth.createAccount': 'Create Account',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.dontHaveAccount': "Don't have an account?",
    
    // Forms
    'form.fullName': 'Full Name',
    'form.email': 'Email Address',
    'form.phone': 'Phone Number',
    'form.password': 'Password',
    'form.confirmPassword': 'Confirm Password',
    'form.required': '*',
    
    // Products
    'product.addToCart': 'Add to Cart',
    'product.buyNow': 'Buy Now',
    'product.outOfStock': 'Out of Stock',
    'product.results': 'results',
    'product.viewAll': 'View All Results',
    'product.noResults': 'No products found',
    'product.tryDifferent': 'Try a different search term',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.emptyDesc': "Looks like you haven't added anything to your cart yet",
    'cart.startShopping': 'Start Shopping',
    'cart.checkout': 'Proceed to Checkout',
    'cart.clearCart': 'Clear Cart',
    'cart.clearConfirm': 'Are you sure you want to clear your cart?',
    'cart.orderSummary': 'Order Summary',
    'cart.continueShopping': 'Continue Shopping',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.fee': 'Service Fee',
    'cart.total': 'Total',
    'cart.freeShipping': 'FREE',
    'cart.remove': 'Remove',
    'cart.addedToCart': 'Added to cart!',
    'cart.walletBalance': 'Wallet Balance',
    'cart.useWallet': 'Use wallet balance',
    'cart.walletDeduction': 'Wallet Payment',
    'cart.amountToPay': 'Amount to Pay',
    'cart.paidInFull': 'PAID IN FULL',
    'cart.remainingToPay': 'Remaining to Pay',
    
    // Sell Page
    'sell.hero.title': 'Start Selling on Jumia',
    'sell.hero.subtitle': 'Reach millions of customers across Africa',
    'sell.hero.cta': 'Get Started Today',
    'sell.why.title': 'Why Sell on Jumia?',
    'sell.benefit.customers.title': 'Large Customer Base',
    'sell.benefit.customers.desc': 'Access millions of active shoppers across multiple countries',
    'sell.benefit.listing.title': 'Easy Product Listing',
    'sell.benefit.listing.desc': 'Simple tools to upload and manage your products',
    'sell.benefit.fees.title': 'Competitive Fees',
    'sell.benefit.fees.desc': 'Low commission rates and transparent pricing',
    'sell.benefit.analytics.title': 'Analytics Dashboard',
    'sell.benefit.analytics.desc': 'Track your sales and performance in real-time',
    'sell.howItWorks.title': 'How It Works',
    'sell.step1.title': 'Create Your Account',
    'sell.step1.desc': 'Sign up and complete your profile',
    'sell.step2.title': 'List Your Products',
    'sell.step2.desc': 'Add your products with photos and descriptions',
    'sell.step3.title': 'Start Selling',
    'sell.step3.desc': 'Receive orders and grow your business',
    'sell.ready.title': 'Ready to Start Selling?',
    'sell.ready.desc': 'Join thousands of successful merchants on Edau Farm',
    'sell.ready.cta': 'Create Account',
    
    // Help Page
    'help.hero.title': 'How Can We Help You?',
    'help.hero.subtitle': 'Get answers to your questions and support when you need it',
    'help.contact.title': 'Contact Us',
    'help.contact.phone': 'Phone Support',
    'help.contact.phoneNumber': '+234-800-000-0000',
    'help.contact.phoneDesc': 'Available 24/7 for urgent inquiries',
    'help.contact.email': 'Email Support',
    'help.contact.emailAddress': 'support@updates.loopnet.tech',
    'help.contact.emailDesc': 'We typically respond within 24 hours',
    'help.contact.chat': 'Live Chat',
    'help.contact.chatDesc': 'Chat with our support team',
    'help.contact.chatButton': 'Start Chat',
    'help.faq.title': 'Frequently Asked Questions',
    'help.faq.trackOrder.q': 'How do I track my order?',
    'help.faq.trackOrder.a': 'You can track your order by logging into your account and going to "My Orders". Click on the specific order to see its tracking details and current status.',
    'help.faq.payment.q': 'What payment methods do you accept?',
    'help.faq.payment.a': 'We accept various payment methods including credit/debit cards, mobile money, bank transfers, and cash on delivery (where available).',
    'help.faq.delivery.q': 'How long does delivery take?',
    'help.faq.delivery.a': 'Delivery times vary based on your location and the product. Standard delivery typically takes 2-7 business days. Express delivery options are available for select locations.',
    'help.faq.return.q': 'Can I return or exchange a product?',
    'help.faq.return.a': 'Yes! We offer a 7-day return policy for most products. Items must be unused and in their original packaging. Contact customer support to initiate a return.',
    'help.faq.damaged.q': 'What should I do if I receive a damaged product?',
    'help.faq.damaged.a': 'If you receive a damaged product, please contact customer support within 24 hours with photos of the damage. We will arrange for a replacement or full refund.',
    'help.support.title': 'Still Need Help?',
    'help.support.desc': 'Our customer support team is here to assist you',
    'help.support.button': 'Contact Support',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success!',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.categories': 'Catégories',
    'nav.cart': 'Panier',
    'nav.account': 'Compte',
    'nav.search': 'Rechercher des produits...',
    'nav.help': 'Aide',
    'nav.signIn': 'Se connecter',
    'nav.signOut': 'Déconnexion',
    'nav.myAccount': 'Mon Compte',
    
    // TopBar
    'topbar.sellOnJumia': 'Vendre sur Jumia',
    'topbar.searchPlaceholder': 'Rechercher des produits, marques et catégories',
    'topbar.search': 'Rechercher',
    'topbar.helpSupport': 'Aide & Support',
    'topbar.language': 'Langue',
    'topbar.openMenu': 'Ouvrir le menu',
    
    // Auth
    'auth.signin': 'Se connecter',
    'auth.signup': "S'inscrire",
    'auth.signout': 'Déconnexion',
    'auth.welcome': 'Bon retour',
    'auth.createAccount': 'Créer un compte',
    'auth.alreadyHaveAccount': 'Vous avez déjà un compte?',
    'auth.dontHaveAccount': "Vous n'avez pas de compte?",
    
    // Forms
    'form.fullName': 'Nom complet',
    'form.email': 'Adresse e-mail',
    'form.phone': 'Numéro de téléphone',
    'form.password': 'Mot de passe',
    'form.confirmPassword': 'Confirmer le mot de passe',
    'form.required': '*',
    
    // Products
    'product.addToCart': 'Ajouter au panier',
    'product.buyNow': 'Acheter maintenant',
    'product.outOfStock': 'Rupture de stock',
    'product.results': 'résultats',
    'product.viewAll': 'Voir tous les résultats',
    'product.noResults': 'Aucun produit trouvé',
    'product.tryDifferent': 'Essayez un autre terme de recherche',
    
    // Cart
    'cart.title': 'Panier',
    'cart.empty': 'Votre panier est vide',
    'cart.emptyDesc': "Vous n'avez encore rien ajouté à votre panier",
    'cart.addedToCart': 'Ajouté au panier!',
    'cart.startShopping': 'Commencer les achats',
    'cart.checkout': 'Passer à la caisse',
    'cart.clearCart': 'Vider le panier',
    'cart.clearConfirm': 'Êtes-vous sûr de vouloir vider votre panier?',
    'cart.orderSummary': 'Résumé de la commande',
    'cart.continueShopping': 'Continuer vos achats',
    'cart.subtotal': 'Sous-total',
    'cart.shipping': 'Livraison',
    'cart.fee': 'Frais de service',
    'cart.total': 'Total',
    'cart.freeShipping': 'GRATUIT',
    'cart.remove': 'Supprimer',
    'cart.walletBalance': 'Solde du portefeuille',
    'cart.useWallet': 'Utiliser le solde du portefeuille',
    'cart.walletDeduction': 'Paiement par portefeuille',
    'cart.amountToPay': 'Montant à payer',
    'cart.paidInFull': 'PAYÉ INTÉGRALEMENT',
    'cart.remainingToPay': 'Reste à payer',
    
    // Sell Page
    'sell.hero.title': 'Commencez à vendre sur Jumia',
    'sell.hero.subtitle': 'Atteignez des millions de clients en Afrique',
    'sell.hero.cta': 'Commencer aujourd\'hui',
    'sell.why.title': 'Pourquoi vendre sur Jumia?',
    'sell.benefit.customers.title': 'Large base de clients',
    'sell.benefit.customers.desc': 'Accédez à des millions d\'acheteurs actifs dans plusieurs pays',
    'sell.benefit.listing.title': 'Liste de produits facile',
    'sell.benefit.listing.desc': 'Outils simples pour télécharger et gérer vos produits',
    'sell.benefit.fees.title': 'Frais compétitifs',
    'sell.benefit.fees.desc': 'Taux de commission bas et tarification transparente',
    'sell.benefit.analytics.title': 'Tableau de bord analytique',
    'sell.benefit.analytics.desc': 'Suivez vos ventes et performances en temps réel',
    'sell.howItWorks.title': 'Comment ça marche',
    'sell.step1.title': 'Créez votre compte',
    'sell.step1.desc': 'Inscrivez-vous en tant que vendeur et complétez votre profil',
    'sell.step2.title': 'Listez vos produits',
    'sell.step2.desc': 'Ajoutez vos produits avec photos et descriptions',
    'sell.step3.title': 'Commencez à vendre',
    'sell.step3.desc': 'Recevez des commandes et développez votre entreprise',
    'sell.ready.title': 'Prêt à commencer à vendre?',
    'sell.ready.desc': 'Rejoignez des milliers de vendeurs prospères sur Jumia',
    'sell.ready.cta': 'Créer un compte vendeur',
    
    // Help Page
    'help.hero.title': 'Comment pouvons-nous vous aider?',
    'help.hero.subtitle': 'Obtenez des réponses à vos questions et de l\'aide quand vous en avez besoin',
    'help.contact.title': 'Contactez-nous',
    'help.contact.phone': 'Support téléphonique',
    'help.contact.phoneNumber': '+234-800-000-0000',
    'help.contact.phoneDesc': 'Disponible 24/7 pour les demandes urgentes',
    'help.contact.email': 'Support Email',
    'help.contact.emailAddress': 'support@updates.loopnet.tech',
    'help.contact.emailDesc': 'Nous répondons généralement dans les 24 heures',
    'help.contact.chat': 'Chat en direct',
    'help.contact.chatDesc': 'Discutez avec notre équipe de support',
    'help.contact.chatButton': 'Démarrer le chat',
    'help.faq.title': 'Questions fréquemment posées',
    'help.faq.trackOrder.q': 'Comment suivre ma commande?',
    'help.faq.trackOrder.a': 'Vous pouvez suivre votre commande en vous connectant à votre compte et en accédant à "Mes commandes". Cliquez sur la commande spécifique pour voir ses détails de suivi et son statut actuel.',
    'help.faq.payment.q': 'Quels modes de paiement acceptez-vous?',
    'help.faq.payment.a': 'Nous acceptons divers modes de paiement, y compris les cartes de crédit/débit, l\'argent mobile, les virements bancaires et le paiement à la livraison (si disponible).',
    'help.faq.delivery.q': 'Combien de temps prend la livraison?',
    'help.faq.delivery.a': 'Les délais de livraison varient en fonction de votre emplacement et du produit. La livraison standard prend généralement 2 à 7 jours ouvrables. Des options de livraison express sont disponibles pour certains endroits.',
    'help.faq.return.q': 'Puis-je retourner ou échanger un produit?',
    'help.faq.return.a': 'Oui! Nous offrons une politique de retour de 7 jours pour la plupart des produits. Les articles doivent être inutilisés et dans leur emballage d\'origine. Contactez le service client pour initier un retour.',

    'help.faq.damaged.q': 'Que dois-je faire si je reçois un produit endommagé?',
    'help.faq.damaged.a': 'Si vous recevez un produit endommagé, veuillez contacter le service client dans les 24 heures avec des photos des dommages. Nous organiserons un remplacement ou un remboursement complet.',
    'help.support.title': 'Besoin d\'aide supplémentaire?',
    'help.support.desc': 'Notre équipe de support client est là pour vous aider',
    'help.support.button': 'Contacter le support',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur est survenue',
    'common.success': 'Succès!',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.categories': 'الفئات',
    'nav.cart': 'السلة',
    'nav.account': 'الحساب',
    'nav.search': 'البحث عن المنتجات...',
    'nav.help': 'مساعدة',
    'nav.signIn': 'تسجيل الدخول',
    'nav.signOut': 'تسجيل الخروج',
    'nav.myAccount': 'حسابي',
    
    // TopBar
    'topbar.sellOnJumia': 'البيع على جوميا',
    'topbar.searchPlaceholder': 'البحث عن المنتجات والعلامات التجارية والفئات',
    'topbar.search': 'بحث',
    'topbar.helpSupport': 'المساعدة والدعم',
    'topbar.language': 'اللغة',
    'topbar.openMenu': 'فتح القائمة',
    
    // Auth
    'auth.signin': 'تسجيل الدخول',
    'auth.signup': 'التسجيل',
    'auth.signout': 'تسجيل الخروج',
    'auth.welcome': 'مرحبا بعودتك',
    'auth.createAccount': 'إنشاء حساب',
    'auth.alreadyHaveAccount': 'هل لديك حساب بالفعل؟',
    'auth.dontHaveAccount': 'ليس لديك حساب؟',
    
    // Forms
    'form.fullName': 'الاسم الكامل',
    'form.email': 'البريد الإلكتروني',
    'form.phone': 'رقم الهاتف',
    'form.password': 'كلمة المرور',
    'form.confirmPassword': 'تأكيد كلمة المرور',
    'form.required': '*',
    
    // Products
    'product.addToCart': 'أضف إلى السلة',
    'product.buyNow': 'اشتري الآن',
    'product.outOfStock': 'غير متوفر',
    'product.results': 'نتائج',
    'product.viewAll': 'عرض جميع النتائج',
    'product.noResults': 'لم يتم العثور على منتجات',
    'product.tryDifferent': 'جرب مصطلح بحث مختلف',
    
    // Cart
    'cart.title': 'سلة التسوق',
    'cart.empty': 'سلتك فارغة',
    'cart.addedToCart': 'تمت الإضافة إلى السلة!',
    'cart.emptyDesc': 'يبدو أنك لم تضف أي شيء إلى سلتك بعد',
    'cart.startShopping': 'ابدأ التسوق',
    'cart.checkout': 'الدفع',
    'cart.clearCart': 'إفراغ السلة',
    'cart.clearConfirm': 'هل أنت متأكد من رغبتك في إفراغ سلتك؟',
    'cart.orderSummary': 'ملخص الطلب',
    'cart.continueShopping': 'مواصلة التسوق',
    'cart.subtotal': 'المجموع الفرعي',
    'cart.shipping': 'الشحن',
    'cart.fee': 'رسوم الخدمة',
    'cart.total': 'المجموع',
    'cart.freeShipping': 'مجاني',
    'cart.remove': 'إزالة',
    'cart.walletBalance': 'رصيد المحفظة',
    'cart.useWallet': 'استخدام رصيد المحفظة',
    'cart.walletDeduction': 'دفع من المحفظة',
    'cart.amountToPay': 'المبلغ المطلوب دفعه',
    'cart.paidInFull': 'مدفوع بالكامل',
    'cart.remainingToPay': 'المتبقي للدفع',
    
    // Sell Page
    'sell.hero.title': 'ابدأ البيع على جوميا',
    'sell.hero.subtitle': 'الوصول إلى ملايين العملاء في جميع أنحاء أفريقيا',
    'sell.hero.cta': 'ابدأ اليوم',
    'sell.why.title': 'لماذا تبيع على جوميا؟',
    'sell.benefit.customers.title': 'قاعدة عملاء كبيرة',
    'sell.benefit.customers.desc': 'الوصول إلى ملايين المتسوقين النشطين في بلدان متعددة',
    'sell.benefit.listing.title': 'قائمة منتجات سهلة',
    'sell.benefit.listing.desc': 'أدوات بسيطة لتحميل وإدارة منتجاتك',
    'sell.benefit.fees.title': 'رسوم تنافسية',
    'sell.benefit.fees.desc': 'معدلات عمولة منخفضة وتسعير شفاف',
    'sell.benefit.analytics.title': 'لوحة تحليلات',
    'sell.benefit.analytics.desc': 'تتبع مبيعاتك وأدائك في الوقت الفعلي',
    'sell.howItWorks.title': 'كيف يعمل',
    'sell.step1.title': 'أنشئ حسابك',
    'sell.step1.desc': 'سجل كبائع وأكمل ملفك الشخصي',
    'sell.step2.title': 'أضف منتجاتك',
    'sell.step2.desc': 'أضف منتجاتك بالصور والأوصاف',
    'sell.step3.title': 'ابدأ البيع',
    'sell.step3.desc': 'استقبل الطلبات ونمِّ عملك',
    'sell.ready.title': 'هل أنت مستعد لبدء البيع؟',
    'sell.ready.desc': 'انضم إلى آلاف البائعين الناجحين على جوميا',
    'sell.ready.cta': 'إنشاء حساب بائع',
    
    // Help Page
    'help.hero.title': 'كيف يمكننا مساعدتك؟',
    'help.hero.subtitle': 'احصل على إجابات لأسئلتك والدعم عندما تحتاج إليه',
    'help.contact.title': 'اتصل بنا',
    'help.contact.phone': 'الدعم الهاتفي',
    'help.contact.phoneNumber': '+234-800-000-0000',
    'help.contact.phoneDesc': 'متاح على مدار الساعة للاستفسارات العاجلة',
    'help.contact.email': 'الدعم عبر البريد الإلكتروني',
    'help.contact.emailAddress': 'support@updates.loopnet.tech',
    'help.contact.emailDesc': 'عادة نرد خلال 24 ساعة',
    'help.contact.chat': 'محادثة مباشرة',
    'help.contact.chatDesc': 'تحدث مع فريق الدعم لدينا',
    'help.contact.chatButton': 'بدء المحادثة',
    'help.faq.title': 'الأسئلة الشائعة',
    'help.faq.trackOrder.q': 'كيف أتتبع طلبي؟',
    'help.faq.trackOrder.a': 'يمكنك تتبع طلبك عن طريق تسجيل الدخول إلى حسابك والانتقال إلى "طلباتي". انقر على الطلب المحدد لرؤية تفاصيل التتبع والحالة الحالية.',
    'help.faq.payment.q': 'ما هي طرق الدفع التي تقبلونها؟',
    'help.faq.payment.a': 'نقبل طرق دفع متنوعة بما في ذلك بطاقات الائتمان/الخصم والأموال المتنقلة والتحويلات المصرفية والدفع عند الاستلام (حيثما كان متاحًا).',
    'help.faq.delivery.q': 'كم من الوقت يستغرق التوصيل؟',
    'help.faq.delivery.a': 'تختلف أوقات التسليم بناءً على موقعك والمنتج. عادة ما يستغرق التسليم القياسي من 2 إلى 7 أيام عمل. تتوفر خيارات التسليم السريع لمواقع محددة.',
    'help.faq.return.q': 'هل يمكنني إرجاع أو استبدال منتج؟',
    'help.faq.return.a': 'نعم! نقدم سياسة إرجاع لمدة 7 أيام لمعظم المنتجات. يجب أن تكون العناصر غير مستخدمة وفي عبواتها الأصلية. اتصل بدعم العملاء لبدء الإرجاع.',

    'help.faq.damaged.q': 'ماذا يجب أن أفعل إذا تلقيت منتجًا تالفًا؟',
    'help.faq.damaged.a': 'إذا تلقيت منتجًا تالفًا، يرجى الاتصال بدعم العملاء في غضون 24 ساعة مع صور للضرر. سنرتب لاستبدال أو استرداد كامل.',
    'help.support.title': 'لا تزال بحاجة إلى مساعدة؟',
    'help.support.desc': 'فريق دعم العملاء لدينا هنا لمساعدتك',
    'help.support.button': 'اتصل بالدعم',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ',
    'common.success': 'نجح!',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
