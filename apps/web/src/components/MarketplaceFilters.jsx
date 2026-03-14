import React, { useState } from 'react';
import { Filter, RotateCcw, ChevronDown } from 'lucide-react';

const MarketplaceFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    duration: '',
    minScore: '',
    maxInterest: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
  };

  const handleApply = () => {
    if (onFilterChange) {
      onFilterChange({
        minAmount: filters.minAmount ? Number(filters.minAmount) : '',
        maxAmount: filters.maxAmount ? Number(filters.maxAmount) : '',
        duration: filters.duration ? Number(filters.duration) : '',
        minScore: filters.minScore ? Number(filters.minScore) : '',
        maxInterest: filters.maxInterest ? Number(filters.maxInterest) / 100 : ''
      });
    }
  };

  const handleReset = () => {
    const resetFilters = {
      minAmount: '',
      maxAmount: '',
      duration: '',
      minScore: '',
      maxInterest: ''
    };
    setFilters(resetFilters);
    if (onFilterChange) onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200 mb-6">
        <Filter className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-900">Search Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
        <div className="lg:col-span-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Loan Amount (₹)</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minAmount}
              onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
              className="w-full bg-white border border-gray-200 text-sm px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-[#174E4F]/10 focus:border-[#174E4F] outline-none transition-all"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxAmount}
              onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
              className="w-full bg-white border border-gray-200 text-sm px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-[#174E4F]/10 focus:border-[#174E4F] outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Duration</label>
          <select
            value={filters.duration}
            onChange={(e) => setFilters({...filters, duration: e.target.value})}
            className="w-full bg-white border border-gray-200 text-sm px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-[#174E4F]/10 focus:border-[#174E4F] outline-none transition-all"
          >
            <option value="">Any Duration</option>
            <option value="12">12 Months</option>
            <option value="24">24 Months</option>
            <option value="36">36 Months</option>
          </select>
        </div>

        <div>
           <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Min. Score</label>
           <input
             type="number"
             placeholder="e.g. 700"
             value={filters.minScore}
             onChange={(e) => setFilters({...filters, minScore: e.target.value})}
             className="w-full bg-white border border-gray-200 text-sm px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-[#174E4F]/10 focus:border-[#174E4F] outline-none transition-all"
           />
        </div>
        <div>
           <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 px-1">Max Interest %</label>
           <input
             type="number"
             placeholder="e.g. 12"
             step="0.5"
             value={filters.maxInterest}
             onChange={(e) => setFilters({...filters, maxInterest: e.target.value})}
             className="w-full bg-white border border-gray-200 text-sm px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-[#174E4F]/10 focus:border-[#174E4F] outline-none transition-all"
           />
        </div>

        <div className="flex gap-2 min-w-fit">
           <button
             onClick={handleApply}
             className="flex-1 min-w-[100px] bg-[#174E4F] hover:bg-[#0f3636] text-white font-semibold text-sm py-2.5 rounded-lg transition shadow-sm"
           >
             Apply
           </button>
           <button
             onClick={handleReset}
             className="border border-gray-200 hover:bg-gray-100 text-gray-600 font-semibold text-sm p-2.5 rounded-lg transition"
             title="Reset Filters"
           >
             <RotateCcw className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceFilters;
