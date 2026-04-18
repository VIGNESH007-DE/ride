import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiatePayment = async (bookingId: string, amount: number, _userId: string, userName: string) => {
  const res = await loadRazorpay();

  if (!res) {
    alert('Razorpay SDK failed to load. Are you online?');
    return;
  }

  const options = {
    key: "YOUR_RAZORPAY_KEY", // In production use import.meta.env.VITE_RAZORPAY_KEY_ID
    amount: amount * 100, // Amount in paise
    currency: "INR",
    name: "BackRide",
    description: "Platform Fee",
    image: "https://example.com/logo.png",
    handler: async function (response: any) {
      if (response.razorpay_payment_id) {
        await updateDoc(doc(db, 'bookings', bookingId), {
          paymentStatus: 'paid',
          razorpayPaymentId: response.razorpay_payment_id
        });
        alert('Payment Successful!');
      }
    },
    prefill: {
      name: userName,
    },
    theme: {
      color: "#2563eb",
    },
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
};
