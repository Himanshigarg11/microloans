import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { validatePositiveNumber, validateRequired } from '../utils/validation';

const LoanForm = ({ onSubmit, isLoading }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    repaymentPeriod: '12',
    collateralDescription: '',
    loanScoreRequired: 0,
    requestedInterestRate: ''
  });
  const [errors, setErrors] = useState({});

  const validateStep = (s) => {
    const newErrors = {};
    if (s === 1) {
      if (!validatePositiveNumber(formData.amount)) newErrors.amount = 'Please enter a positive loan amount.';
      if (!validatePositiveNumber(formData.repaymentPeriod)) newErrors.repaymentPeriod = 'Repayment period must be positive.';
      if (formData.requestedInterestRate !== '' && (!validatePositiveNumber(formData.requestedInterestRate) || Number(formData.requestedInterestRate) > 100)) newErrors.requestedInterestRate = 'Interest rate must be 0-100%.';
    } else if (s === 2) {
      if (!validateRequired(formData.purpose)) newErrors.purpose = 'Please provide a purpose for the loan.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 3));
    }
  };
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        ...formData,
        amount: Number(formData.amount),
        repaymentPeriod: Number(formData.repaymentPeriod),
        loanScoreRequired: Number(formData.loanScoreRequired),
        requestedInterestRate: formData.requestedInterestRate ? Number(formData.requestedInterestRate) / 100 : null
      });
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between items-center mb-12">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex flex-col items-center flex-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
            step === s 
              ? 'bg-[#174E4F] border-[#174E4F] text-white shadow-sm' 
              : step > s 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'bg-white border-gray-200 text-gray-400'
          }`}>
            {step > s ? <CheckCircle size={20} /> : s}
          </div>
          <span className={`mt-2 text-[10px] font-bold uppercase tracking-widest ${step === s ? 'text-[#174E4F]' : 'text-gray-400'}`}>
            {s === 1 ? 'Amount' : s === 2 ? 'Details' : 'Review'}
          </span>
        </div>
      ))}
      {/* Connector lines (simplified) */}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {renderStepIndicator()}

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* Step 1: Amount & Duration */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col">
              <label htmlFor="amount" className="text-lg font-semibold text-gray-700 mb-2">How much do you need?</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-medium text-gray-400">₹</span>
                <input 
                  type="number" 
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="e.g. 50,000"
                  className={`w-full bg-white border border-gray-200 rounded-lg p-3 pl-10 focus:ring-2 focus:ring-[#174E4F]/10 outline-none transition-all ${
                    errors.amount ? 'border-red-400 bg-red-50' : 'focus:border-[#174E4F]'
                  }`}
                />
              </div>
              {errors.amount && <span className="text-red-500 text-sm mt-1 ml-1">{errors.amount}</span>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="requestedInterestRate" className="text-lg font-semibold text-gray-700 mb-2">Expected interest rate (%)</label>
              <input 
                type="number"
                name="requestedInterestRate"
                value={formData.requestedInterestRate}
                onChange={handleChange}
                placeholder="e.g. 8.5"
                step="0.1"
                min="0"
                max="100"
                className={`w-full bg-white border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-[#174E4F]/10 outline-none transition-all ${
                  errors.requestedInterestRate ? 'border-red-400 bg-red-50' : 'focus:border-[#174E4F]'
                }`}
              />
              {errors.requestedInterestRate && <span className="text-red-500 text-sm mt-1 ml-1">{errors.requestedInterestRate}</span>}
            </div>
            <div className="flex flex-col">
              <label htmlFor="repaymentPeriod" className="text-lg font-semibold text-gray-700 mb-2">For how many months?</label>
              <select 
                name="repaymentPeriod"
                value={formData.repaymentPeriod}
                onChange={handleChange}
                className={`w-full bg-white border border-gray-200 rounded-lg p-3 appearance-none focus:ring-2 focus:ring-[#174E4F]/10 outline-none transition-all ${
                  errors.repaymentPeriod ? 'border-red-400 bg-red-50' : 'focus:border-[#174E4F]'
                }`}
              >
                {[6, 12, 18, 24, 36, 48].map(m => (
                  <option key={m} value={m}>{m} Months</option>
                ))}
              </select>
              {errors.repaymentPeriod && <span className="text-red-500 text-sm mt-1 ml-1">{errors.repaymentPeriod}</span>}
            </div>

            <button 
              type="button" 
              onClick={nextStep}
              disabled={!formData.amount}
              className="w-full bg-[#174E4F] hover:bg-[#0f3636] text-white font-semibold text-sm py-3 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              Continue <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* Step 2: Details & Purpose */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col">
              <label htmlFor="purpose" className="text-lg font-semibold text-gray-700 mb-2">What is the purpose?</label>
              <input 
                  type="text" 
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="e.g. Home Improvements"
                  className={`w-full bg-white border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-[#174E4F]/10 outline-none transition-all ${
                    errors.purpose ? 'border-red-400 bg-red-50' : 'focus:border-[#174E4F]'
                  }`}
                />
              {errors.purpose && <span className="text-red-500 text-sm mt-1 ml-1">{errors.purpose}</span>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="collateralDescription" className="text-lg font-semibold text-gray-700 mb-2">Any collateral? (Optional)</label>
              <textarea 
                  name="collateralDescription"
                  rows="3"
                  value={formData.collateralDescription}
                  onChange={handleChange}
                  placeholder="Describe any assets you can pledge..."
                  className="w-full bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-lg p-3 focus:border-[#174E4F] focus:ring-2 focus:ring-[#174E4F]/10 outline-none transition-all resize-none"
                ></textarea>
            </div>

            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={prevStep}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-3 rounded-lg transition-all"
              >
                Back
              </button>
                <button 
                type="button" 
                onClick={nextStep}
                disabled={!formData.purpose}
                className="flex-[2] bg-[#174E4F] hover:bg-[#0f3636] text-white font-semibold text-sm py-3 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                Almost Done <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-slate-50 p-8 rounded-3xl border-4 border-dashed border-slate-200 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 font-bold uppercase tracking-widest">Amount</span>
                <span className="text-3xl font-black text-[#174E4F]">₹{Number(formData.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 font-bold uppercase tracking-widest">Duration</span>
                <span className="text-2xl font-bold text-slate-900">{formData.repaymentPeriod} Months</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <span className="text-slate-500 font-bold uppercase tracking-widest">Purpose</span>
                <span className="text-2xl font-bold text-slate-900">{formData.purpose}</span>
              </div>
              {formData.requestedInterestRate && (
                <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">Interest Rate</span>
                  <span className="text-2xl font-bold text-slate-900">{formData.requestedInterestRate}%</span>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={prevStep}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm py-3 rounded-lg transition-all"
              >
                Change
              </button>
              <button 
                type="submit" 
                disabled={isLoading}
                className={`flex-[2] font-semibold text-sm py-3 rounded-lg shadow-sm transition-all active:scale-[0.98] ${
                  isLoading 
                   ? 'bg-gray-200 text-gray-400' 
                   : 'bg-[#174E4F] hover:bg-[#0f3636] text-white'
                }`}
              >
                {isLoading ? 'Sending...' : 'Confirm & Request Loan'}
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
};

export default LoanForm;
