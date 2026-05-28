import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const capturePayment = async () => {
      try {
        const token = searchParams.get("token");
        const bookingId = searchParams.get("bookingId");

        const accessToken = localStorage.getItem("token");

        if (!token) return;

        const res = await axios.post(
          "http://localhost:3004/api/payments/capture",
          {
            orderId: token,
            bookingId,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        console.log("Payment Captured:", res.data);

        navigate("/dashboard/guest/bookings");
      } catch (error) {
        console.error("Capture Error:", error);
      }
    };

    capturePayment();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-green-600">
          Payment Successful
        </h1>

        <p className="mt-3 text-gray-600">
          Please wait while we confirm your booking...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;