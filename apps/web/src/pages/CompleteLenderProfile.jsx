import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import authService from '../services/authService';
import { Loader2, ArrowRight } from 'lucide-react';

const CompleteLenderProfile = () => {
  const { user, refreshUser, setActiveRole } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    investmentCapacity: '',
    riskPreference: 'moderate'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.investmentCapacity) {
      return addToast({ type: 'error', title: 'Invalid Input', message: 'Investment capacity is required.' });
    }

    setLoading(true);
    try {
      const updatedUser = await authService.submitOnboarding(user.id || user._id, {
        role: 'lender',
        investmentCapacity: Number(formData.investmentCapacity),
        riskPreference: formData.riskPreference
      });
      
      refreshUser();
      // Now that onboarding is complete, finish the role switch
      setActiveRole('lender');
      addToast({ type: 'success', title: 'Profile Complete', message: 'Welcome to the marketplace!' });
      navigate('/dashboard/marketplace');
    } catch (err) {
      addToast({ type: 'error', title: 'Update Failed', message: err.friendlyMessage || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Lender Onboarding</h1>
          <p className="text-gray-500">Just a couple quick questions to set up your marketplace experience.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Monthly Investment Capacity (₹)</label>
            <input
              type="number"
              value={formData.investmentCapacity}
              onChange={(e) => setFormData({...formData, investmentCapacity: e.target.value})}
              placeholder="e.g. 20000"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-200 focus:border-[#174E4F]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Risk Preference</label>
            <select
              value={formData.riskPreference}
              onChange={(e) => setFormData({...formData, riskPreference: e.target.value})}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-200 focus:border-[#174E4F] bg-white"
            >
              <option value="conservative">Conservative (Low Risk, Stable Returns)</option>
              <option value="moderate">Moderate (Balanced)</option>
              <option value="aggressive">Aggressive (High Risk, High Reward)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#174E4F] hover:bg-[#0f3636] text-white font-semibold text-sm py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            {loading && <Loader2 className="animate-spin w-4 h-4" />}
            Complete Profile & Continue <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteLenderProfile;
