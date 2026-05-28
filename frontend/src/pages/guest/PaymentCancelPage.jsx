const PaymentCancelPage = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-red-600">
          Payment Cancelled
        </h1>

        <p className="mt-3 text-gray-600">
          Your payment was cancelled.
        </p>
      </div>
    </div>
  );
};

export default PaymentCancelPage;