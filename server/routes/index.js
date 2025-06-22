 
const express = require('express');
const projectRoutes = require('./projectRoutes');
const issueRoutes = require('./issueRoutes');
const commentRoutes = require('./commentRoutes');
const userRoutes = require('./userRoutes');
const router = express.Router();
// Basic route
router.get('/', (req, res) => {
  res.send('JIRA Clone API is running');
});
// API routes
router.use('/api/projects', projectRoutes);
router.use('/api/issues', issueRoutes);
router.use('/api/comments', commentRoutes);
router.use('/api/users', userRoutes);
// API Status route
router.get('/api/status', async (req, res) => {
  try {
    // Test database connection by counting projects
    const projectCount = await req.prisma.project.count();
    res.json({
      status: 'success',
      message: 'Server is running properly',
      databaseConnected: true,
      projects: projectCount,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server running but database connection failed',
      error: error.message,
      timestamp: new Date()
    });
  }
});
 
module.exports = router;
 
 