const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jira_clone_secret';

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/avatars');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: userId_timestamp.extension
    const userId = req.params.id;
    const extension = path.extname(file.originalname);
    const filename = `${userId}_${Date.now()}${extension}`;
    cb(null, filename);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * Users API
 * @route /api/users
 */

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await req.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        // Don't include password in the response
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a user
router.post('/', async (req, res) => {
  try {
    const { name, email, password, avatar, role } = req.body;

    // Check if name or email already exists
    const existingUser = await req.prisma.user.findFirst({
      where: {
        OR: [
          { name },
          { email }
        ]
      }
    });
    if (existingUser) {
      let field = existingUser.name === name ? 'name' : 'email';
      return res.status(400).json({ error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please choose a different ${field}.` });
    }

    // In a real application, you would hash the password here
    const user = await req.prisma.user.create({
      data: {
        name,
        email,
        password, // Should be hashed in production
        avatar,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        // Don't include password in the response
      }
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
   
    const user = await req.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        // Don't include password in the response
        issues: true,
        reporter: true,
        comments: true
      }
    });
   
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
   
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, avatar, role } = req.body;
   
    // In a real application, you would hash the password here if it's being updated
   
    const user = await req.prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        password, // Should be hashed in production
        avatar,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        // Don't include password in the response
      }
    });
   
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Patch a user (partial update)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, avatar } = req.body;

    // Build update data object with only defined fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) {
      // In a real application, you would hash the password here
      updateData.password = password; // Should be hashed in production
    }
    if (avatar !== undefined) updateData.avatar = avatar;
   
    const user = await req.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        // Don't include password in the response
      }
    });
   
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
   
    await req.prisma.user.delete({
      where: { id }
    });
   
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload avatar route
router.post('/:id/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params;
   
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
   
    // Generate the avatar URL (will be accessible via /uploads/avatars/filename)
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
   
    // Update user's avatar in database
    const user = await req.prisma.user.update({
      where: { id },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        role: true,
      }
    });
   
    res.json({
      message: 'Avatar uploaded successfully',
      user,
      avatarUrl
    });
  } catch (error) {
    // If there's an error, delete the uploaded file to avoid orphaned files
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (unlinkError) => {
        if (unlinkError) console.error('Error deleting file:', unlinkError);
      });
    }
    res.status(500).json({ error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await req.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        role: true
      }
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    // In production, use bcrypt to compare hashed passwords
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;
    // Create JWT token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
