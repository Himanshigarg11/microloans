import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import repaymentService from '../services/repaymentService';
import loanService from '../services/loanService';
import { Loader2, IndianRupee, Calendar, CheckCircle2 } from 'lucide-react';
import { validatePositiveNumber } from '../utils/validation';

const Repayments = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [repayments, setRepayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [amountPaid, setAmountPaid] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    const fetchLoans = async () => {
      if (!user) return;
      try {
        const [fundedRes, repaymentRes] = await Promise.all([
          loanService.getLoans({ status: 'funded', borrowerId: user.id }),
          loanService.getLoans({ status: 'repayment', borrowerId: user.id })
        ]);
        const funded = fundedRes?.data ?? fundedRes ?? [];
        const repayment = repaymentRes?.data ?? repaymentRes ?? [];
        const allLoans = [...(Array.isArray(funded) ? funded : []), ...(Array.isArray(repayment) ? repayment : [])];
        setLoans(allLoans);
        if (allLoans.length > 0) setSelectedLoanId(allLoans[0]._id);
      } catch (err) {
        console.error('Failed to fetch loans for repayment:', err);
      }
    };
    fetchLoans();
  }, [user]);

  useEffect(() => {
    const fetchRepayments = async () => {
      if (!selectedLoanId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await repaymentService.getRepaymentHistory(selectedLoanId);
        setRepayments(response?.data ?? response ?? []);
      } catch (err) {
        console.error('Failed to fetch repayments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRepayments();
  }, [selectedLoanId]);

  const handleRepaymentSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!validatePositiveNumber(amountPaid)) {
      setFormError('Please enter a positive amount.');
      return;
    }

    try {
      setSubmitting(true);
      await repaymentService.recordRepayment({
        loanId: selectedLoanId,
        amountPaid: Number(amountPaid),
        paymentDate: new Date().toISOString()
        // borrowerId / calculation now handled/verified on backend
      });
      addToast({ type: 'success', title: 'Payment Recorded', message: 'Your repayment has been successfully processed.' });
      setShowForm(false);
      setAmountPaid('');
      window.location.reload();
    } catch (err) {
      setFormError(err.friendlyMessage || 'Failed to record repayment.');
      addToast({ 
        type: 'error', 
        title: 'Payment Failed', 
        message: err.friendlyMessage || 'An error occurred while processing your payment.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t('repayments')}</h1>
        <p className="text-sm text-gray-600 mt-1">{t('repayments_subtitle')}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">{t('select_loan')}</label>
        <select 
          value={selectedLoanId} 
          onChange={(e) => setSelectedLoanId(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#174E4F]/10 focus:border-[#174E4F] transition-all bg-white"
        >
          {loans.length === 0 ? (
            <option value="">{t('no_active_loans')}</option>
          ) : (
            loans.map(loan => (
              <option key={loan._id} value={loan._id}>
                ₹{loan.amount.toLocaleString()} - {loan.purpose} (#{loan._id.slice(-6)})
              </option>
            ))
          )}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 md:p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
             <h3 className="text-lg font-semibold text-gray-900">{t('payment_history')}</h3>
              {!showForm && (
                <button 
                  onClick={() => setShowForm(true)}
                  className="bg-[#174E4F] hover:bg-[#0f3636] text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm transition-all"
                >
                  {t('make_payment')}
                </button>
              )}
          </div>

          {showForm && (
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-8">
               <h4 className="text-sm font-bold text-gray-900 mb-4">{t('new_repayment')}</h4>
                <form onSubmit={handleRepaymentSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t('amount_rupee')}</label>
                     <input 
                        type="number"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        placeholder="e.g. 5,000"
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-all ${
                          formError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:ring-2 focus:ring-[#174E4F]/10 focus:border-[#174E4F]'
                        }`}
                     />
                     {formError && <p className="text-red-500 text-[10px] font-semibold">{formError}</p>}
                  </div>
                  <div className="flex gap-3 pt-2">
                     <button 
                       type="button" 
                       onClick={() => setShowForm(false)}
                       className="flex-1 bg-white border border-gray-200 text-gray-600 font-semibold text-xs py-2 rounded-lg hover:bg-gray-100 transition-all"
                     >
                       {t('cancel')}
                     </button>
                      <button 
                        type="submit"
                        disabled={submitting}
                        className="flex-[2] bg-[#174E4F] hover:bg-[#0f3636] text-white font-semibold text-sm py-2 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        {submitting ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        {t('record_payment')}
                      </button>
                  </div>
               </form>
            </div>
          )}

          {loading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="animate-spin text-[#174E4F]" size={32} />
            </div>
          ) : repayments.length === 0 ? (
            <div className="py-12 text-center space-y-4">
               <Calendar size={48} className="mx-auto text-gray-200" />
               <p className="text-sm font-medium text-gray-400">{t('no_repayment_records')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {repayments.map((rp, idx) => (
                <div key={rp._id || idx} className="bg-gray-50/50 p-4 rounded-lg border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 transition-all hover:bg-white hover:border-green-100">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</p>
                      <p className="text-sm font-semibold text-gray-900">{new Date(rp.paymentDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between sm:justify-end gap-8 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount Paid</p>
                      <p className="text-sm font-bold text-green-600">₹{rp.amountPaid?.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Balance</p>
                      <p className="text-sm font-bold text-gray-900">₹{rp.remainingBalance?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Repayments;
