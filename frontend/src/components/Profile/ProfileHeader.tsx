import React, { useRef } from 'react';
import { Mail, Shield, Edit2, Check, X, Camera } from 'lucide-react';
import { User } from '../../types';
import { userService } from '../../services/userService';

interface ProfileHeaderProps {
  user: User;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  onSave: () => void;
  onPhotoUpdate: (url: string) => void;
}

export default function ProfileHeader({ user, isEditing, setIsEditing, onSave, onPhotoUpdate }: ProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const handlePhotoClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await userService.uploadPhoto(file);
      onPhotoUpdate(result.url);
    } catch (error) {
      console.error('Failed to upload photo:', error);
      alert('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative mb-12 bg-white rounded-[1.25rem] shadow-sm border border-gray-100 overflow-hidden">
      {/* Banner */}
      <div className="h-48 w-full bg-blue-600" />
      
      <div className="px-6 md:px-10 pb-6 md:pb-10">
        <div className="relative flex flex-col md:flex-row items-center justify-between -mt-12 md:-mt-16 mb-6 gap-4">
          <div className="relative group">
            <div 
              className={`w-24 h-24 md:w-36 md:h-36 rounded-full border-[4px] md:border-[6px] border-white bg-white overflow-hidden shadow-sm ${isEditing ? 'cursor-pointer' : ''}`}
              onClick={handlePhotoClick}
            >
              {uploading ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <img 
                  src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>

          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button 
                  onClick={onSave}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95"
                >
                  <Check className="w-5 h-5" /> Save Changes
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200 transition-all active:scale-95"
                >
                  <X className="w-5 h-5" /> Cancel
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1.5 text-center md:text-left">
          <h1 className="text-3xl md:text-[2.25rem] font-black text-gray-900 leading-tight tracking-tight">{user.full_name}</h1>
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-5 text-sm text-gray-500 font-bold">
            <span className="flex items-center gap-2 text-gray-400">
              <Mail className="w-4 h-4" /> 
              <span className="text-gray-500">{user.email}</span>
            </span>
            <span className="flex items-center gap-2 text-gray-400">
              <Shield className="w-4 h-4" /> 
              <span className="text-gray-500">{user.is_admin ? 'Admin' : 'User'}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
