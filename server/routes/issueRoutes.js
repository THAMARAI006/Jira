// --- Backend: routes/issues.js ---
const express = require('express');
const router = express.Router();

// Get all issues
router.get('/', async (req, res) => {
  try {
    const issues = await req.prisma.issue.findMany({
      include: {
        project: true,
        assignee: true,
        reporter: true,
        comments: true,
      }
    });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create an issue
router.post('/', async (req, res) => {
  try {
    const { title, description, type, status, priority, projectId, assigneeId, reporterId, code } = req.body;

    const issue = await req.prisma.issue.create({
      data: {
        title,
        description,
        type,
        status,
        priority,
        code,
        project: { connect: { id: projectId } },
        assignee: assigneeId ? { connect: { id: assigneeId } } : undefined,
        reporter: { connect: { id: reporterId } }
      },
      include: {
        project: true,
        assignee: true,
        reporter: true
      }
    });

    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get issue by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await req.prisma.issue.findUnique({
      where: { id },
      include: {
        project: true,
        assignee: true,
        reporter: true,
        comments: { include: { user: true } }
      }
    });

    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an issue
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, status, priority, assigneeId, code } = req.body;

    const issue = await req.prisma.issue.update({
      where: { id },
      data: {
        title,
        description,
        type,
        status,
        priority,
        code,
        assignee: assigneeId ? { connect: { id: assigneeId } } : { disconnect: true }
      },
      include: {
        project: true,
        assignee: true,
        reporter: true
      }
    });

    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an issue
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await req.prisma.issue.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Patch issue (partial update)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, status, priority, assigneeId, projectId } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assigneeId !== undefined) updateData.assignee = assigneeId ? { connect: { id: assigneeId } } : { disconnect: true };
    if (projectId !== undefined) updateData.project = { connect: { id: projectId } };

    const issue = await req.prisma.issue.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
        assignee: true,
        reporter: true,
        comments: { include: { user: true } }
      }
    });
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// You should also ensure to mount this in your server.js or app.js like so:
// app.use('/api/issues', require('./routes/issues'));