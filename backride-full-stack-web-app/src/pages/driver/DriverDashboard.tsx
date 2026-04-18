import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Plus, List, DollarSign, CheckCircle, XCircle, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';

export const DriverDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex space-x-8">
        <aside className="w-64 space-y-2">
          <Link to="/driver" className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-sm hover:bg-blue-50 transition">
            <List size={20} className="text-blue-600" />
            <span className="font-medium">My Trips</span>
          </Link>
          <Link to="/driver/add-trip" className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-sm hover:bg-blue-50 transition">
            <Plus size={20} className="text-green-600" />
            <span className="font-medium">Post Return Trip</span>
          </Link>
          <Link to="/driver/earnings" className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-sm hover:bg-blue-50 transition">
            <DollarSign size={20} className="text-yellow-600" />
            <span className="font-medium">Earnings</span>
          </Link>
        </aside>

        <main className="flex-1">
          <Routes>
            <Route index element={<TripList />} />
            <Route path="add-trip" element={<AddTrip />} />
            <Route path="earnings" element={<Earnings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const TripList: React.FC = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const tripsQuery = query(collection(db, 'trips'), where('driverId', '==', user.uid));
    const unsubscribeTrips = onSnapshot(tripsQuery, (snap) => {
      setTrips(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const bookingsQuery = query(collection(db, 'bookings'), where('driverId', '==', user.uid));
    const unsubscribeBookings = onSnapshot(bookingsQuery, (snap) => {
      setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeTrips();
      unsubscribeBookings();
    };
  }, [user]);

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status });
    } catch (error) {
      console.error("Error updating booking", error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage Your Returns</h2>
      
      {/* Bookings Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock size={20} className="text-blue-600" />
          Pending Requests
        </h3>
        <div className="grid gap-4">
          {bookings.filter(b => b.status === 'pending').map(booking => (
            <div key={booking.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <p className="font-bold">{booking.passengerName}</p>
                <p className="text-sm text-gray-500">{booking.type === 'passenger' ? '👤 Passenger' : '📦 Parcel'}</p>
                <p className="text-xs text-gray-400 mt-1">Route: {booking.origin} → {booking.destination}</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => updateBookingStatus(booking.id, 'accepted')}
                  className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
                >
                  <CheckCircle size={20} />
                </button>
                <button 
                  onClick={() => updateBookingStatus(booking.id, 'rejected')}
                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                >
                  <XCircle size={20} />
                </button>
              </div>
            </div>
          ))}
          {bookings.filter(b => b.status === 'pending').length === 0 && (
            <p className="text-gray-500 italic">No pending requests</p>
          )}
        </div>
      </section>

      {/* Trips Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin size={20} className="text-blue-600" />
          Active Returns
        </h3>
        <div className="grid gap-4">
          {trips.map(trip => (
            <div key={trip.id} className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg">{trip.origin} to {trip.destination}</h4>
                  <p className="text-gray-500">{format(new Date(trip.departureTime), 'PPp')}</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded uppercase">
                  {trip.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const AddTrip: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departureTime: '',
    availableSeats: 4,
    pricePerKm: 10,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      await addDoc(collection(db, 'trips'), {
        ...formData,
        driverId: user.uid,
        driverName: user.displayName,
        vehicleNumber: userProfile.vehicleNumber,
        status: 'scheduled',
        createdAt: new Date().toISOString()
      });
      alert("Trip added successfully!");
    } catch (error) {
      console.error("Error adding trip", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Post a Return Trip</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Origin</label>
            <input
              type="text"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.origin}
              onChange={e => setFormData({...formData, origin: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Destination</label>
            <input
              type="text"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.destination}
              onChange={e => setFormData({...formData, destination: e.target.value})}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Departure Time</label>
          <input
            type="datetime-local"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={formData.departureTime}
            onChange={e => setFormData({...formData, departureTime: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Available Seats</label>
            <input
              type="number"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.availableSeats}
              onChange={e => setFormData({...formData, availableSeats: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price per KM (₹)</label>
            <input
              type="number"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              value={formData.pricePerKm}
              onChange={e => setFormData({...formData, pricePerKm: parseInt(e.target.value)})}
            />
          </div>
        </div>
        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? 'Posting...' : 'Post Trip'}
        </button>
      </form>
    </div>
  );
};

const Earnings: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Earnings Overview</h2>
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg text-center">
        <p className="text-gray-600 text-sm uppercase font-bold tracking-wider">Total Earnings</p>
        <p className="text-4xl font-black text-yellow-700">₹0.00</p>
      </div>
      <p className="mt-4 text-gray-500 text-sm italic">Earnings dashboard is updated after trip completion and payment.</p>
    </div>
  );
};
