import axios from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { generateProjectCode } from '../../utils/ProjectCode';
 
interface ProjectOption {
  id: string;
  name: string;
}
 
const issueTypeOptions = ['Bug', 'Task', 'Story'];
const priorityTypeOptions = ['Low', 'Medium', 'High'];
 
const CreateIssue = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [description, setDescription] = useState('');
 
  useEffect(() => {
    // Fetch all projects for dropdown, but select current by default
    const fetchProjects = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/projects',);
        setProjects(res.data.projects || res.data);
      } catch {
        setProjects([]);
      }
    };
    fetchProjects();
  }, []);
 
  useEffect(() => {
    setValue('projectId', projectId);
  }, [projectId, setValue]);
 
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };
 
  const onSubmit = async (data: any) => {
    try {
      const userDetails = sessionStorage.getItem('userdetails');
      if (!userDetails) {
        showToast('error', 'User details not found. Please log in again.');
        return;
      }
      const user = JSON.parse(userDetails);
      if (!user.id) {
        showToast('error', 'User ID not found. Please log in again.');
        return;
      }
      if (!data.projectId) {
        showToast('error', 'Project ID is required');
        return;
      }
      await axios.post('http://localhost:4000/api/issues', { ...data, description, code: generateProjectCode(data.title), projectId, reporterId: user.id, status: 'To Do' });
      showToast('success', 'Issue created successfully!');
      setTimeout(() => navigate(-1), 1200);
    } catch (error: any) {
      showToast('error', 'Failed to create issue' + (error?.response?.data?.error ? `: ${error.response.data.error}` : ''));
    }
  };
 
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#E0F4FF] via-[#F4F5F7] to-[#FFEDE0] py-4 px-2 md:px-8 font-sans text-[15px] text-gray-800 flex items-center justify-center">
      {toast && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-10 border-2 border-primary-200">
        <h2 className="text-3xl font-bold text-[#156ba3] mb-6 text-center">Create Issue</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-5">
          <div>
            <label className="block text-[#156ba3] font-semibold mb-1">Project</label>
            <select {...register('projectId', { required: true })} className="w-full px-4 py-2 rounded-full border border-primary-200 focus:ring-2 focus:ring-primary-400 focus:outline-none bg-gray-50 text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-primary-600" disabled>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id} selected={proj.id === projectId}>{proj.name}</option>
              ))}
            </select>
            {errors.projectId && <span className="text-xs text-accent-500">Project is required</span>}
          </div>
          <div>
            <label className="block text-[#156ba3] font-semibold mb-1">Title</label>
            <input {...register('title', { required: true })} type="text" placeholder="Issue title" className="w-full px-4 py-2 rounded-full border border-primary-200 focus:ring-2 focus:ring-primary-400 focus:outline-none bg-gray-50 text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-primary-600" />
            {errors.title && <span className="text-xs text-accent-500">Title is required</span>}
          </div>
          <div>
            <label className="block text-[#156ba3] font-semibold mb-1">Issue</label>
            <select {...register('type', { required: true })} className="w-full px-4 py-2 rounded-full border border-primary-200 focus:ring-2 focus:ring-primary-400 focus:outline-none bg-gray-50 text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-primary-600">
              <option value="">Select Type</option>
              {issueTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {errors.type && <span className="text-xs text-accent-500">Type is required</span>}
          </div>
          <div>
            <label className="block text-[#156ba3] font-semibold mb-1">Priority</label>
            <select {...register('priority', { required: true })} className="w-full px-4 py-2 rounded-full border border-primary-200 focus:ring-2 focus:ring-primary-400 focus:outline-none bg-gray-50 text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-primary-600">
              <option value="">Select Priority</option>
              {priorityTypeOptions.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {errors.priority && <span className="text-xs text-accent-500">Priority is required</span>}
          </div>
          <div>
            <label className="block text-[#156ba3] font-semibold mb-1">Description</label>
            <textarea
              {...register('description')}
              className="w-full px-4 py-2 rounded-2xl border border-primary-200 focus:ring-2 focus:ring-primary-400 focus:outline-none bg-gray-50 text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-primary-600"
              rows={5}
              placeholder="Enter issue description"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-full bg-gradient-to-r from-[#156ba3] to-[#67c1f2] hover:from-[#156ba3] hover:to-[#99d6f7] text-[#FDFDFD] font-bold text-lg transition-all duration-200 shadow-lg mt-2 focus:outline-none focus:ring-2 focus:ring-[#67c1f2] focus:ring-offset-2 border border-[#cceafb] hover:scale-105 active:scale-95" style={{textShadow: '0 1px 2px rgba(0,0,0,0.18)'}}>
            {isSubmitting ? 'Creating...' : 'Create Issue'}
          </button>
          <button
            type="button"
            className="w-full py-3 rounded-full bg-gray-200 hover:bg-primary-100 text-primary-700 font-semibold text-base transition-all duration-200 mt-2"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </form>
      </div>
    </div>
  );
};
 
export default CreateIssue;