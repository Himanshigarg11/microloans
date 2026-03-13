import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ChatBox from '../components/ChatBox';
import { MessageSquare } from 'lucide-react';

const Chat = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const loanId = queryParams.get('loanId');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#174E4F] text-white rounded-lg">
           <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t('chat')}</h1>
          <p className="text-sm text-gray-600">Coordinate with borrowers and lenders in real-time.</p>
        </div>
      </div>

      {loanId ? (
        <ChatBox loanId={loanId} />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center space-y-4 shadow-sm">
           <MessageSquare className="mx-auto w-12 h-12 text-gray-300" />
           <p className="text-sm font-medium text-gray-400">Please select a loan from the marketplace to start chatting.</p>
           <button 
             onClick={() => navigate('/dashboard/marketplace')}
             className="mt-2 bg-[#174E4F] hover:bg-[#0f3636] text-white font-semibold text-sm px-6 py-2 rounded-lg transition"
           >
             Browse Marketplace
           </button>
        </div>
      )}
      
      {loanId && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
           <p className="text-xs font-medium text-gray-500 text-center italic">
             Tip: Discuss interest rates or clarify repayment conditions before accepting an offer.
           </p>
        </div>
      )}
    </div>
  );
};

export default Chat;
