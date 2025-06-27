import axios from 'axios';
import { useEffect, useState } from 'react';
import {  useNavigate } from 'react-router-dom';
import { AiTwotoneEdit, AiTwotoneRest } from "react-icons/ai";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FaProjectDiagram } from "react-icons/fa";


interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const PAGE_SIZE = 6;

const ListProject = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:4000/api/projects');
      const allProjects = res.data.projects || res.data;
      console.log('Fetched projects:', allProjects); // Debug log
      setTotal(allProjects.length || 0);
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      setProjects(allProjects.slice(start, end));
    } catch (err) {
      setProjects([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:4000/api/projects/${id}`);
      showToast('success', 'Project deleted successfully!');
      setShowDeleteModal(null);
      fetchProjects();
    } catch (error: any) {
      showToast('error', 'Failed to delete project' + (error?.response?.data?.error ? `: ${error.response.data.error}` : ''));
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(search.toLowerCase()) ||
    (project.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (project.key || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#E0F4FF] via-[#F4F5F7] to-[#FFEDE0] py-4 px-2 md:px-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header + Search Row */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 w-full gap-4">
          <div className="flex items-center gap-2">
            <FaProjectDiagram className="text-2xl text-primary-700" />
            <h2 className="text-3xl font-extrabold text-primary-700 tracking-tight font-sans drop-shadow-sm">Projects</h2>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto md:justify-end">
            <div className="flex gap-2 bg-white rounded-xl shadow border border-primary-100 px-2 py-1">
              <input
                placeholder="Search projects"
                className="px-3 py-1 border border-primary-200 rounded-xl font-sans text-[15px] w-[160px] md:w-[200px]"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
              <button
                className="px-4 py-1 rounded-full bg-gradient-to-r from-[#156ba3] to-[#67c1f2] text-white font-bold shadow border border-[#cceafb] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm"
                onClick={() => setSearch(searchInput)}
                type="button"
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
              </button>
            </div>
            <button
              className="bg-gradient-to-r from-[#156ba3] to-[#67c1f2] hover:from-[#156ba3] hover:to-[#99d6f7] text-white font-bold px-5 py-2 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#67c1f2] focus:ring-offset-2 border border-[#cceafb] hover:scale-105 active:scale-95"
              style={{textShadow: '0 1px 2px rgba(0,0,0,0.18)'}}
              onClick={() => navigate('/project/create')}
            >
              Create Project
            </button>
          </div>
        </div>
        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-16 text-primary-400 text-xl font-semibold">Loading...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-full flex justify-center items-center py-16 text-primary-300 text-lg">No projects found.</div>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-2xl shadow-lg border-2 border-primary-100 hover:border-primary-300 hover:shadow-xl transition-all p-5 flex flex-col gap-3 cursor-pointer group"
                onClick={() => navigate(`/project/${project.id}/issues/list`)}
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className="bg-primary-100 rounded-full w-9 h-9 flex items-center justify-center text-primary-700 font-bold text-lg shadow">
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary-700 group-hover:underline">
                      {project.name}
                    </div>
                    <div className="text-xs text-gray-500 font-semibold">{project.key}</div>
                  </div>
                </div>
                <div className="text-primary-700 text-sm min-h-[32px]">{project.description || <span className="italic text-gray-400">No description</span>}</div>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  <span>Created: {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '-'}</span>
                  <span>Updated: {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : '-'}</span>
                </div>
                <div className="flex gap-2 mt-auto justify-end">
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/project/${project.id}/edit`); }}
                    className="p-2 rounded-full bg-gradient-to-r from-[#e6f5fd] to-[#cceafb] text-primary-700 shadow border border-[#cceafb] hover:bg-primary-100 hover:text-[#156ba3] active:scale-95 transition-all flex items-center justify-center"
                    title="Edit Project"
                    aria-label="Edit Project"
                    style={{width: '36px', height: '36px'}}
                  >
                    <AiTwotoneEdit className="h-5 w-5 text-primary-700 group-hover:text-[#156ba3] transition-colors" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setShowDeleteModal(project.id); }}
                    className="p-2 rounded-full bg-gradient-to-r from-[#ffeaea] to-[#ffd6d6] text-red-600 shadow border border-red-200 hover:bg-red-100 hover:text-red-700 active:scale-95 transition-all flex items-center justify-center"
                    title="Delete Project"
                    aria-label="Delete Project"
                    style={{width: '36px', height: '36px'}}
                  >
                    <AiTwotoneRest className="h-5 w-5 text-red-500 group-hover:text-red-700 transition-colors" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            className="px-3 py-1 rounded-full bg-gradient-to-r from-[#156ba3] to-[#67c1f2] text-white font-bold shadow disabled:opacity-50 border border-[#cceafb]"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <IoIosArrowBack className="h-5 w-5 text-white" />
          </button>
          <span className="font-semibold text-[#0098EB]">Page {page} of {totalPages}</span>
          <button
            className="px-3 py-1 rounded-full bg-gradient-to-r from-[#156ba3] to-[#67c1f2] text-white font-bold shadow disabled:opacity-50 border border-[#cceafb]"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <IoIosArrowForward className="h-5 w-5 text-white" />
          </button>
        </div>
        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center border-2 border-red-200">
              <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">Delete Project</h2>
              <p className="mb-6 text-center text-gray-700">Are you sure you want to delete this project? This action cannot be undone.</p>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                disabled={deleteLoading}
                className="w-full py-2 rounded-full bg-gradient-to-r from-[#156ba3] to-[#67c1f2] text-white font-bold hover:from-[#156ba3] hover:to-[#99d6f7] shadow border border-[#cceafb] transition disabled:opacity-60 disabled:cursor-not-allowed mb-2"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Project'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(null)}
                className="w-full py-2 rounded-full bg-gradient-to-r from-[#156ba3] to-[#67c1f2] text-white font-bold hover:from-[#156ba3] hover:to-[#99d6f7] shadow border border-[#cceafb] transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListProject;
