import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useState,useEffect } from 'react';
import { VscAccount } from "react-icons/vsc";
import {  FaUserPlus } from "react-icons/fa";


export default function SignIn() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const userDetails = sessionStorage.getItem('userdetails');
    if (token && userDetails) {
      navigate(-1);
    }
  }, [navigate]);
 
  const onSubmit = async (data: any) => {
    try {
      const response = await axios.post('http://localhost:4000/api/users/login', data);
      if (response?.data?.user) {
        sessionStorage.setItem('userdetails', JSON.stringify(response.data.user));
        sessionStorage.setItem('token', response.data.token);
        setToast({ type: 'success', message: 'Signed in successfully!' });
        setTimeout(() => {
          setToast(null);
          // Redirect to ListIssue (kanban board) after login
          // If you have a default projectId, use it here. Otherwise, fallback to /project
          const defaultProjectId = response.data.user.defaultProjectId || '';
          if (defaultProjectId) {
            navigate(`/project/${defaultProjectId}/issues/list`);
          } else {
            navigate('/project');
          }
        }, 1000);
      } else {
        setToast({ type: 'error', message: 'Invalid credentials' });
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      setToast({
        type: 'error',
        message: 'Failed to sign in' + (error?.response?.data?.error ? `: ${error.response.data.error}` : '')
      });
      setTimeout(() => setToast(null), 1000);
    }
  };
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#E0F4FF] via-[#F4F5F7] to-[#FFEDE0] px-4 font-sans text-[15px] text-gray-800 flex items-center justify-center">
      {/* Left: Marketing/Welcome Section */}
      <div className="flex-1 flex flex-col justify-center items-start max-w-xl md:pl-16 py-12 relative">
        {/* Orange and Blue accent bars with SMART and PLANNER */}
        <div className="flex flex-col gap-0 items-start mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-2 h-12 bg-[#FF7F2A] rounded-r-xl"></div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-[#156ba3] tracking-tight">Ramboll</h1>
          </div>
          <div className="flex items-center gap-4 mt-0">
            <div className="w-2 h-12 bg-primary-400 rounded-r-xl"></div>
            <span className="text-4xl md:text-5xl font-extrabold text-[#FF7F2A] tracking-tight">by Jira</span>
          </div>
        </div>
        <p className="text-lg text-[#156ba3] mb-8 max-w-md z-10">Collaborate. Organize. Succeed. – Create your account and start managing projects like a pro.</p>
      </div>
      {/* Right: Sign In Form */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md bg-white rounded-2xl shadow-xl p-10 border-2 border-primary-200">
        <h2 className="text-3xl font-bold text-primary-500 mb-6 text-center">Sign In</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-5">
          <label className="text-sm font-semibold text-primary-700 mb-1" htmlFor="email">Work email</label>
          <input {...register('email', { required: true })} id="email" type="email" placeholder="you@company.com" className="w-full px-4 py-3 rounded-full border border-primary-200 focus:ring-2 focus:ring-primary-400 focus:outline-none text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-200 hover:border-primary-600" autoComplete="email" />
          {errors.email && <span className="text-xs text-accent-500">Email is required</span>}
          <label className="text-sm font-semibold text-primary-700 mb-1" htmlFor="password">Password</label>
          <input {...register('password', { required: true })} id="password" type="password" placeholder="Password" className="w-full px-4 py-3 rounded-full border border-primary-200 focus:ring-2 focus:ring-primary-400 focus:outline-none text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-200 hover:border-primary-600" autoComplete="current-password" />
          {errors.password && <span className="text-xs text-accent-500">Password is required</span>}
          <button
            className="w-full py-3 rounded-full bg-gradient-to-r from-[#156ba3] to-[#67c1f2] hover:from-[#156ba3] hover:to-[#99d6f7] text-[#FDFDFD] font-bold text-lg transition-all duration-200 shadow-lg mt-2 focus:outline-none focus:ring-2 focus:ring-[#67c1f2] focus:ring-offset-2 border border-[#cceafb] hover:scale-105 active:scale-95"
            style={{textShadow: '0 1px 2px rgba(0,0,0,0.18)'}}
            type="submit"
          >
            Sign In
          </button>
        </form>
        <p className="text-gray-600 text-base mt-8 text-center flex justify-center items-center gap-1">
  <VscAccount className="text-lg relative top-[1px]" />
  <span>Don't have an account?</span>
  <Link
    to="/signup"
    className="inline-flex items-center gap-1 underline text-accent-500 hover:text-primary-500 font-semibold text-base transition-all duration-200 ml-1 group"
  >
    <span>Sign Up</span>
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