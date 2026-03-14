require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const { setIO } = require('./socket');
const { protect } = require('./middleware/authMiddleware');

const authRoutes = require('./routes/authRoutes');
const loanRoutes = require('./routes/loanRoutes');
const offerRoutes = require('./routes/offerRoutes');
const messageRoutes = require('./routes/messageRoutes');
const repaymentRoutes = require('./routes/repaymentRoutes');
const documentRoutes = require('./routes/documentRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/repayments', repaymentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => res.status(200).send('OK'));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI;

const startServer = async () => {
  try {
    let uri = MONGO_URI;
    if (!uri) {
      console.log('No MONGO_URI provided, starting in-memory MongoDB for testing...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    }

    await mongoose.connect(uri);
    console.log(`Connected to MongoDB at ${uri}`);

    const io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PATCH']
      }
    });

    io.on('connection', (socket) => {
      const { userId } = socket.handshake.auth || {};
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    setIO(io);

    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
};

startServer();
