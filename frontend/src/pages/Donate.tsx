import React from 'react';
import { Heart, CreditCard, Paintbrush, DollarSign, Bitcoin, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Donate() {
  const [selectedMethod, setSelectedMethod] = React.useState('card');
  const [selectedAmount, setSelectedAmount] = React.useState(25);
  const [customAmount, setCustomAmount] = React.useState('');

  const methods = [
    { id: 'card', name: 'Card', icon: CreditCard },
    { id: 'patreon', name: 'Patreon', icon: Paintbrush },
    { id: 'paypal', name: 'PayPal', icon: DollarSign },
    { id: 'crypto', name: 'Crypto', icon: Bitcoin },
  ];

  const amounts = [10, 25, 50, 100, 250];

  const progress = 65;
  const goal = 50000;
  const current = 32450;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-red-500 fill-red-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Support Independent Journalism</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Support independent journalism. Your donations help us continue delivering quality news coverage.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden mb-12">
        <div className="p-8 md:p-12">
          {/* Progress Section */}
          <div className="mb-12">
            <div className="flex justify-between items-end mb-3">
              <h3 className="font-bold text-gray-900">Campaign Progress</h3>
              <span className="text-blue-600 font-bold">$32,450 / $50,000</span>
            </div>
            <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full flex items-center justify-end px-2"
                style={{ width: `${progress}%` }}
              >
                <span className="text-[10px] font-bold text-white leading-none">{progress}%</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 font-medium flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
               {progress}% of our goal reached
            </p>
          </div>

          {/* Method Selection */}
          <div className="mb-12">
            <h3 className="font-bold text-gray-900 mb-6">Choose Donation Method</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {methods.map(method => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-3",
                    selectedMethod === method.id 
                      ? "bg-blue-50 border-blue-600 text-blue-600 shadow-md shadow-blue-50" 
                      : "bg-white border-gray-100 text-gray-600 hover:border-gray-200"
                  )}
                >
                  <method.icon className={cn("w-6 h-6", selectedMethod === method.id ? "text-blue-600" : "text-gray-400")} />
                  <span className="text-sm font-bold">{method.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Selection */}
          <div className="mb-12">
            <h3 className="font-bold text-gray-900 mb-6">Select Amount</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-6">
              {amounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
                  }}
                  className={cn(
                    "py-4 rounded-xl border-2 font-bold text-lg transition-all",
                    (selectedAmount === amount && !customAmount)
                      ? "bg-blue-50 border-blue-600 text-blue-600" 
                      : "bg-white border-gray-100 text-gray-600 hover:border-gray-300"
                  )}
                >
                  ${amount}
                </button>
              ))}
            </div>
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
                 className="w-full pl-10 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-600 focus:bg-white transition-all text-lg font-bold placeholder:font-medium"
               />
            </div>
          </div>

          <div className="p-6 bg-blue-50 rounded-2xl mb-8 border border-blue-100">
             <p className="text-gray-600 font-medium">Your contribution: <span className="text-2xl font-bold text-blue-600">${customAmount || selectedAmount}</span></p>
          </div>

          <button className="w-full py-5 bg-blue-600 text-white text-xl font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-[0.98]">
            Donate ${customAmount || selectedAmount}
          </button>
          <p className="text-center text-xs text-gray-400 mt-6 font-medium">This is a demo. No actual payment processing occurs.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          { title: "Why Donate?", text: "Your donations keep our journalism independent and free from corporate influence." },
          { title: "Impact", text: "Every contribution helps us hire talented journalists and invest in quality reporting." },
          { title: "Transparency", text: "We publish regular reports showing how donations are used to support our mission." }
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-4">{item.title}</h4>
            <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
