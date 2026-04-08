import React from 'react';

const OrderPreview = ({ items, onConfirm, onCancel, isProcessing }) => {
  const total = items.reduce((acc, item) => acc + (item.prijs * (item.quantity || 1)), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100">
        {/* Header */}
        <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Item List */}
        <div className="p-6 max-h-[400px] overflow-y-auto space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.product_foto_url || 'https://via.placeholder.com/64'} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 line-clamp-1">{item.naam}</h4>
                <p className="text-sm text-gray-500">Qty: {item.quantity || 1} x €{item.prijs}</p>
              </div>
              <div className="text-right font-bold text-gray-900">
                €{(item.prijs * (item.quantity || 1)).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-medium text-gray-600">Total to Pay</span>
            <span className="text-2xl font-black text-indigo-600">€{total.toFixed(2)}</span>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Back to Cart
            </button>
            <button 
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  Confirm Order
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
          
          <p className="mt-4 text-center text-xs text-gray-400">
            Secure payment powered by your selected provider.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderPreview;
