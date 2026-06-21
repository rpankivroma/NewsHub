import React, { useState, useEffect } from 'react';
import { User, Category } from '../types';
import { userService } from '../services/userService';
import { newsService } from '../services/newsService';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileTabs from '../components/Profile/ProfileTabs';
import AboutTab from '../components/Profile/AboutTab';
import SavedTab from '../components/Profile/SavedTab';
import PersonalizedTab from '../components/Profile/PersonalizedTab';
import SubmissionsTab from '../components/Profile/SubmissionsTab';
import ForgotPasswordModal from '../components/Profile/ForgotPasswordModal';

interface ProfileProps {
  user: User | null;
  onUserUpdate: (user: User) => void;
  onArticleClick: (id: number) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUserUpdate, onArticleClick }) => {
  const [activeTab, setActiveTab] = useState('about');
  const [isEditing, setIsEditing] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  
  // Edit states
  const [editedBio, setEditedBio] = useState('');
  const [editedInterests, setEditedInterests] = useState<string[]>([]);
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    if (user) {
      setEditedBio(user.bio || '');
      setNewsletterSubscribed(user.newsletter_subscribed || false);
      
      let interests: string[] = [];
      if (user.interests) {
        try {
          interests = typeof user.interests === 'string' ? JSON.parse(user.interests) : user.interests;
        } catch {
          interests = (user.interests as string).split(',').filter(Boolean);
        }
      }
      setEditedInterests(interests);

      let tags: string[] = [];
      if (user.tags) {
        try {
          tags = typeof user.tags === 'string' ? JSON.parse(user.tags) : user.tags;
        } catch {
          tags = (user.tags as string).split(',').filter(Boolean);
        }
      }
      setEditedTags(tags);
    }
  }, [user, isEditing]);

  useEffect(() => {
    newsService.getCategories().then(setCategories).catch(console.error);
  }, []);

  if (!user) {
    return <div className="max-w-6xl mx-auto px-4 py-24 text-center">Please login to view your profile.</div>;
  }

  const handleSave = async () => {
    try {
      const updatedUser = await userService.updateMe({
        bio: editedBio,
        interests: JSON.stringify(editedInterests),
        tags: JSON.stringify(editedTags),
        newsletter_subscribed: newsletterSubscribed
      });
      onUserUpdate(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    }
  };

  const handlePhotoUpdate = (url: string) => {
    onUserUpdate({ ...user, avatar_url: url });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <ProfileHeader 
        user={user} 
        isEditing={isEditing} 
        setIsEditing={setIsEditing} 
        onSave={handleSave}
        onPhotoUpdate={handlePhotoUpdate}
      />

      <ProfileTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        savedCount={0} 
        submissionsCount={0} 
      />

      <div className="bg-white rounded-[1rem] border border-gray-100 shadow-sm p-6 md:p-12 mb-8 md:mb-12 min-h-[400px]">
        {activeTab === 'about' && (
          <AboutTab 
            user={user}
            isEditing={isEditing}
            categories={categories}
            editedBio={editedBio}
            setEditedBio={setEditedBio}
            editedInterests={editedInterests}
            setEditedInterests={setEditedInterests}
            editedTags={editedTags}
            setEditedTags={setEditedTags}
            newsletterSubscribed={newsletterSubscribed}
            setNewsletterSubscribed={setNewsletterSubscribed}
            onForgotPassword={() => setIsForgotModalOpen(true)}
          />
        )}

        {activeTab === 'saved' && <SavedTab onArticleClick={onArticleClick} />}

        {activeTab === 'personalized' && <PersonalizedTab onArticleClick={onArticleClick} />}
        
        {activeTab === 'submissions' && <SubmissionsTab user={user} />}
      </div>

      <ForgotPasswordModal 
        isOpen={isForgotModalOpen} 
        onClose={() => setIsForgotModalOpen(false)} 
        email={user.email}
      />
    </div>
  );
};

export default Profile;
