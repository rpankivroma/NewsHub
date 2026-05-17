import React from 'react';
import { Heart, CreditCard, Paintbrush, DollarSign, Bitcoin, Check, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { newsService } from '../services/newsService';

export default function Donate() {
  const [settings, setSettings] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedMethod, setSelectedMethod] = React.useState('card');
  const [selectedAmount, setSelectedAmount] = React.useState(25);
  const [customAmount, setCustomAmount] = React.useState('');
  const [isDonating, setIsDonating] = React.useState(false);
  const [donationSuccess, setDonationSuccess] = React.useState(false);
  const [successAmount, setSuccessAmount] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [donorName, setDonorName] = React.useState('');
  const [donorEmail, setDonorEmail] = React.useState('');

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await newsService.getDonationSettings();
        setSettings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();

    // Check if we back from payment with status=success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('status') === 'success') {
      setDonationSuccess(true);
      const amount = urlParams.get('amount');
      if (amount) setSuccessAmount(parseFloat(amount));
      
      // Clear URL params without reloading
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const handleDonate = async () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (!amount || amount <= 0) {
      setError("Please select or enter a valid donation amount.");
      return;
    }

    setError(null);
    setIsDonating(true);
    try {
      if (selectedMethod === 'card') {
        const paymentData = await newsService.initDonationPayment(
          amount, 
          'USD', 
          donorEmail || 'anonymous@example.com',
          donorName || 'Anonymous Donor',
          window.location.origin + window.location.pathname + '?status=success'
        );
        
        // Create a hidden form and submit it to LiqPay
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://www.liqpay.ua/api/3/checkout';
        form.acceptCharset = 'utf-8';
        form.target = '_blank'; // Open in new tab to avoid iframe/security issues

        if (paymentData.data) {
          const dataInput = document.createElement('input');
          dataInput.type = 'hidden';
          dataInput.name = 'data';
          dataInput.value = paymentData.data;
          form.appendChild(dataInput);
        }

        if (paymentData.signature) {
          const signatureInput = document.createElement('input');
          signatureInput.type = 'hidden';
          signatureInput.name = 'signature';
          signatureInput.value = paymentData.signature;
          form.appendChild(signatureInput);
        }

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        
        // Show a message that user is being redirected
        setError("Redirecting to checkout page. please check your new tab.");
        setTimeout(() => setError(null), 5000);
      } else {
        // Handle other methods as before (demonstration only)
        const response = await fetch('/api/donations/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amount,
            method: selectedMethod,
            status: 'success',
            donor_email: donorEmail || 'demo@example.com',
            donor_name: donorName || 'Anonymous Donor'
          })
        });
        if (response.ok) {
          setDonationSuccess(true);
          const updatedSettings = await newsService.getDonationSettings();
          setSettings(updatedSettings);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during payment initialization.");
    } finally {
      setIsDonating(false);
    }
  };

  if (isLoading) return <div className="py-24 text-center">Loading donation settings...</div>;
  if (!settings) return <div className="py-24 text-center">Failed to load donation settings.</div>;

  if (donationSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner shadow-green-100">
          <Check className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-4xl font-black text-gray-900 mb-4">Thank You!</h2>
        <p className="text-gray-600 text-xl font-medium mb-10">
          Your donation of <span className="text-green-600 font-black">${successAmount || selectedAmount}</span> has been received. You're helping us make a difference.
        </p>
        <button 
          onClick={() => {
            setDonationSuccess(false);
            setSuccessAmount(null);
            setSelectedAmount(25);
          }}
          className="px-10 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-xl shadow-gray-200"
        >
          Make Another Donation
        </button>
      </div>
    );
  }

  const methods = [
    { id: 'card', name: 'Card', icon: CreditCard, color: 'text-blue-600', border: 'border-blue-600', bg: 'bg-blue-50', iconLabel: '💳' },
    { id: 'patreon', name: 'Patreon', icon: Paintbrush, color: 'text-orange-600', border: 'border-orange-600', bg: 'bg-orange-50/50', iconLabel: '🎨' },
    { id: 'paypal', name: 'PayPal', icon: DollarSign, color: 'text-blue-800', border: 'border-blue-800', bg: 'bg-blue-50/50', iconLabel: '💼' },
    { id: 'crypto', name: 'Crypto', icon: Bitcoin, color: 'text-purple-600', border: 'border-purple-600', bg: 'bg-purple-50/50', iconLabel: '₿' },
  ];

  const availableMethods = methods.filter(method => {
    if (method.id === 'card') return true; // Card is always available for this demo
    if (method.id === 'patreon') return settings.patreon_enabled;
    if (method.id === 'paypal') return settings.paypal_enabled;
    if (method.id === 'crypto') return settings.crypto_enabled;
    return false;
  });

  const progress = Math.min(100, Math.round((settings.current_amount / settings.goal_amount) * 100));

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 font-sans">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-red-500 fill-red-500" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Support Our Journalism</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
          {settings.campaign_description || "Help us keep independent news alive. Your contribution directly supports investigators and quality reporting."}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-2xl shadow-gray-200/40 border border-gray-100 overflow-hidden mb-12 animate-in fade-in zoom-in duration-500">
        <div className="p-6 md:p-12">
          {/* Campaign Progress Section */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h3 className="text-lg font-bold text-gray-700">Campaign Progress</h3>
              <div className="flex items-center gap-1">
                <span className="text-[#3b59ff] text-xl font-black">${settings.current_amount.toLocaleString()}</span>
                <span className="text-gray-400 font-bold">/</span>
                <span className="text-[#3b59ff] text-xl font-black">${settings.goal_amount.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="relative h-4 w-full bg-gray-100 rounded-full overflow-visible mb-3">
              <div 
                className="absolute top-0 left-0 h-full bg-[#3b59ff] rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-[#3b59ff] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md z-10">
                  {progress}%
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>{progress}% of our goal reached</span>
            </div>
          </div>

          {/* Choose Donation Method */}
          <div className="mb-10">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Choose Donation Method</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {availableMethods.map(method => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={cn(
                    "flex items-center justify-center p-4 md:p-6 rounded-xl border-2 transition-all gap-3 h-16 md:h-20 group relative",
                    selectedMethod === method.id 
                      ? "border-[#3b59ff] bg-[#f0f3ff] text-[#3b59ff]" 
                      : "bg-white border-gray-100 text-gray-600 hover:border-gray-200"
                  )}
                >
                  <span className="text-lg md:text-xl group-hover:scale-125 transition-transform">{method.iconLabel}</span>
                  <span className="text-base md:text-lg font-bold">{method.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-10">
            {selectedMethod === 'card' && (
              <div className="animate-in fade-in duration-500 space-y-8 md:space-y-10">
                {/* Donor Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 ml-1">Full Name (Optional)</label>
                    <input 
                      type="text"
                      placeholder="John Doe"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full px-5 md:px-6 py-3 md:py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 ml-1">Email (Optional)</label>
                    <input 
                      type="email"
                      placeholder="john@example.com"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      className="w-full px-5 md:px-6 py-3 md:py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium outline-none"
                    />
                  </div>
                </div>

                {/* Select Amount */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Select Amount</h3>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                    {[10, 25, 50, 100, 250].map(amount => (
                      <button
                        key={amount}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount('');
                        }}
                        className={cn(
                          "py-3 md:py-4 rounded-xl border-2 font-bold text-base md:text-lg transition-all",
                          (selectedAmount === amount && !customAmount)
                            ? "border-[#3b59ff] bg-[#f0f3ff] text-[#3b59ff]" 
                            : "bg-white border-gray-100 text-gray-600 hover:border-gray-200"
                        )}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Custom Amount</h3>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input 
                      type="number"
                      placeholder="Enter custom amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(0);
                      }}
                      className="w-full pl-10 pr-6 py-5 bg-white border-2 border-gray-100 rounded-xl outline-none focus:border-[#3b59ff] transition-all text-lg font-medium placeholder:text-gray-300"
                    />
                  </div>
                </div>

                {/* Contribution Summary */}
                <div className="p-8 bg-[#f3f6ff] rounded-xl border border-blue-50">
                   <p className="text-[#3b59ff] text-lg font-medium">Your contribution: <span className="text-3xl font-black ml-1">${customAmount || selectedAmount}</span></p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 font-medium text-center animate-in fade-in slide-in-from-top-2 duration-300">
                    {error}
                  </div>
                )}

                {/* Donate Button */}
                <button 
                  disabled={isDonating || (!selectedAmount && !customAmount)}
                  onClick={handleDonate}
                  className="w-full py-5 bg-[#3b59ff] text-white text-xl font-bold rounded-xl hover:bg-[#2a45e6] shadow-xl shadow-blue-100 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isDonating ? 'Processing...' : `Donate $${customAmount || selectedAmount}`}
                </button>
              </div>
            )}

            {selectedMethod === 'patreon' && settings.patreon_enabled && (
              <div className="animate-in fade-in duration-500">
                <div className="p-10 bg-orange-50/50 rounded-xl border border-orange-100">
                  <h3 className="text-2xl font-black text-[#e85b19] mb-4">Support us on Patreon</h3>
                  <p className="text-orange-800 text-lg mb-8 leading-relaxed max-w-2xl font-medium">
                    Become a patron and get exclusive benefits including early access to articles and behind-the-scenes content.
                  </p>
                  <a 
                    href={settings.patreon_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-[#e85b19] text-white text-xl font-bold rounded-xl hover:bg-[#ff424d] transition-all shadow-lg shadow-orange-100"
                  >
                    Visit our Patreon <Heart className="w-6 h-6" />
                  </a>
                </div>
              </div>
            )}

            {selectedMethod === 'paypal' && settings.paypal_enabled && (
              <div className="animate-in fade-in duration-500">
                <div className="p-10 bg-blue-50/30 rounded-xl border border-blue-100">
                  <h3 className="text-2xl font-black text-[#003087] mb-4">Donate via PayPal</h3>
                  <p className="text-blue-800 text-lg mb-8 leading-relaxed font-medium">
                    Send your donation directly to our PayPal account: <span className="font-bold underline">{settings.paypal_email}</span>
                  </p>
                  <a 
                    href={`https://paypal.me/${settings.paypal_email?.split('@')[0]}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 px-10 py-4 bg-[#3b59ff] text-white text-xl font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                  >
                    Donate with PayPal <Check className="w-6 h-6" />
                  </a>
                </div>
              </div>
            )}

            {selectedMethod === 'crypto' && settings.crypto_enabled && (
              <div className="animate-in fade-in duration-500">
                <div className="p-10 bg-purple-50/30 rounded-xl border border-purple-100">
                  <h3 className="text-2xl font-black text-purple-900 mb-8">Donate with Cryptocurrency</h3>
                  
                  <div className="space-y-6">
                    {settings.bitcoin_wallet && (
                      <div>
                        <label className="block text-sm font-bold text-purple-800 mb-2 uppercase tracking-wider">Bitcoin (BTC)</label>
                        <div className="flex bg-white border border-purple-100 rounded-lg p-5 font-mono text-gray-700 text-sm shadow-sm">
                           {settings.bitcoin_wallet}
                        </div>
                      </div>
                    )}

                    {settings.ethereum_wallet && (
                      <div>
                        <label className="block text-sm font-bold text-purple-800 mb-2 uppercase tracking-wider">Ethereum (ETH)</label>
                        <div className="flex bg-white border border-purple-100 rounded-lg p-5 font-mono text-gray-700 text-sm shadow-sm">
                           {settings.ethereum_wallet}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-sm text-gray-400 mt-12 font-medium">Payments are processed securely via LiqPay.</p>
        </div>
      </div>
    </div>
  );
}
