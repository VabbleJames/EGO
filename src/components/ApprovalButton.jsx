import React from 'react';

function ApprovalButton({ onClick, isApproved, isLoading, tokenSymbol }) {
  if (isApproved) {
    return (
      <div className="text-green-500 text-sm flex items-center">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {tokenSymbol} Approved
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`px-3 py-1 rounded text-sm ${
        isLoading
          ? 'bg-gray-500 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700'
      } text-white transition-colors`}
    >
      {isLoading ? (
        <div className="flex items-center">
          <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Approving...
        </div>
      ) : (
        `Approve ${tokenSymbol}`
      )}
    </button>
  );
}

export default ApprovalButton;