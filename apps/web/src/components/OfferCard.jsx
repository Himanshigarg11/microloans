import React from 'react';

const OfferCard = ({ offer, isBorrower, onAccept, onReject, onCounter }) => {
  if (!offer) return null;

  const statusConfig = offer.status === 'accepted' 
    ? { border: 'border-green-200', text: 'text-green-700' }
    : offer.status === 'rejected'
      ? { border: 'border-red-200', text: 'text-red-700' }
      : { border: 'border-amber-200', text: 'text-amber-700' };

  const displayRate = offer.interestRate < 1 ? (offer.interestRate * 100) : offer.interestRate;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 transition hover:shadow-md flex flex-col justify-between gap-6">
      <div className="flex justify-between items-center">
         <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center border border-teal-100 flex-shrink-0">
             <span className="text-xs font-bold text-[#174E4F]">{Math.round(displayRate)}%</span>
           </div>
           <div>
             <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Interest Rate</p>
             <p className="text-lg font-bold text-gray-900 leading-none">{displayRate.toFixed(1)}% <span className="text-[10px] text-gray-400 font-medium">APR</span></p>
           </div>
         </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${statusConfig.border} ${statusConfig.text}`}>
            {offer.status}
          </span>
      </div>

      {offer.message && (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
           <p className="text-sm text-gray-600 italic">"{offer.message}"</p>
        </div>
      )}

      {isBorrower && offer.status === 'pending' && (
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => onAccept && onAccept(offer._id)}
            className="w-full bg-[#174E4F] hover:bg-[#0f3636] text-white font-semibold text-sm py-2 rounded-lg transition-all shadow-sm"
          >
            Accept Offer
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onCounter && onCounter(offer)}
              className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold py-2 rounded-lg transition-all"
            >
              Counter
            </button>
            <button
              type="button"
              onClick={() => onReject && onReject(offer._id)}
              className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold py-2 rounded-lg transition-all"
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferCard;
