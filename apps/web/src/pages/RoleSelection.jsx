import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HandCoins, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RoleSelection = () => {
  const { t } = useTranslation();
  const { setActiveRole, user } = useAuth();
  const navigate = useNavigate();

  const handleSelect = async (role) => {
    await setActiveRole(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">{t('role_selection_title')}</h1>
          <p className="text-gray-500 text-lg">{t('role_selection_subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Borrower Option */}
          <button
            onClick={() => handleSelect('borrower')}
            className="group bg-white border-2 border-transparent hover:border-[#174E4F] rounded-[2rem] p-10 text-left transition-all hover:shadow-2xl hover:shadow-[#174E4F]/10 space-y-8"
          >
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <HandCoins className="w-8 h-8 text-[#174E4F]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">{t('borrow_money')}</h3>
              <p className="text-gray-500 leading-relaxed">
                {t('borrow_description')}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[#174E4F] font-bold">
              {t('access_borrower_dashboard')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Lender Option */}
          <button
            onClick={() => handleSelect('lender')}
            className="group bg-[#174E4F] border-2 border-transparent hover:border-teal-300 rounded-[2rem] p-10 text-left transition-all hover:shadow-2xl hover:shadow-black/20 space-y-8"
          >
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform text-white">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div className="space-y-2 text-white">
              <h3 className="text-2xl font-bold">{t('lend_money')}</h3>
              <p className="text-white/70 leading-relaxed">
                {t('lend_description')}
              </p>
            </div>
            <div className="flex items-center gap-2 text-teal-400 font-bold">
              {t('access_lender_marketplace')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            {t('switch_modes_later')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
