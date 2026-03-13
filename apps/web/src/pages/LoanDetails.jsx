import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import LoanTimeline from '../components/LoanTimeline';
import OfferCard from '../components/OfferCard';
import loanService from '../services/loanService';
import offerService from '../services/offerService';
import { Loader2, AlertCircle, IndianRupee, Clock, History, ShoppingBag } from 'lucide-react';

import { validatePositiveNumber, validatePercentage } from '../utils/validation';

const LoanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [loan, setLoan] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Offer Form State
  const [offerData, setOfferData] = useState({ amount: '', interestRate: '' });
  const [offerErrors, setOfferErrors] = useState({});
  const [submittingOffer, setSubmittingOffer] = useState(false);

  useEffect(() => {
    const fetchLoanFullDetails = async () => {
      try {
        setLoading(true);
        const [loanRes, offersRes] = await Promise.all([
          loanService.getLoanById(id),
          offerService.getLoanOffers(id)
        ]);
        setLoan(loanRes.data ?? loanRes);
        setOffers(offersRes.data ?? offersRes ?? []);
      } catch (err) {
        console.error('Failed to fetch loan details:', err.friendlyMessage || err.message);
        setError(err.friendlyMessage || 'Could not find the requested loan.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchLoanFullDetails();
  }, [id]);

  const handleOfferChange = (e) => {
    const { name, value } = e.target;
    setOfferData(prev => ({ ...prev, [name]: value }));
    if (offerErrors[name]) setOfferErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateOffer = () => {
    const newErrors = {};
    if (!validatePercentage(offerData.interestRate)) newErrors.interestRate = 'Rate must be between 0 and 100%.';
    setOfferErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!validateOffer()) return;

    try {
      setSubmittingOffer(true);
      await offerService.submitOffer({
        loanId: id,
        interestRate: Number(offerData.interestRate) / 100,
        repaymentPeriod: loan?.repaymentPeriod || 12
      });
      addToast({ type: 'success', title: 'Offer Sent', message: 'Your community offer has been submitted.' });
      setOfferData({ amount: '', interestRate: '' });
      // Fetch updated offers
      const offersRes = await offerService.getLoanOffers(id);
      setOffers(offersRes.data);
    } catch (err) {
      addToast({ 
        type: 'error', 
        title: 'Offer Failed', 
        message: err.friendlyMessage || 'Could not submit your offer.' 
      });
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    try {
      await offerService.acceptOffer(offerId);
      addToast({ type: 'success', title: 'Offer Accepted', message: 'The loan funding process has begun.' });
      window.location.reload(); // Refresh to show new status
    } catch (err) {
      addToast({ 
        type: 'error', 
        title: 'Action Failed', 
        message: err.friendlyMessage || 'Failed to accept this offer.' 
      });
    }
  };

  const handleOpenLoan = async () => {
    try {
      await loanService.openLoanForOffers(id);
      addToast({ type: 'success', title: 'Loan Opened', message: 'Your loan is now visible in the marketplace.' });
      window.location.reload();
    } catch (err) {
      addToast({ type: 'error', title: 'Action Failed', message: err.friendlyMessage || 'Failed to open loan.' });
    }
  };

  const handleFundLoan = async () => {
    try {
      await loanService.fundLoan(id);
      addToast({ type: 'success', title: 'Loan Funded', message: 'The loan has been marked as funded and is now active.' });
      window.location.reload();
    } catch (err) {
      addToast({ type: 'error', title: 'Action Failed', message: err.friendlyMessage || 'Failed to fund loan.' });
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={64} />
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="max-w-2xl mx-auto py-20 bg-white rounded-[3rem] shadow-xl border-2 border-slate-100 text-center space-y-8">
        <AlertCircle size={80} className="mx-auto text-red-500" />
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Loan Not Found</h1>
        <p className="text-2xl text-slate-500 font-medium">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="bg-[#174E4F] text-white font-black text-2xl py-6 px-12 rounded-2xl shadow-xl shadow-[#174E4F]/20 transition-all">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="inline-block border border-teal-200 text-[#174E4F] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1">
            {loan.status.replace(/_/g, ' ')}
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Loan Details</h1>
          <p className="text-sm text-gray-500 font-medium">Ref: #{loan._id.slice(-8)}</p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
             <div className="p-2 bg-teal-50 rounded-lg text-[#174E4F] border border-teal-100">
                <IndianRupee size={20} />
             </div>
             <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Amount</p>
                <p className="text-xl font-bold text-gray-900">₹{loan.amount?.toLocaleString()}</p>
             </div>
          </div>

          <div className="flex gap-2">
            {loan.status === 'pending' && user && loan.borrowerId && (String(user.id) === String(loan.borrowerId) || (loan.borrowerId?._id && String(user.id) === String(loan.borrowerId._id))) && (
              <button 
                onClick={handleOpenLoan}
                className="bg-[#174E4F] hover:bg-[#0f3636] text-white font-semibold text-sm py-2 px-6 rounded-lg shadow-sm transition-all"
              >
                Open for Offers
              </button>
            )}
            {loan.status === 'offer_selected' && user && loan.borrowerId && (String(user.id) === String(loan.borrowerId) || (loan.borrowerId?._id && String(user.id) === String(loan.borrowerId._id))) && (
              <button 
                onClick={handleFundLoan}
                className="bg-[#174E4F] hover:bg-[#0f3636] text-white font-semibold text-sm py-2 px-6 rounded-lg shadow-sm transition-all"
              >
                Confirm Funding
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-white p-6 border-b border-gray-100">
           <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Lifecycle Progress</h3>
           <LoanTimeline status={loan.status} />
        </div>
        
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                 <History size={12} /> Purpose
              </p>
              <p className="text-lg font-semibold text-gray-900">{loan.purpose}</p>
           </div>
           <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                 <Clock size={12} /> Duration
              </p>
              <p className="text-lg font-semibold text-gray-900">{loan.repaymentPeriod} Months</p>
           </div>
           <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-center text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Min. Score Req.</p>
              <p className="text-2xl font-bold text-gray-900">{loan.loanScoreRequired}</p>
           </div>
           {(loan.requestedInterestRate != null || loan.interestRate != null) && (
             <div className="space-y-1.5 md:col-span-2">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interest Rate</p>
               <p className="text-lg font-semibold text-gray-900">
                 {((loan.interestRate ?? loan.requestedInterestRate) < 1 
                   ? (loan.interestRate ?? loan.requestedInterestRate) * 100 
                   : (loan.interestRate ?? loan.requestedInterestRate)).toFixed(1)}%
               </p>
             </div>
           )}
        </div>

        {loan.borrowerId && typeof loan.borrowerId === 'object' && (
          <div className="p-6 md:p-8 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Borrower Risk Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-50 rounded-xl p-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Credit / Loan Score</p>
                <p className="text-lg font-semibold text-gray-900">{loan.borrowerId.creditScore ?? loan.borrowerId.loanScore ?? '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Income</p>
                <p className="text-lg font-semibold text-gray-900">₹{(loan.borrowerId.income || 0).toLocaleString()}/mo</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Occupation</p>
                <p className="text-lg font-semibold text-gray-900">{loan.borrowerId.occupation || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Employment Type</p>
                <p className="text-lg font-semibold text-gray-900">{loan.borrowerId.employmentType || '—'}</p>
              </div>
              {loan.collateralDescription && (
                <div className="md:col-span-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Collateral</p>
                  <p className="text-sm font-medium text-gray-700">{loan.collateralDescription}</p>
                </div>
              )}
              {loan.borrowerId.loanHistorySummary && (
                <div className="md:col-span-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Loan History</p>
                  <p className="text-sm font-medium text-gray-700">{loan.borrowerId.loanHistorySummary}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Offer Form for Lenders */}
      {loan.status === 'open_for_offers' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-teal-100 bg-teal-50/20">
           <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <ShoppingBag className="text-[#174E4F] w-5 h-5" /> Make a Community Offer
           </h3>
           <form onSubmit={handleSubmitOffer} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                 <label className="text-xs font-semibold text-gray-700">Loan Amount (from request)</label>
                 <div className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 bg-gray-50">
                   ₹{loan.amount?.toLocaleString()}
                 </div>
              </div>
              <div className="space-y-1.5">
                 <label className="text-xs font-semibold text-gray-700">Interest Rate (%)</label>
                 <input 
                    type="number"
                    step="0.1"
                    name="interestRate"
                    value={offerData.interestRate}
                    onChange={handleOfferChange}
                    placeholder="e.g. 8.5"
                    className={`w-full border rounded-lg px-3 py-2 text-sm font-medium outline-none transition-all ${
                      offerErrors.interestRate ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:ring-2 focus:ring-teal-500'
                    }`}
                 />
                 {offerErrors.interestRate && <p className="text-red-500 text-[10px] font-semibold">{offerErrors.interestRate}</p>}
              </div>
              <div className="md:col-span-2">
                 <button 
                  type="submit"
                  disabled={submittingOffer}
                  className="w-full bg-[#174E4F] hover:bg-[#0f3636] text-white font-semibold text-sm py-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                 >
                    {submittingOffer ? <Loader2 className="animate-spin w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                    Submit Offer
                 </button>
              </div>
           </form>
        </div>
      )}

      {/* Offers Section */}
      <div className="space-y-6">
         <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Community Offers</h2>
            <span className="bg-[#174E4F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{offers.length}</span>
         </div>

         {offers.length === 0 ? (
           <div className="bg-white p-12 rounded-xl border border-gray-200 border-dashed text-center">
             <p className="text-sm font-medium text-gray-400 italic">No offers received yet. Lenders will appear here shortly.</p>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offers.map(offer => (
                <OfferCard 
                  key={offer._id} 
                  offer={offer} 
                  isBorrower={user && (String(user.id) === String(loan.borrowerId) || (loan.borrowerId?._id && String(user.id) === String(loan.borrowerId._id)))}
                  onAccept={handleAcceptOffer}
                />
              ))}
           </div>
         )}
      </div>

      <div className="flex gap-4 pt-6">
         <button onClick={() => navigate(`/dashboard/chat?loanId=${id}`)} className="flex-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 font-semibold text-sm py-2.5 rounded-lg transition-all">
            Discussion Board
         </button>
         <button onClick={() => navigate('/dashboard/marketplace')} className="flex-1 bg-[#174E4F] hover:bg-[#0f3636] text-white font-semibold text-sm py-2.5 rounded-lg shadow-sm transition-all">
            Back to Marketplace
         </button>
      </div>
    </div>
  );
};

export default LoanDetails;
