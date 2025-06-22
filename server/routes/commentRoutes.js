const express = require('express');
const router = express.Router();

/**
 * Comments API
 * @route /api/comments
 */

// Get all comments
router.get('/', async (req, res) => {
  try {
    const comments = await req.prisma.comment.findMany({
      include: {
        issue: true,
        user: true
      }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a comment
router.post('/', async (req, res) => {
  try {
    const { content, issueId, userId } = req.body; 
    const comment = await req.prisma.comment.create({
      data: {
        content,
        issue: {
          connect: { id: issueId }
        },
        user: {
          connect: { id: userId }
        }
      },
      include: {
        issue: true,
        user: true
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get comments for an issue
router.get('/issue/:issueId', async (req, res) => {
  try {
    const { issueId } = req.params;

    const comments = await req.prisma.comment.findMany({
      where: {
        issueId
      },
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get comments for a project (via issues)
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const comments = await req.prisma.comment.findMany({
      where: {
        issue: {
          projectId: projectId
        }
      },
      include: {
        user: true,
        issue: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a comment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await req.prisma.comment.findUnique({
      where: { id },
      include: {
        issue: true,
        user: true
      }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a comment fully
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await req.prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        issue: true,
        user: true
      }
    });

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a comment partially
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const updateData = {};
    if (content !== undefined) updateData.content = content;

    const comment = await req.prisma.comment.update({
      where: { id },
      data: updateData,
      include: {
        issue: true,
        user: true
      }
    });

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a comment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await req.prisma.comment.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
