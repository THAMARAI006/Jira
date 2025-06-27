const express = require('express');
const router = express.Router();
 
/**
 * Projects API
 * @route /api/projects
 */
 
// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await req.prisma.project.findMany({
      include: {
        issues: true
      }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
// Create a project
router.post('/', async (req, res) => {
  try {
    const { name, key, description, code } = req.body;
    const project = await req.prisma.project.create({
      data: {
        name,
        key,
        description,
        code
      }
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
// Get a project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await req.prisma.project.findUnique({
      where: { id },
      include: {
        issues: {
          include: {
            assignee: true,
            reporter: true
          }
        }
      }
    });
   
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
   
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
// Update a project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, key, description, code } = req.body;
   
    const project = await req.prisma.project.update({
      where: { id },
      data: {
        name,
        key,
        description,
        code
      }
    });
   
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
// Delete a project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find all issues for this project
    const issues = await req.prisma.issue.findMany({ where: { projectId: id } });
    const issueIds = issues.map(issue => issue.id);

    // 2. Delete all comments for these issues
    if (issueIds.length > 0) {
      await req.prisma.comment.deleteMany({ where: { issueId: { in: issueIds } } });
    }

    // 3. Delete all issues for this project
    await req.prisma.issue.deleteMany({ where: { projectId: id } });

    // 4. Delete the project itself
    await req.prisma.project.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
// Patch a project (partial update)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
   
    // Filter out undefined values so they don't override existing data
    Object.keys(updateData).forEach(key =>
      updateData[key] === undefined && delete updateData[key]
    );
   
    const project = await req.prisma.project.update({
      where: { id },
      data: updateData
    });
   
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
module.exports = router;
