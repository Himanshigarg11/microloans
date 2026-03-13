const Loan = require('../models/Loan');

class LoanService {
  /**
   * Creates a new loan request.
   * 
   * @param {Object} loanData - Data for the new loan.
   * @returns {Promise<Object>} The created loan document.
   */
  static async createLoan(loanData) {
    try {
      // Ensure newly created loans default to 'open_for_offers'
      const loan = new Loan({
        ...loanData,
        status: 'open_for_offers'
      });
      
      const savedLoan = await loan.save();
      return savedLoan;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves all community loans, optionally filtered by status, with pagination.
   * 
   * @param {Object} query - Optional query filters (e.g., { status: 'open_for_offers' }).
   * @param {number} page - The page number to retrieve.
   * @param {number} limit - The number of records per page.
   * @returns {Promise<Object>} An object containing loans array, total pages, and current page.
   */
  static async getLoans(query = {}, page = 1, limit = 10) {
    try {
      const dbQuery = {};
      if (query.status) {
        dbQuery.status = query.status;
      } else if (!query.borrowerId) {
        // Default for marketplace: show both open and pending loans
        dbQuery.status = { $in: ['open_for_offers', 'pending'] };
      }
      
      if (query.borrowerId) dbQuery.borrowerId = query.borrowerId;
      
      // Amount filters
      if (query.minAmount !== undefined || query.maxAmount !== undefined) {
        dbQuery.amount = {};
        if (query.minAmount !== undefined) dbQuery.amount.$gte = query.minAmount;
        if (query.maxAmount !== undefined) dbQuery.amount.$lte = query.maxAmount;
      }
      
      // Exact match filters
      if (query.repaymentPeriod !== undefined) {
        dbQuery.repaymentPeriod = query.repaymentPeriod;
      }
      
      if (query.loanScoreRequired !== undefined) {
        dbQuery.loanScoreRequired = { $lte: query.loanScoreRequired };
      }
      if (query.maxInterestRate !== undefined) {
        dbQuery.$or = [
          { requestedInterestRate: { $lte: query.maxInterestRate } },
          { requestedInterestRate: null },
          { interestRate: { $lte: query.maxInterestRate } }
        ];
      }
      
      const skip = (page - 1) * limit;

      const [loans, total] = await Promise.all([
        Loan.find(dbQuery)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('borrowerId', 'name loanScore income occupation creditScore incomeRange employmentType loanHistorySummary')
          .exec(),
        Loan.countDocuments(dbQuery)
      ]);
        
      return {
        loans,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves specific details of a single loan.
   * 
   * @param {string} loanId - The ID of the loan to retrieve.
   * @returns {Promise<Object>} The loan document, or null if not found.
   */
  static async getLoanById(loanId) {
    try {
      const loan = await Loan.findById(loanId)
        .populate('borrowerId', 'name loanScore income occupation creditScore incomeRange employmentType loanHistorySummary')
        .exec();
        
      return loan;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates the status of a loan.
   * 
   * @param {string} loanId - The ID of the loan.
   * @param {string} newStatus - The new status.
   * @returns {Promise<Object>} The updated loan document.
   */
  static async updateLoanStatus(loanId, newStatus) {
    try {
      const loan = await Loan.findByIdAndUpdate(
        loanId, 
        { status: newStatus }, 
        { new: true, runValidators: true }
      );
      return loan;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = LoanService;
