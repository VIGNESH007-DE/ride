import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Search, Clock, CheckCircle, CreditCard } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { initiatePayment } from '../../lib/razorpay';

const containerStyle = { width: '100%', height: '400px' };
const center = { lat: 12.9716, lng: 77.5946 };

export const PassengerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState({ origin: '', destination: '' });
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY"
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const q = query(collection(db, 'trips'), where('status', '==', 'scheduled'));
      const snap = await getDocs(q);
      const results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      const filtered = results.filter((t: any) => 
        t.origin?.toLowerCase().includes(search.origin.toLowerCase()) && 
        t.destination?.toLowerCase().includes(search.destination.toLowerCase())
      );
      setTrips(filtered);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (trip: any, type: 'passenger' | 'parcel') => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'bookings'), {
        tripId: trip.id,
        driverId: trip.driverId,
        passengerId: user.uid,
        passengerName: user.displayName || user.email,
        origin: trip.origin,
        destination: trip.destination,
        type,
        status: 'pending',
        paymentStatus: 'pending',
        amount: 10, // Platform fee
        createdAt: new Date().toISOString()
      });
      alert(`Booking request for ${type} sent to driver!`);
    } catch (error) {
      console.error("Booking failed", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Search size={20} className="text-blue-600" />
            Find a Ride
          </h2>
          <form onSubmit={handleSearch} className="space-y-4">
            <input
              type="text"
              placeholder="From where?"
              className="w-full pl-4 pr-4 py-2 border rounded-lg"
              value={search.origin}
              onChange={e => setSearch({...search, origin: e.target.value})}
            />
            <input
              type="text"
              placeholder="To where?"
              className="w-full pl-4 pr-4 py-2 border rounded-lg"
              value={search.destination}
              onChange={e => setSearch({...search, destination: e.target.value})}
            />
            <button className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition">
              Search
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Available Drivers</h3>
          {loading && <p className="text-gray-500 animate-pulse text-sm">Searching for rides...</p>}
          {trips.map(trip => (
            <div 
              key={trip.id} 
              className={`bg-white p-4 rounded-xl shadow-sm border-2 cursor-pointer transition ${selectedTrip?.id === trip.id ? 'border-blue-500' : 'border-transparent'}`}
              onClick={() => setSelectedTrip(trip)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-lg">{trip.driverName}</span>
                <span className="text-blue-600 font-bold">₹{trip.pricePerKm}/km</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleBooking(trip, 'passenger'); }}
                  className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-bold hover:bg-blue-200"
                >
                  Book Ride
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleBooking(trip, 'parcel'); }}
                  className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg text-sm font-bold hover:bg-green-200"
                >
                  Send Parcel
                </button>
              </div>
            </div>
          ))}
        </div>

        <BookingHistory />
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 h-[400px]">
          {isLoaded && (
            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={11}>
              {trips.map(t => <Marker key={t.id} position={center} />)}
            </GoogleMap>
          )}
        </div>
        {selectedTrip && (
           <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
             <h3 className="text-xl font-bold">{selectedTrip.driverName}'s Trip</h3>
             <p className="text-gray-600">{selectedTrip.origin} to {selectedTrip.destination}</p>
             <p className="text-blue-600 font-bold mt-2">Price: ₹{selectedTrip.pricePerKm}/km</p>
           </div>
        )}
      </div>
    </div>
  );
};

const BookingHistory: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'bookings'), where('passengerId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [user]);

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg flex items-center gap-2">
        <Clock size={20} className="text-blue-600" />
        Your Bookings
      </h3>
      {bookings.map(booking => (
        <div key={booking.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex justify-between">
            <span className="font-medium text-sm">{booking.origin} → {booking.destination}</span>
            <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${booking.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {booking.status}
            </span>
          </div>
          {booking.status === 'accepted' && booking.paymentStatus === 'pending' && (
            <button 
              onClick={() => initiatePayment(booking.id, 10, user?.uid || '', user?.displayName || '')}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-1.5 rounded-lg text-sm font-bold"
            >
              <CreditCard size={16} /> Pay ₹10 Fee
            </button>
          )}
          {booking.paymentStatus === 'paid' && (
            <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
              <CheckCircle size={14} /> Platform Fee Paid
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
