import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';
import LoanForm from '../components/LoanForm';
import loanService from '../services/loanService';
import { CheckCircle2 } from 'lucide-react';

const CreateLoan = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLoanSubmit = async (loanData) => {
    try {
      setLoading(true);
      await loanService.createLoan(loanData);
      addToast({ type: 'success', title: 'Request Created', message: 'Your loan request has been submitted successfully.' });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err) {
      addToast({ 
        type: 'error', 
        title: 'Submission Failed', 
        message: err.friendlyMessage || err.message || 'Unable to create your loan request.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto py-12 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center text-center space-y-6 p-8">
        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
          <CheckCircle2 size={32} />
        </div>
        <div>
          <h2>Request Submitted!</h2>
          <p className="text-sm text-gray-500 mt-1">
            Your loan request has been created. Redirecting you to the marketplace...
          </p>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-[#174E4F] hover:bg-[#1A2417] text-white font-semibold text-sm py-2 px-6 rounded-lg shadow-sm transition"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t('create_loan_request')}</h1>
        <p className="text-sm text-gray-600 mt-1">Get the funding you need from the community.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <LoanForm onSubmit={handleLoanSubmit} isLoading={loading} />
      </div>
    </div>
  );
};

export default CreateLoan;
