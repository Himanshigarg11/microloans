const MessageService = require('../services/messageService');
const Loan = require('../models/Loan');

/**
 * Controller for sending a new message.
 */
const sendMessage = async (req, res) => {
  try {
    const { loanId, message, timestamp } = req.body;
    const senderId = req.user.id;

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    const borrowerId = loan.borrowerId?.toString();
    const lenderId = loan.selectedLenderId?.toString();
    const currentUserId = senderId.toString();

    if (!lenderId || (currentUserId !== borrowerId && currentUserId !== lenderId)) {
      return res.status(403).json({
        success: false,
        message: 'Chat is restricted to the borrower and selected lender for this loan.'
      });
    }
    
    const newMessage = await MessageService.createMessage({
      loanId,
      senderId,
      message,
      timestamp
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to send message'
    });
  }
};

/**
 * Controller for fetching all messages in a loan's thread.
 */
const getMessagesForLoan = async (req, res) => {
  try {
    const loanId = req.params.loanId || req.params.id;

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    const borrowerId = loan.borrowerId?.toString();
    const lenderId = loan.selectedLenderId?.toString();
    const currentUserId = (req.user && (req.user._id || req.user.id))?.toString();

    if (!lenderId || !currentUserId || (currentUserId !== borrowerId && currentUserId !== lenderId)) {
      return res.status(403).json({
        success: false,
        message: 'Chat is restricted to the borrower and selected lender for this loan.'
      });
    }

    const messages = await MessageService.getMessagesForLoan(loanId);

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

module.exports = {
  sendMessage,
  getMessagesForLoan
};
