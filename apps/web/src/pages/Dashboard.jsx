import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ScoreMeter from '../components/ScoreMeter';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import profileService from '../services/profileService';
import loanService from '../services/loanService';
import offerService from '../services/offerService';
import { Loader2, PlusCircle, FileText, ShoppingBag, TrendingUp, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, activeRole } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loans, setLoans] = useState([]);
  const [investmentCount, setInvestmentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const profilePromise = profileService.getProfile(user.id);
        const loansPromise = loanService.getLoans({ borrowerId: user.id });
        
        const promises = [profilePromise, loansPromise];
        
        // For lenders, also fetch their offers count
        if (activeRole === 'lender') {
          promises.push(offerService.getMyOffers());
        }

        const results = await Promise.all(promises);
        setProfile(results[0]);
        setLoans(results[1]?.data ?? results[1] ?? []);
        
        if (activeRole === 'lender' && results[2]) {
          setInvestmentCount((results[2]?.data ?? results[2] ?? []).length);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        addToast({ 
          type: 'error', 
          title: 'Dashboard Error', 
          message: err.friendlyMessage || 'Unable to load your dashboard data.' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, activeRole]);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#174E4F]" size={32} />
      </div>
    );
  }

  const activeLoans = loans.filter(l => !['completed', 'rejected', 'expired'].includes(l.status));
  const completedLoans = loans.filter(l => l.status === 'completed');
  const isBorrower = activeRole === 'borrower';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t('dashboard')}</h1>
        <p className="text-sm text-gray-600 mt-1">
          Welcome back, {user?.name || 'User'}! 
          <span className="ml-1 text-[#174E4F] font-medium">
            ({isBorrower ? 'Borrower' : 'Lender'} Mode)
          </span>
        </p>
      </div>
      
      {/* Borrower Dashboard */}
      {isBorrower && (
        <>
          <ScoreMeter currentScore={profile?.loanScore || 0} scoreUsed={profile?.scoreUsed || 0} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('active_loans')}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{activeLoans.length}</p>
              </div>
              <p className="mt-4 text-xs text-gray-400 italic">
                {activeLoans.length > 0 ? 'View details below for next repayment' : 'No active loans at the moment'}
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t('completed_loans')}</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{completedLoans.length}</p>
              </div>
              <button onClick={() => navigate('/dashboard/repayments')} className="mt-4 w-full border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold text-sm py-2 rounded-lg transition-all">
                {t('view_history')}
              </button>
            </div>
          </div>

          {/* Borrower Loans List */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Your Recent Loans</h3>
              <button onClick={() => navigate('/dashboard/repayments')} className="text-[#174E4F] text-xs font-bold hover:underline">{t('view_all')}</button>
            </div>
            <div className="divide-y divide-gray-100">
              {loans.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-sm text-gray-400 italic font-medium">You haven't requested any loans yet.</p>
                </div>
              ) : (
                loans.slice(0, 5).map(loan => (
                  <div key={loan._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => navigate((loan.status === 'funded' || loan.status === 'repayment') ? '/dashboard/repayments' : `/dashboard/marketplace/${loan._id}`)}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${loan.status === 'funded' ? 'bg-green-500' : loan.status === 'open_for_offers' ? 'bg-teal-500' : 'bg-amber-500'}`}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{loan.purpose}</p>
                        <p className="text-xs text-gray-500">₹{loan.amount?.toLocaleString()} • {loan.repaymentPeriod} months</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                        loan.status === 'funded' ? 'bg-green-50 border-green-200 text-green-700' :
                        loan.status === 'open_for_offers' ? 'bg-teal-50 border-teal-200 text-teal-700' :
                        'bg-amber-50 border-amber-200 text-amber-700'
                      }`}>
                        {loan.status}
                      </span>
                      <ArrowRight size={14} className="text-gray-300" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Lender Dashboard */}
      {!isBorrower && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Active Investments</h3>
              <p className="text-3xl font-bold text-[#174E4F]">{investmentCount}</p>
              <p className="text-xs text-gray-400 mt-2">Total offers submitted</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Available Loans</h3>
              <p className="text-3xl font-bold text-gray-900">{loans.length}</p>
              <p className="text-xs text-gray-400 mt-2">In the marketplace</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Loan Score</h3>
              <p className="text-3xl font-bold text-gray-900">{profile?.loanScore || 0}</p>
              <p className="text-xs text-gray-400 mt-2">Your credibility rating</p>
            </div>
          </div>

          {/* Lender Offers List */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Your Recent Investments</h3>
              <button onClick={() => navigate('/dashboard/investments')} className="text-[#174E4F] text-xs font-bold hover:underline">View All</button>
            </div>
            <div className="divide-y divide-gray-100">
              {investmentCount === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-sm text-gray-400 italic font-medium">You haven't funded any loans yet.</p>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-500">Visit <strong>My Investments</strong> to track your {investmentCount} active offers.</p>
                  <button onClick={() => navigate('/dashboard/investments')} className="mt-4 bg-teal-50 text-[#174E4F] font-bold text-xs py-2 px-6 rounded-lg border border-teal-100 hover:bg-teal-100 transition-all">Go to My Investments</button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-gray-400 italic">Activity & Notifications will appear here</p>
      </div>
    </div>
  );
};

export default Dashboard;
