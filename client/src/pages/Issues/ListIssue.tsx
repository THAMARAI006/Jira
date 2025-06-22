// ListIssue.tsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface Issue {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  assigneeId: string;
  assignee?: { id: string; name: string } | null;
  reporterId: string;
  reporter?: { id: string; name: string } | null;
  code?: string;
  projectId?: string;
}

const STATUS_COLUMNS = [
  { key: 'To Do', label: 'To Do' },
  { key: 'In Progress', label: 'In Progress' },
  { key: 'Done', label: 'Done' },
];

const ListIssue = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState({
    search: '',
    assigneeId: '',
    reporterId: '',
    status: '',
    type: '',
  });

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:4000/api/issues`);
        setIssues(res.data.filter((i: Issue) => i.projectId === projectId));
      } catch {
        setIssues([]);
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchIssues();

    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/users');
        setUsers(res.data);
      } catch {
        setUsers([]);
      }
    };
    fetchUsers();
  }, [projectId]);

  const filteredIssues = issues.filter(issue => {
    const matchesSearch =
      filter.search.trim() === '' ||
      issue.title.toLowerCase().includes(filter.search.toLowerCase()) ||
      issue.description?.toLowerCase().includes(filter.search.toLowerCase()) ||
      issue.code?.toLowerCase().includes(filter.search.toLowerCase());
    const matchesAssignee = !filter.assigneeId || issue.assigneeId === filter.assigneeId;
    const matchesReporter = !filter.reporterId || issue.reporterId === filter.reporterId;
    const matchesStatus = !filter.status || issue.status === filter.status;
    const matchesType = !filter.type || issue.type === filter.type;
    return matchesSearch && matchesAssignee && matchesReporter && matchesStatus && matchesType;
  });

  const issuesByStatus: Record<string, Issue[]> = {
    'To Do': [],
    'In Progress': [],
    'Done': [],
  };
  filteredIssues.forEach(issue => {
    if (issuesByStatus[issue.status]) {
      issuesByStatus[issue.status].push(issue);
    }
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#E0F4FF] via-[#F4F5F7] to-[#FFEDE0] py-4 px-2 md:px-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 w-full gap-4">
          <h2 className="text-3xl font-extrabold text-primary-700 flex items-center gap-2 tracking-tight font-sans drop-shadow-sm">
            Issues Board
          </h2>
          <button
            className="bg-gradient-to-r from-[#156ba3] to-[#67c1f2] hover:from-[#156ba3] hover:to-[#99d6f7] text-[#FDFDFD] font-bold px-5 py-2 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#67c1f2] focus:ring-offset-2 border border-[#cceafb] hover:scale-105 active:scale-95"
            style={{textShadow: '0 1px 2px rgba(0,0,0,0.18)'}}
            onClick={() => navigate(`/project/${projectId}/issues/create`)}
          >
            <span className="text-xl font-bold"></span>
            <span>Create Issue</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-4 mb-4 items-end bg-white rounded-2xl shadow p-4 border border-primary-100 font-sans text-[15px]">
          <input
            placeholder="Search issues"
            className="flex-1 max-w-[350px] px-5 py-2 border border-primary-200 rounded-xl font-sans"
            value={filter.search}
            onChange={(e) => setFilter(f => ({ ...f, search: e.target.value }))}
          />
          <select
            className="min-w-[210px] px-5 py-2 border border-primary-200 rounded-xl font-sans"
            value={filter.assigneeId}
            onChange={(e) => setFilter(f => ({ ...f, assigneeId: e.target.value }))}
          >
            <option value="">Assignee</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <select
            className="min-w-[210px] px-5 py-2 border border-primary-200 rounded-xl font-sans"
            value={filter.reporterId}
            onChange={(e) => setFilter(f => ({ ...f, reporterId: e.target.value }))}
          >
            <option value="">Reporter</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <select
            className="min-w-[210px] px-5 py-2 border border-primary-200 rounded-xl font-sans"
            value={filter.status}
            onChange={(e) => setFilter(f => ({ ...f, status: e.target.value }))}
          >
            <option value="">Status</option>
            {STATUS_COLUMNS.map(col => (
              <option key={col.key} value={col.key}>{col.label}</option>
            ))}
          </select>
          <select
            className="min-w-[210px] px-5 py-2 border border-primary-200 rounded-xl font-sans"
            value={filter.type}
            onChange={(e) => setFilter(f => ({ ...f, type: e.target.value }))}
          >
            <option value="">Type</option>
            <option value="Bug">Bug</option>
            <option value="Task">Task</option>
            <option value="Story">Story</option>
          </select>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map(col => (
            <div
              key={col.key}
              className="flex-1 min-w-[320px] bg-white rounded-2xl shadow-lg border-2 border-primary-100 p-4 flex flex-col"
            >
              <div className="mb-4 pb-2 border-b border-primary-50 flex items-center gap-2">
                <span className="uppercase font-bold text-primary-700 tracking-wider text-lg">{col.label}</span>
                <span className="ml-2 bg-primary-100 text-primary-700 rounded-full px-3 py-1 text-xs font-semibold">{issuesByStatus[col.key]?.length || 0}</span>
              </div>
              <div className="flex flex-col gap-4">
                {loading ? (
                  <div className="text-center text-gray-400 py-8">Loading...</div>
                ) : issuesByStatus[col.key]?.length === 0 ? (
                  <div className="text-center text-gray-300 py-8">No issues</div>
                ) : (
                  issuesByStatus[col.key].map(issue => (
                    <div className="relative" key={issue.id}>
                      <div
                        className={`block bg-white rounded-xl shadow-md border border-primary-50 hover:border-primary-300 hover:shadow-lg transition-all p-4 group ${
                          issue.status === 'Done' ? 'opacity-60' : ''
                        } cursor-pointer`}
                        onClick={() => navigate(`/project/${projectId}/issues/view/${issue.id}`)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-4 h-4 rounded-sm ${
                            issue.type === 'Bug' ? 'bg-red-600' :
                            issue.type === 'Task' ? 'bg-blue-600' : 'bg-green-600'
                          }`}></span>
                          <span className="uppercase text-xs font-bold px-2 py-1 rounded-full bg-primary-100 text-primary-700">{issue.type}</span>
                          <span className="ml-auto text-xs text-gray-400 font-mono">{issue.code}</span>
                        </div>
                        <div className="font-semibold text-primary-700 text-base mb-1 truncate group-hover:underline">{issue.title}</div>
                        <div className="text-xs text-gray-600 mb-2 truncate">{issue.description}</div>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            issue.priority === 'High' ? 'bg-red-100 text-red-700' :
                            issue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>{issue.priority}</span>
                          <span className="flex items-center gap-2">
                            {(() => {
                              const assigneeUser = users.find(u => u.id === issue.assigneeId);
                              const avatar = assigneeUser?.avatar;
                              if (avatar) {
                                const src = avatar.startsWith('/uploads/') ? `http://localhost:4000${avatar}` : avatar;
                                return (
                                  <img
                                    src={src}
                                    alt={assigneeUser.name}
                                    className="w-7 h-7 rounded-full object-cover border-2 border-primary-200"
                                  />
                                );
                              }
                              return (
                                <span className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border-2 border-primary-200">
                                  {issue.assignee?.name ? issue.assignee.name[0]?.toUpperCase() : '?'}
                                </span>
                              );
                            })()}
                            <span className="text-xs text-gray-600 font-medium">{issue.assignee?.name || '-'}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListIssue;
