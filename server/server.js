const express = require('express');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const routes = require('./routes/index');
const path = require('path');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Attach Prisma to each request
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Use routes
app.use('/', routes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});