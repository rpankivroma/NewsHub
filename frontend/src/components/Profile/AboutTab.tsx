import React, { useState } from 'react';
import { Plus, X, Lock, Bell, CheckSquare, Square } from 'lucide-react';
import { User, Category } from '../../types';

interface AboutTabProps {
  user: User;
  isEditing: boolean;
  categories: Category[];
  editedBio: string;
  setEditedBio: (val: string) => void;
  editedInterests: string[];
  setEditedInterests: (val: string[]) => void;
  editedTags: string[];
  setEditedTags: (val: string[]) => void;
  newsletterSubscribed: boolean;
  setNewsletterSubscribed: (val: boolean) => void;
  onForgotPassword: () => void;
}

export default function AboutTab({ 
  user, 
  isEditing, 
  categories, 
  editedBio, 
  setEditedBio, 
  editedInterests, 
  setEditedInterests,
  editedTags,
  setEditedTags,
  newsletterSubscribed,
  setNewsletterSubscribed,
  onForgotPassword
}: AboutTabProps) {
  const [newTag, setNewTag] = useState('');
  
  const toggleInterest = (categoryName: string) => {
    if (!isEditing) return;
    if (editedInterests.includes(categoryName)) {
      setEditedInterests(editedInterests.filter(i => i !== categoryName));
    } else {
      setEditedInterests([...editedInterests, categoryName]);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !editedTags.includes(newTag.trim())) {
      setEditedTags([...editedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setEditedTags(editedTags.filter(t => t !== tag));
  };

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">Bio</h3>
        {isEditing ? (
          <textarea 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-6 outline-none focus:border-blue-600 transition-all font-medium text-gray-700"
            value={editedBio}
            onChange={(e) => setEditedBio(e.target.value)}
            rows={4}
            placeholder="Tell us about yourself..."
          />
        ) : (
          <p className="text-gray-600 leading-relaxed font-medium">
            {user.bio || "No bio yet. Click Edit Profile to add one!"}
          </p>
        )}
      </div>
      
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">Interested Topics</h3>
        <div className="flex flex-wrap gap-2">
          {editedInterests.length > 0 ? (
            editedInterests.map(t => (
              <span 
                key={t} 
                className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all ${
                  isEditing 
                    ? "bg-blue-600 text-white border-blue-600 cursor-pointer hover:bg-blue-700" 
                    : "bg-blue-50 text-blue-600 border-blue-100"
                }`}
                onClick={() => isEditing && toggleInterest(t)}
              >
                {t}
                {isEditing && <X className="w-3 h-3" />}
              </span>
            ))
          ) : !isEditing && (
            <p className="text-gray-400 text-sm">No interests selected.</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">Custom Tags</h3>
        {isEditing && (
          <div className="flex gap-2">
            <input 
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              placeholder="Add a custom tag (e.g., AI, Crypto, Wellness)"
              className="flex-1 bg-gray-50 border border-gray-100 rounded-md px-4 py-2 outline-none focus:border-blue-600 transition-all font-medium"
            />
            <button 
              onClick={addTag}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-all"
            >
              Add
            </button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {editedTags.map(t => (
            <span 
              key={t} 
              className="px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-xs font-bold border border-purple-100 flex items-center gap-1.5"
            >
              {t}
              {isEditing && (
                <button onClick={() => removeTag(t)} className="hover:text-purple-800">
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
          {!isEditing && editedTags.length === 0 && (
            <p className="text-gray-400 text-sm">No custom tags added.</p>
          )}
        </div>
      </div>

      <div className="pt-6">
        {isEditing ? (
          <label className="flex items-center gap-3 cursor-pointer group py-4 px-6 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-all">
            <div 
              onClick={() => setNewsletterSubscribed(!newsletterSubscribed)}
              className="text-gray-400 group-hover:text-blue-600 transition-colors"
            >
              {newsletterSubscribed ? (
                <CheckSquare className="w-6 h-6 text-blue-600" />
              ) : (
                <Square className="w-6 h-6" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="font-bold text-gray-700">Subscribe to newsletter</span>
            </div>
          </label>
        ) : newsletterSubscribed ? (
          <div className="flex items-center gap-3 py-4 px-6 bg-green-50 rounded-lg border border-green-100 text-green-700">
            <Bell className="w-5 h-5" />
            <span className="font-bold">Subscribed to newsletter</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 py-4 px-6 bg-gray-50 rounded-lg border border-gray-100 text-gray-500">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-bold">Not subscribed to newsletter</span>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="space-y-4 pt-4 border-t border-gray-50">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Available Topics</h3>
          <div className="flex flex-wrap gap-2">
            {categories.filter(c => !editedInterests.includes(c.name)).map(cat => (
              <button
                key={cat.id}
                onClick={() => toggleInterest(cat.name)}
                className="px-4 py-1.5 border border-gray-200 text-gray-600 rounded-full text-xs font-bold hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" /> {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isEditing && (
        <div className="pt-10 border-t border-gray-50">
          <button 
            onClick={onForgotPassword}
            className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Lock className="w-4 h-4" /> Forgot or Change Password?
          </button>
        </div>
      )}
    </div>
  );
}
