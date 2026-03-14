import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoanCard from '../components/LoanCard';
import Pagination from '../components/Pagination';
import MarketplaceFilters from '../components/MarketplaceFilters';
import loanService from '../services/loanService';
import { useToast } from '../context/ToastContext';
import { Loader2, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Marketplace = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    duration: '',
    minScore: '',
    maxInterest: ''
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });

  const fetchLoans = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (filters.minAmount) params.minAmount = filters.minAmount;
      if (filters.maxAmount) params.maxAmount = filters.maxAmount;
      if (filters.duration) params.duration = filters.duration;
      if (filters.minScore) params.minScore = filters.minScore;
      if (filters.maxInterest) params.maxInterest = filters.maxInterest;

      const response = await loanService.getLoans(params);
      const list = response?.data ?? response ?? [];

      const filtered = Array.isArray(list)
        ? list.filter((loan) => {
            if (!user) return true;
            const borrowerId =
              typeof loan.borrowerId === 'object' ? loan.borrowerId._id : loan.borrowerId;
            return !borrowerId || String(borrowerId) !== String(user.id);
          })
        : [];

      setLoans(filtered);
      setPagination(prev => ({ ...prev, totalPages: response?.totalPages ?? 1 }));
    } catch (err) {
      console.error('Failed to fetch loans:', err);
      addToast({ 
        type: 'error', 
        title: 'Search Error', 
        message: err.friendlyMessage || 'Unable to load the loan marketplace.' 
      });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t('marketplace')}</h1>
        <p className="text-sm text-gray-600 mt-1">Discover peer-to-peer lending opportunities.</p>
        </div>
      </div>

      <MarketplaceFilters onFilterChange={handleFilterChange} />
      
      {loading ? (
        <div className="h-[40vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#174E4F]" size={32} />
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center shadow-sm">
           <Filter className="mx-auto w-12 h-12 text-gray-300 mb-4" />
           <p className="text-gray-400 font-medium tracking-tight">No loans found matching your filters.</p>
           <button 
             onClick={() => handleFilterChange({})}
             className="mt-4 text-[#174E4F] font-semibold text-sm hover:underline"
           >
             Clear All Filters
           </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loans.map((loan) => (
              <LoanCard key={loan._id} loan={loan} onAction={() => navigate(`/dashboard/marketplace/${loan._id}`)} />
            ))}
          </div>

          <Pagination 
            currentPage={pagination.page} 
            totalPages={pagination.totalPages} 
            onPageChange={handlePageChange} 
          />
        </>
      )}
    </div>
  );
};

export default Marketplace;
