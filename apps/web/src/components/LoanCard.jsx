import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoanCard = ({ loan, onAction }) => {
  const navigate = useNavigate();
  if (!loan) return null;

  const isFunded = loan.status === 'funded' || loan.status === 'repayment' || loan.status === 'completed';
  const statusConfig = isFunded 
    ? { border: 'border-green-200', text: 'text-green-700', label: 'Funded' } 
    : loan.status === 'pending' 
      ? { border: 'border-amber-200', text: 'text-amber-700', label: 'Pending' }
      : { border: 'border-teal-200', text: 'text-[#174E4F]', label: 'Available' };

  const handleAction = () => {
    if (onAction) {
      onAction(loan);
    } else {
      navigate(`/dashboard/marketplace/${loan._id}`);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 transition hover:shadow-md flex flex-col justify-between h-full">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${statusConfig.border} ${statusConfig.text}`}>
            {statusConfig.label}
          </span>
          <div className="text-right">
             <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Score Req.</p>
             <p className="text-lg font-bold text-gray-900">{loan.loanScoreRequired}</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-0.5">Requested Amount</p>
          <p className="text-2xl font-bold text-gray-900">
            ₹{loan.amount?.toLocaleString('en-IN') || 0}
          </p>
        </div>

        {loan.borrowerId && typeof loan.borrowerId === 'object' && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Borrower Info</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(loan.borrowerId.loanScore != null || loan.borrowerId.creditScore != null) && (
                <span>Score: {loan.borrowerId.creditScore ?? loan.borrowerId.loanScore ?? '—'}</span>
              )}
              {loan.borrowerId.income != null && <span>Income: ₹{(loan.borrowerId.income || 0).toLocaleString()}</span>}
              {loan.borrowerId.occupation && <span>Occupation: {loan.borrowerId.occupation}</span>}
              {loan.borrowerId.employmentType && <span>Type: {loan.borrowerId.employmentType}</span>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold text-[#174E4F] uppercase tracking-wider">Purpose</p>
            <p className="text-sm font-medium text-gray-700 truncate">{loan.purpose}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold text-[#174E4F] uppercase tracking-wider">Duration</p>
            <p className="text-sm font-medium text-gray-700">{loan.repaymentPeriod} Months</p>
          </div>
          {(loan.requestedInterestRate != null || loan.interestRate != null) && (
            <div className="space-y-0.5 col-span-2">
              <p className="text-[10px] font-semibold text-[#174E4F] uppercase tracking-wider">Interest Rate</p>
              <p className="text-sm font-medium text-gray-700">
                {(() => {
                  const r = loan.interestRate ?? loan.requestedInterestRate;
                  return (r < 1 ? r * 100 : r).toFixed(1);
                })()}%
              </p>
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={handleAction}
        className="mt-5 w-full bg-[#174E4F] hover:bg-[#0f3636] text-white font-semibold text-sm py-2 rounded-lg transition-all shadow-sm"
      >
        View Details
      </button>
    </div>
  );
};

export default LoanCard;
