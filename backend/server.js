const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/api/health', (req, res) => {
	res.json({ message: 'Server is running', timestamp: new Date() });
});

// Sample rooms endpoint
app.get('/api/rooms', (req, res) => {
	const rooms = [
		{ id: 1, name: 'Conference Room A', capacity: 10 },
		{ id: 2, name: 'Conference Room B', capacity: 20 },
		{ id: 3, name: 'Meeting Room', capacity: 6 },
	];
	res.json(rooms);
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
