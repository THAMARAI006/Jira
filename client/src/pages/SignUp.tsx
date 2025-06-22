import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { VscAccount } from 'react-icons/vsc';
import { FaUserPlus } from 'react-icons/fa';

export default function SignUp() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const onSubmit = async (data: any) => {
    try {
      const response = await axios.post('http://localhost:4000/api/users/', {...data, role: 'regular'});
      if(response?.status === 201) {
        showToast('success', 'Signed up successfully! Please sign in.');
        setTimeout(() => navigate('/'), 3000); // Wait for toast before navigating
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      showToast(
        'error',
        'Failed to sign up' + (error?.response?.data?.error ? `: ${error.response.data.error}` : '')
      );
    }
  };
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#E0F4FF] via-[#F4F5F7] to-[#FFEDE0] px-4 font-sans text-[15px] text-gray-800 flex items-center justify-center">
      {/* Left: Marketing/Welcome Section */}
      <div className="flex-1 flex flex-col justify-center items-start max-w-xl md:pl-16 py-12 relative">
        {/* Orange accent bar */}
        <div className="absolute left-0 top-10 w-2 h-20 bg-accent-500 rounded-r-xl hidden md:block" style={{zIndex:1}}></div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-[#156ba3] leading-tight mb-4 z-10">
          Join the future <br />
        
        </h1>
        <p className="text-lg text-[#156ba3] mb-8 max-w-md z-10">Collaborate. Organize. Succeed. – Create your account and start managing projects like a pro.</p>
      </div>
      {/* Right: Sign Up Form */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md bg-white rounded-2xl shadow-xl p-10 border-2 border-primary-200">
        <h2 className="text-3xl font-bold text-primary-500 mb-6 text-center">Sign Up</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-5">
          <label className="text-sm font-semibold text-primary-700 mb-1" htmlFor="name">Name</label>
          <input {...register('name', { required: true })} id="name" type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-full border border-primary-200 focus:ring-2 focus:ring-primary-400 focus:outline-none text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-200 hover:border-primary-600" autoComplete="name" />
          {errors.name && <span className="text-xs text-accent-500">Name is required</span>}
          <label className="text-sm font-semibold text-primary-700 mb-1" htmlFor="email">Work email</label>
          <input {...register('email', { required: true })} id="email" type="email" placeholder="you@company.com" className="w-full px-4 py-3 rounded-full border border-primary-200 focus:ring-2 focus:ring-primary-400 focus:outline-none text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-200 hover:border-primary-600" autoComplete="email" />
          {errors.email && <span className="text-xs text-accent-500">Email is required</span>}
          <label className="text-sm font-semibold text-primary-700 mb-1" htmlFor="password">Password</label>
          <input {...register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' },
            validate: {
              hasLower: value => /[a-z]/.test(value) || 'Must include a lowercase letter',
              hasUpper: value => /[A-Z]/.test(value) || 'Must include an uppercase letter',
              hasNumber: value => /[0-9]/.test(value) || 'Must include a number',
              hasSpecial: value => /[^A-Za-z0-9]/.test(value) || 'Must include a special character',
            }
          })} id="password" type="password" placeholder="Password" className="w-full px-4 py-3 rounded-full border border-primary-200 focus:ring-2 focus:ring-primary-400 focus:outline-none text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-200 hover:border-primary-600" autoComplete="new-password" />
          {errors.password && <span className="text-xs text-accent-500">{errors.password.message || (errors.password.types && Object.values(errors.password.types)[0])}</span>}
         
          <button
            className="w-full py-3 rounded-full bg-gradient-to-r from-[#156ba3] to-[#67c1f2] hover:from-[#156ba3] hover:to-[#99d6f7] text-[#FDFDFD] font-bold text-lg transition-all duration-200 shadow-lg mt-2 focus:outline-none focus:ring-2 focus:ring-[#67c1f2] focus:ring-offset-2 border border-[#cceafb] hover:scale-105 active:scale-95"
            style={{textShadow: '0 1px 2px rgba(0,0,0,0.18)'}}
            type="submit"
          >
            Sign Up
          </button>
        </form>
        <p className="text-gray-600 text-base mt-8 text-center flex justify-center items-center gap-1">
          <VscAccount className="text-lg relative top-[1px]" />
          <span>Already have an account?</span>
          <Link
            to="/"
            className="inline-flex items-center gap-1 underline text-accent-500 hover:text-primary-500 font-semibold text-base transition-all duration-200 ml-1 group"
          >
            <span>Sign In</span>
            <FaUserPlus className="text-lg group-hover:translate-x-1 transition-transform" />
          </Link>
        </p>
        {toast && (
          <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold transition-all
            ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
