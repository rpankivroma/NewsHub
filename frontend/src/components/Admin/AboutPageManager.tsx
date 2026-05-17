import React from 'react';
import { Clock } from 'lucide-react';
import { AboutPage } from '../../types';

interface AboutPageManagerProps {
  aboutPage: AboutPage | null;
  setAboutPage: (v: AboutPage) => void;
  handleUpdateAboutPage: (e: React.FormEvent) => void;
}

export const AboutPageManager: React.FC<AboutPageManagerProps> = ({
  aboutPage,
  setAboutPage,
  handleUpdateAboutPage
}) => {
  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-6 md:p-10">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8 tracking-tight">Edit About Page</h3>
        
        {aboutPage ? (
          <form onSubmit={handleUpdateAboutPage} className="space-y-8 md:space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 ml-1">Page Title</label>
                <input 
                  type="text"
                  value={aboutPage.title}
                  onChange={(e) => setAboutPage({...aboutPage, title: e.target.value})}
                  className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-gray-50/50 border border-gray-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 ml-1">Subtitle</label>
                <input 
                  type="text"
                  value={aboutPage.subtitle}
                  onChange={(e) => setAboutPage({...aboutPage, subtitle: e.target.value})}
                  className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-gray-50/50 border border-gray-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 ml-1">Main Content</label>
              <textarea 
                rows={6}
                value={aboutPage.main_content}
                onChange={(e) => setAboutPage({...aboutPage, main_content: e.target.value})}
                className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-gray-50/50 border border-gray-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium leading-relaxed outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 ml-1">Mission Statement</label>
                <textarea 
                  rows={4}
                  value={aboutPage.mission_statement}
                  onChange={(e) => setAboutPage({...aboutPage, mission_statement: e.target.value})}
                  className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-gray-50/50 border border-gray-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium leading-relaxed outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 ml-1">Team Description</label>
                <textarea 
                  rows={4}
                  value={aboutPage.team_description}
                  onChange={(e) => setAboutPage({...aboutPage, team_description: e.target.value})}
                  className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-gray-50/50 border border-gray-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium leading-relaxed outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-500 ml-1">Values Description</label>
                <textarea 
                  rows={4}
                  value={aboutPage.values_description}
                  onChange={(e) => setAboutPage({...aboutPage, values_description: e.target.value})}
                  className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-gray-50/50 border border-gray-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium leading-relaxed outline-none"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h4 className="text-lg font-bold text-gray-900 mb-6 font-mono tracking-tight uppercase text-blue-600">Contact Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 ml-1">Email</label>
                  <input 
                    type="email"
                    value={aboutPage.email}
                    onChange={(e) => setAboutPage({...aboutPage, email: e.target.value})}
                    className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-blue-50/30 border border-blue-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 ml-1">Newsroom Email</label>
                  <input 
                    type="email"
                    value={aboutPage.newsroom_email}
                    onChange={(e) => setAboutPage({...aboutPage, newsroom_email: e.target.value})}
                    className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-blue-50/30 border border-blue-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 ml-1">Address</label>
                  <input 
                    type="text"
                    value={aboutPage.address}
                    onChange={(e) => setAboutPage({...aboutPage, address: e.target.value})}
                    className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-blue-50/30 border border-blue-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-500 ml-1">Phone</label>
                  <input 
                    type="text"
                    value={aboutPage.phone}
                    onChange={(e) => setAboutPage({...aboutPage, phone: e.target.value})}
                    className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-blue-50/30 border border-blue-100 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium outline-none"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white font-extrabold rounded-xl md:rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-[0.98]"
            >
              Update About Page
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-center py-20">
            <Clock className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};
