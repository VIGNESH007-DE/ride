import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../lib/firebase';
import { Car, User, Upload, CheckCircle } from 'lucide-react';

export const RoleSelection: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'driver' | 'passenger' | null>(null);
  const [loading, setLoading] = useState(false);

  // Driver states
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState<File | null>(null);

  const handleRoleSelection = async () => {
    if (!role || !user) return;
    setLoading(true);

    try {
      let profileData: any = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: role,
        createdAt: new Date().toISOString()
      };

      if (role === 'driver') {
        if (!license || !vehicleNumber || !phone) {
          alert("All driver fields are required.");
          setLoading(false);
          return;
        }

        const licenseRef = ref(storage, `licenses/${user.uid}`);
        await uploadBytes(licenseRef, license);
        const licenseUrl = await getDownloadURL(licenseRef);

        profileData = {
          ...profileData,
          phone,
          vehicleNumber,
          licenseUrl,
          isApproved: true, // No manual approval as per requirements
        };
      }

      await setDoc(doc(db, 'users', user.uid), profileData);
      navigate(role === 'driver' ? '/driver' : '/passenger');
    } catch (error) {
      console.error("Error setting role", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8">
          Complete Your Profile
        </h2>

        {!role ? (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setRole('passenger')}
              className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <User size={48} className="text-blue-600 mb-2" />
              <span className="font-bold">Passenger</span>
            </button>
            <button
              onClick={() => setRole('driver')}
              className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition"
            >
              <Car size={48} className="text-green-600 mb-2" />
              <span className="font-bold">Driver</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-blue-600 mb-4">
              <CheckCircle size={20} />
              <span className="font-semibold capitalize">Joining as {role}</span>
            </div>

            {role === 'driver' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="KA 01 AB 1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Driving License Upload</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative cursor-pointer hover:border-blue-500 transition">
                    <input
                      type="file"
                      onChange={(e) => setLicense(e.target.files ? e.target.files[0] : null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*"
                    />
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="text-sm text-gray-600">
                        {license ? (
                          <span className="text-green-600 font-medium">{license.name} selected</span>
                        ) : (
                          <span>Click to upload license image</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => setRole(null)}
                className="flex-1 py-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={handleRoleSelection}
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 text-white rounded-md font-bold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Finish Signup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
