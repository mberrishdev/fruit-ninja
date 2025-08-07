const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3050;

// Serve static files
app.use(express.static(__dirname));

// Serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🎮 Fruit Ninja Frontend running on http://localhost:${PORT}`);
    console.log(`🔌 Make sure your WebSocket server is running on ws://localhost:3000`);
}); 