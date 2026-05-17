import React from 'react';
import { Heart, Clock } from 'lucide-react';
import { DonationSettings, Donation } from '../../types';

interface DonationManagerProps {
  donationSettings: DonationSettings | null;
  setDonationSettings: (settings: DonationSettings) => void;
  handleUpdateDonationSettings: (e: React.FormEvent) => void;
  donations: Donation[];
  renderEmptyState: (msg: string) => React.ReactNode;
}

export const DonationManager: React.FC<DonationManagerProps> = ({
  donationSettings,
  setDonationSettings,
  handleUpdateDonationSettings,
  donations,
  renderEmptyState,
}) => {
  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6 md:space-y-8">
      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-6 md:p-10">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8 tracking-tight">Manage Donation Settings</h3>
        
        {donationSettings ? (
          <form onSubmit={handleUpdateDonationSettings} className="space-y-8 md:space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 ml-1">Goal Amount ($)</label>
                <input 
                  type="number"
                  value={donationSettings.goal_amount}
                  onChange={(e) => setDonationSettings({...donationSettings, goal_amount: parseFloat(e.target.value)})}
                  className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-gray-50/50 border border-gray-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 ml-1">Current Amount ($)</label>
                <input 
                  type="number"
                  value={donationSettings.current_amount}
                  onChange={(e) => setDonationSettings({...donationSettings, current_amount: parseFloat(e.target.value)})}
                  className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-gray-50/50 border border-gray-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Campaign Description</label>
              <textarea 
                rows={4}
                value={donationSettings.campaign_description}
                onChange={(e) => setDonationSettings({...donationSettings, campaign_description: e.target.value})}
                className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-gray-50/50 border border-gray-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium leading-relaxed outline-none"
              />
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h4 className="text-lg font-bold text-gray-900 mb-6">Payment Methods</h4>
              
              <div className="space-y-6 md:space-y-8">
                {/* Patreon */}
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox"
                      checked={donationSettings.patreon_enabled}
                      onChange={(e) => setDonationSettings({...donationSettings, patreon_enabled: e.target.checked})}
                      className="w-5 h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 outline-none"
                    />
                    <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Enable Patreon</span>
                  </label>
                  {donationSettings.patreon_enabled && (
                    <div className="pl-8 space-y-2">
                      <p className="text-sm font-medium text-gray-400">Patreon URL</p>
                      <input 
                        type="text"
                        value={donationSettings.patreon_url || ''}
                        onChange={(e) => setDonationSettings({...donationSettings, patreon_url: e.target.value})}
                        className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-blue-50/30 border border-blue-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium outline-none"
                        placeholder="https://patreon.com/your-page"
                      />
                    </div>
                  )}
                </div>

                {/* PayPal */}
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox"
                      checked={donationSettings.paypal_enabled}
                      onChange={(e) => setDonationSettings({...donationSettings, paypal_enabled: e.target.checked})}
                      className="w-5 h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 outline-none"
                    />
                    <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Enable PayPal</span>
                  </label>
                  {donationSettings.paypal_enabled && (
                    <div className="pl-8 space-y-2">
                      <p className="text-sm font-medium text-gray-400">PayPal Email</p>
                      <input 
                        type="email"
                        value={donationSettings.paypal_email || ''}
                        onChange={(e) => setDonationSettings({...donationSettings, paypal_email: e.target.value})}
                        className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-blue-50/30 border border-blue-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium outline-none"
                        placeholder="donations@example.com"
                      />
                    </div>
                  )}
                </div>

                {/* Crypto */}
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox"
                      checked={donationSettings.crypto_enabled}
                      onChange={(e) => setDonationSettings({...donationSettings, crypto_enabled: e.target.checked})}
                      className="w-5 h-5 rounded-lg border-gray-300 text-blue-600 focus:ring-blue-500 outline-none"
                    />
                    <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">Enable Cryptocurrency</span>
                  </label>
                  {donationSettings.crypto_enabled && (
                    <div className="pl-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-400">Bitcoin Wallet</p>
                        <input 
                          type="text"
                          value={donationSettings.bitcoin_wallet || ''}
                          onChange={(e) => setDonationSettings({...donationSettings, bitcoin_wallet: e.target.value})}
                          className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-blue-50/30 border border-blue-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium outline-none"
                          placeholder="BTC Address"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-400">Ethereum Wallet</p>
                        <input 
                          type="text"
                          value={donationSettings.ethereum_wallet || ''}
                          onChange={(e) => setDonationSettings({...donationSettings, ethereum_wallet: e.target.value})}
                          className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-blue-50/30 border border-blue-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium outline-none"
                          placeholder="ETH address (0x...)"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="px-8 py-4 bg-blue-600 text-white font-extrabold rounded-xl md:rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-[0.98] w-full md:w-auto"
            >
              Update Donation Settings
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-center py-20">
            <Clock className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100">
          <h3 className="text-lg md:text-xl font-bold text-gray-900">Donation History</h3>
        </div>
        {donations.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {donations.map(d => (
              <div key={d.id} className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors gap-4">
                <div className="flex items-center gap-4 md:gap-6 text-left">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-green-50 text-green-600 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                    <Heart className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <div>
                    <p className="text-base md:text-lg font-extrabold text-gray-900">${d.amount.toFixed(2)}</p>
                    <p className="text-xs md:text-sm text-gray-500">From <span className="font-bold text-gray-900">{d.donor_name || 'Anonymous'}</span></p>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-gray-400 font-medium sm:text-right">
                  {new Date(d.timestamp).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : renderEmptyState("No donations yet. Let's grow our community!")}
      </div>
    </div>
  );
};
