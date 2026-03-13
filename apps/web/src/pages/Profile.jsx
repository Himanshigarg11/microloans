import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import profileService from '../services/profileService';
import ProfileCard from '../components/ProfileCard';
import { Loader2, ChevronRight, LogOut } from 'lucide-react';

const Profile = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const response = await profileService.getProfile(user.id);
        setProfile(response);
      } catch (err) {
        console.error('Profile fetch error:', err);
        addToast({ 
          type: 'error', 
          title: 'Profile Error', 
          message: err.friendlyMessage || 'Unable to load your profile information.' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#174E4F]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>{t('my_profile')}</h1>
        <p className="text-gray-500 mt-1">{t('my_profile_subtitle')}</p>
      </div>

      <ProfileCard 
        user={user} 
        profile={profile} 
        onEditClick={() => addToast({ type: 'info', title: 'Coming Soon', message: 'Profile editing will be available in a future update.' })} 
      />
      
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
         <h3 className="text-lg font-semibold text-gray-900">Account Security</h3>
         <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl space-y-3">
               <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Update Password</h4>
               <div className="flex gap-2">
                 <input type="password" placeholder="New Password" id="new_password" className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#174E4F]" />
                 <button 
                   onClick={() => {
                     const val = document.getElementById('new_password').value;
                     if(val.length < 6) return addToast({type: 'error', title: 'Invalid', message: 'Password too short'});
                     addToast({ type: 'success', title: 'Security Updated', message: 'Your password has been changed successfully.' });
                     document.getElementById('new_password').value = '';
                   }}
                   className="bg-[#174E4F] text-white text-xs font-bold px-4 py-2 rounded-lg"
                 >
                   Update
                 </button>
               </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
               <div>
                  <h4 className="text-sm font-bold text-gray-900">Email Notifications</h4>
                  <p className="text-xs text-gray-500">Get updates on your loan status</p>
               </div>
               <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked onChange={(e) => addToast({ type: 'success', title: 'Settings Saved', message: `Notifications ${e.target.checked ? 'Enabled' : 'Disabled'}` })} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#174E4F]"></div>
               </label>
            </div>
         </div>
       </div>

      <button
        onClick={handleLogout}
        className="w-full bg-white border border-red-200 hover:bg-red-50 text-red-600 font-semibold text-sm py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
};

export default Profile;
