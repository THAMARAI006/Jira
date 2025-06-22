import axios from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { VscProject } from "react-icons/vsc";

export default function EditProject() {
  const { id } = useParams();
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/projects/${id}`);
        setValue('name', res.data.name);
        setValue('description', res.data.description);
      } catch (error) {
        setToast({ type: 'error', message: 'Failed to fetch project details' });
      }
    };
    fetchProject();
  }, [id, setValue]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const onSubmit = async (data: any) => {
    try {
      await axios.patch(`http://localhost:4000/api/projects/${id}`, data);
      showToast('success', 'Project updated successfully!');
      setTimeout(() => navigate('/project'), 1200);
    } catch (error: any) {
      showToast('error', 'Failed to update project' + (error?.response?.data?.error ? `: ${error.response.data.error}` : ''));
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#E0F4FF] via-[#F4F5F7] to-[#FFEDE0] py-4 px-2 md:px-8 font-sans text-[15px] text-gray-800 flex items-center justify-center">
      {/* Left: Marketing/Welcome Section */}
      
      {/* Right: Edit Project Form */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md bg-white rounded-2xl shadow-xl p-10 border-2 border-primary-200">
        <h2 className="text-3xl font-bold text-[#156ba3] mb-6 text-center flex items-center gap-2"><VscProject className="text-2xl" />Edit Project</h2>
        <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          <label className="text-sm font-semibold text-[#156ba3] mb-1" htmlFor="name">Project Name</label>
          <input
            type="text"
            {...register('name', { required: true })}
            id="name"
            className="w-full px-4 py-3 rounded-full border border-primary-200 focus:ring-2 focus:ring-primary-400 focus:outline-none text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-200 hover:border-primary-600"
            placeholder="Enter project name"
            autoComplete="off"
          />
          {errors.name && <span className="text-xs text-accent-500">Name is required</span>}
          <label className="text-sm font-semibold text-[#156ba3] mb-1" htmlFor="description">Description</label>
          <textarea
            {...register('description')}
            id="description"
            className="w-full px-4 py-3 rounded-2xl border border-primary-200 focus:ring-2 focus:ring-primary-400 focus:outline-none text-gray-900 bg-gray-50 placeholder-gray-400 transition-all duration-200 hover:border-primary-600"
            placeholder="Enter project description (optional)"
            rows={4}
          ></textarea>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-full bg-gradient-to-r from-[#156ba3] to-[#67c1f2] hover:from-[#156ba3] hover:to-[#99d6f7] text-[#FDFDFD] font-bold text-lg transition-all duration-200 shadow-lg mt-2 focus:outline-none focus:ring-2 focus:ring-[#67c1f2] focus:ring-offset-2 border border-[#cceafb] hover:scale-105 active:scale-95"
            style={{textShadow: '0 1px 2px rgba(0,0,0,0.18)'}}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/project')}
            className="w-full py-3 rounded-full bg-gradient-to-r from-[#156ba3] to-[#67c1f2] text-white shadow border border-[#cceafb] hover:scale-110 active:scale-95 transition-all"
          >
            Back
          </button>
        </form>
        {toast && (
          <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}