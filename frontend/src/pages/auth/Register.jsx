import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, BookOpen, Home, Briefcase, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../../services/axios';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { validateEmail, validatePassword, validatePhone } from '../../utils/validators';

export default function Register() {
  const { registerStudent, registerStaff } = useAuth();
  const navigate = useNavigate();
  const [isStudent, setIsStudent] = useState(true);
  
  const HOSTEL_BLOCKS = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'
  ];

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idValue, setIdValue] = useState(''); // registrationNo or employeeId
  const [blockId, setBlockId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [gender, setGender] = useState('MALE'); // Default gender for student
  const [role, setRole] = useState('CLEANING'); // Default role for staff
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!validateEmail(email)) newErrors.email = 'Please enter a valid email address';
    if (!validatePhone(phone)) newErrors.phone = 'Please enter a valid phone number';
    if (!idValue.trim()) newErrors.idValue = isStudent ? 'Student ID is required' : 'Staff ID is required';
    if (!blockId.trim()) newErrors.blockId = 'Block selection or ID is required';
    if (isStudent && !roomNumber.trim()) newErrors.roomNumber = 'Room number is required';
    if (!validatePassword(password)) newErrors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      if (isStudent) {
        const payload = {
          registrationNo: idValue,
          name,
          email,
          phone: phone || null,
          password,
          confirmPassword,
          roomNumber,
          gender,
          blockId
        };
        await registerStudent(payload);
        toast.success('Student account registered! Please check email for OTP verification.');
        navigate('/verify-otp', { state: { email } });
      } else {
        const payload = {
          employeeId: idValue,
          name,
          email,
          phone: phone || null,
          password,
          confirmPassword,
          role,
          blockId
        };
        await registerStaff(payload);
        toast.success('Staff account registered! Please check email for OTP verification.');
        navigate('/verify-otp', { state: { email } });
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Wrench className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-slate-800 text-lg leading-tight">
            Room-Bot <span className="text-indigo-600">Service</span>
          </span>
        </div>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-100 rounded-2xl border border-slate-100 sm:px-10">
          
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {isStudent ? 'Create student account' : 'Staff Registration'}
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                {isStudent ? "Join your university's hostel service platform" : 'Register as a hostel maintenance staff member'}
              </p>
            </div>
            <Link to="/login" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              Back to sign in
            </Link>
          </div>

          {/* Role selector Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isStudent ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => { setIsStudent(true); setErrors({}); }}
            >
              Student
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isStudent ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => { setIsStudent(false); setErrors({}); }}
            >
              Maintenance Staff
            </button>
          </div>

          {/* Admin Activation warning for Staff */}
          {!isStudent && (
            <div className="mb-6 p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-start gap-3">
              <span className="text-indigo-600 mt-0.5">ℹ️</span>
              <p className="text-xs font-semibold text-indigo-800 leading-normal">
                Staff accounts require administrator approval before activation.
              </p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="name"
                label="Full Name"
                icon={User}
                required
                placeholder="Kwame Asante"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
              />
              <Input
                id="email"
                label="Email"
                type="email"
                icon={Mail}
                required
                placeholder="k.asante@ug.edu.gh"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="phone"
                label="Phone"
                type="tel"
                icon={Phone}
                placeholder="+233 20 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
              />
              <Input
                id="idValue"
                label={isStudent ? 'Student ID' : 'Staff ID'}
                icon={BookOpen}
                required
                placeholder={isStudent ? 'UG/CS/2024/001' : 'STF-2024-042'}
                value={idValue}
                onChange={(e) => setIdValue(e.target.value)}
                error={errors.idValue}
              />
            </div>

            {/* Block & Room selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Block Selection dropdown / CUID text input */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-slate-700">
                  {isStudent ? 'Hostel Block' : 'Assigned Block'} <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={blockId}
                  onChange={(e) => setBlockId(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">Select block</option>
                  {HOSTEL_BLOCKS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                {errors.blockId && <span className="text-xs font-medium text-rose-500 pl-1">{errors.blockId}</span>}
              </div>

              {/* Room Number (for student) or Role (for staff) */}
              {isStudent ? (
                <Input
                  id="roomNumber"
                  label="Room Number"
                  icon={Home}
                  required
                  placeholder="204"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  error={errors.roomNumber}
                />
              ) : (
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-bold text-slate-700">
                    Role / Specialization <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="CLEANING">Cleaning</option>
                    <option value="ELECTRICIAN">Electrician</option>
                    <option value="PLUMBER">Plumber</option>
                    <option value="CARPENTER">Carpenter</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>
              )}
            </div>

            {/* Extra Student inputs: Gender */}
            {isStudent && (
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-slate-700">Gender</label>
                <div className="flex gap-4">
                  {['MALE', 'FEMALE', 'OTHER'].map((g) => (
                    <label key={g} className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={gender === g}
                        onChange={() => setGender(g)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded-full cursor-pointer"
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="password"
                label="Password"
                type="password"
                icon={Lock}
                required
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />
              <Input
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                icon={Lock}
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
              />
            </div>

            <div>
              <Button type="submit" className="w-full py-3" loading={loading}>
                Create Account
              </Button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-6 text-center text-xs">
            <p className="font-semibold text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}