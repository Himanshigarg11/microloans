import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import authService from '../services/authService';
import { Loader2, ArrowRight } from 'lucide-react';

const CompleteBorrowerProfile = () => {
  const { user, refreshUser, setActiveRole } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    income: '',
    loanPurposeHistory: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.income) {
      return addToast({ type: 'error', title: 'Invalid Input', message: 'Monthly income is required.' });
    }

    setLoading(true);
    try {
      const updatedUser = await authService.submitOnboarding(user.id || user._id, {
        role: 'borrower',
        income: Number(formData.income),
        loanPurposeHistory: formData.loanPurposeHistory
      });
      
      refreshUser();
      // Now that onboarding is complete, finish the role switch
      setActiveRole('borrower');
      addToast({ type: 'success', title: 'Profile Complete', message: 'You are now ready to borrow!' });
      navigate('/dashboard');
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Borrower Onboarding</h1>
          <p className="text-gray-500">We need a few more details to finalize your loan score before you can borrow.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Monthly Income (₹)</label>
            <input
              type="number"
              value={formData.income}
              onChange={(e) => setFormData({...formData, income: e.target.value})}
              placeholder="e.g. 50000"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-200 focus:border-[#174E4F]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Why do you usually need loans?</label>
            <textarea
              value={formData.loanPurposeHistory}
              onChange={(e) => setFormData({...formData, loanPurposeHistory: e.target.value})}
              placeholder="e.g. Business expansion, medical emergency, education..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-200 focus:border-[#174E4F] min-h-[100px]"
            />
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

export default CompleteBorrowerProfile;
