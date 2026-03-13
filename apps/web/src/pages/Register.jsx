import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserPlus, Loader2, ChevronDown } from 'lucide-react';

import { validateEmail, validatePassword, validateRequired } from '../utils/validation';

const Register = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'borrower',
    phoneNumber: '',
    income: '',
    occupation: '',
    assets: '',
    financialStability: 'medium'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!validateRequired(formData.name)) newErrors.name = 'Full name is required.';
    if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address.';
    if (!validatePassword(formData.password)) newErrors.password = 'Password must be at least 6 characters.';
    if (!validateRequired(formData.phoneNumber)) newErrors.phoneNumber = 'Phone number is required.';
    if (formData.role === 'borrower') {
      if (!formData.income || Number(formData.income) <= 0) newErrors.income = 'Valid income is required.';
      if (!validateRequired(formData.occupation)) newErrors.occupation = 'Occupation is required.';
    }
    if (formData.role === 'lender') {
      if (!formData.assets || Number(formData.assets) <= 0) newErrors.assets = 'Valid assets value is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(formData);
      addToast({ type: 'success', title: 'Account Created!', message: 'Welcome to Lend Sphere.' });
      navigate('/select-role');
    } catch (err) {
      addToast({ 
        type: 'error', 
        title: 'Registration Failed', 
        message: err.friendlyMessage || 'Please try again with different details.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-8 py-10">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-3 text-[#174E4F] border border-teal-100">
           <UserPlus size={22} />
        </div>
        <h1>{t('register')}</h1>
        <p className="text-sm text-gray-500">{t('create_account_message')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              className={`w-full border rounded-lg px-3 py-2 text-sm font-medium outline-none transition-all ${
                errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:ring-2 focus:ring-teal-200 focus:border-[#174E4F]'
              }`}
            />
            {errors.name && <span className="text-red-500 text-[10px] font-semibold ml-1">{errors.name}</span>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">I want to...</label>
            <div className="relative">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-200 focus:border-[#174E4F] bg-white appearance-none"
              >
                <option value="borrower">Borrow Money</option>
                <option value="lender">Invest / Lend Money</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
              className={`w-full border rounded-lg px-3 py-2 text-sm font-medium outline-none transition-all ${
                errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:ring-2 focus:ring-teal-200 focus:border-[#174E4F]'
              }`}
            />
            {errors.email && <span className="text-red-500 text-[10px] font-semibold ml-1">{errors.email}</span>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="9876543210"
              required
              className={`w-full border rounded-lg px-3 py-2 text-sm font-medium outline-none transition-all ${
                errors.phoneNumber ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:ring-2 focus:ring-teal-200 focus:border-[#174E4F]'
              }`}
            />
            {errors.phoneNumber && <span className="text-red-500 text-[10px] font-semibold ml-1">{errors.phoneNumber}</span>}
          </div>

          <div className="md:col-span-2 pt-2 border-t border-gray-100 mt-2 mb-2">
            <p className="text-sm font-semibold text-[#174E4F]">Financial Profile <span className="text-xs text-gray-400 font-normal">(Used for Loan Score Calculation)</span></p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Monthly Income (₹)</label>
            <input
              type="number"
              name="income"
              value={formData.income}
              onChange={handleChange}
              placeholder="50000"
              required={formData.role === 'borrower'}
              className={`w-full border rounded-lg px-3 py-2 text-sm font-medium outline-none transition-all ${
                errors.income ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:ring-2 focus:ring-teal-200 focus:border-[#174E4F]'
              }`}
            />
            {errors.income && <span className="text-red-500 text-[10px] font-semibold ml-1">{errors.income}</span>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Total Assets (₹)</label>
            <input
              type="number"
              name="assets"
              value={formData.assets}
              onChange={handleChange}
              placeholder="1000000"
              required={formData.role === 'lender'}
              className={`w-full border rounded-lg px-3 py-2 text-sm font-medium outline-none transition-all ${
                errors.assets ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:ring-2 focus:ring-teal-200 focus:border-[#174E4F]'
              }`}
            />
            {errors.assets && <span className="text-red-500 text-[10px] font-semibold ml-1">{errors.assets}</span>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Occupation</label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              placeholder="Software Engineer"
              required={formData.role === 'borrower'}
              className={`w-full border rounded-lg px-3 py-2 text-sm font-medium outline-none transition-all ${
                errors.occupation ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:ring-2 focus:ring-teal-200 focus:border-[#174E4F]'
              }`}
            />
            {errors.occupation && <span className="text-red-500 text-[10px] font-semibold ml-1">{errors.occupation}</span>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Financial Stability</label>
            <div className="relative">
              <select
                name="financialStability"
                value={formData.financialStability}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-200 focus:border-[#174E4F] bg-white appearance-none"
              >
                <option value="high">High - Stable Income, Few Debts</option>
                <option value="medium">Medium - Stable Income, Some Debts</option>
                <option value="low">Low - Variable Income, High Debts</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Secure Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className={`w-full border rounded-lg px-3 py-2 text-sm font-medium outline-none transition-all ${
                errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:ring-2 focus:ring-teal-200 focus:border-[#174E4F]'
              }`}
            />
            {errors.password && <span className="text-red-500 text-[10px] font-semibold ml-1">{errors.password}</span>}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#174E4F] hover:bg-[#0f3636] text-white font-semibold text-sm py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mt-4"
        >
          {loading && <Loader2 className="animate-spin w-4 h-4" />}
          {t('create_account_button')}
        </button>
      </form>

      <p className="text-center text-sm font-medium text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="text-[#174E4F] hover:underline">
          Sign in here
        </Link>
      </p>
    </div>
  );
};

export default Register;
