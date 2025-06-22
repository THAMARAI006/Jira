import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import CreateIssue from './pages/Issues/CreateIssue';
import ListIssue from './pages/Issues/ListIssue';
import ViewIssue from './pages/Issues/ViewIssue';
import CreateProject from './pages/Project/CreateProject';
import EditProject from './pages/Project/EditProject';
import ListProject from './pages/Project/ListProject';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile/profile';
import ProtectedRoute from './components/ProtectedRoute';
 
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/project" element={<ProtectedRoute><ListProject /></ProtectedRoute>} />
        <Route path="/project/create" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
        <Route path="/project/:id/edit" element={<ProtectedRoute><EditProject /></ProtectedRoute>} />
        <Route path="/project/:id/issues/list" element={<ProtectedRoute><ListIssue /></ProtectedRoute>} />
        <Route path='/project/:id/issues/create' element={<ProtectedRoute><CreateIssue /></ProtectedRoute>} />
        <Route path="/project/:id/issues/view/:issueId" element={<ProtectedRoute><ViewIssue /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}
 
export default App;