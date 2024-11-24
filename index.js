const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

const app = express();
const PORT = 3000;
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const RATE_LIMIT = parseInt(process.env.RATE_LIMIT, 10) || 5;

// Update rate limiter configuration
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: RATE_LIMIT,
    message: {
        error: `Rate limit exceeded. You can make up to ${RATE_LIMIT} requests per minute.`
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});
// Route: Get quotes by a specific author
app.get('/quote/author/:author', (req, res) => {
    const author = req.params.author.toLowerCase();
    const filteredQuotes = quotes.filter(q => q.author.toLowerCase() === author);

    if (filteredQuotes.length > 0) {
        // Exclude "type" field
        const result = filteredQuotes.map(({ quote, author }) => ({ quote, author }));
        res.json(result);
    } else {
        res.status(404).json({ error: "No quotes found for the specified author." });
    }
});
// Route: Get a random quote by type
app.get('/quote/type/:type', (req, res) => {
    const type = req.params.type.toLowerCase();
    const filteredQuotes = quotes.filter(q => q.type.toLowerCase() === type);

    if (filteredQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        const { quote, author } = filteredQuotes[randomIndex];
        res.json({ quote, author });
    } else {
        res.status(404).json({ error: "No quotes found for the specified type." });
    }
});
// Route: Paginated quotes by author
app.get('/quote/author/:author/page/:page', (req, res) => {
    const author = req.params.author.toLowerCase();
    const page = parseInt(req.params.page, 10) || 1;
    const limit = 5; // Quotes per page
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const filteredQuotes = quotes.filter(q => q.author.toLowerCase() === author);
    if (filteredQuotes.length > 0) {
        const paginatedQuotes = filteredQuotes.slice(startIndex, endIndex).map(({ quote, author }) => ({ quote, author }));
        res.json({
            page,
            total: filteredQuotes.length,
            quotes: paginatedQuotes
        });
    } else {
        res.status(404).json({ error: "No quotes found for the specified author." });
    }
});



// Load quotes from quotes.json
const quotes = JSON.parse(fs.readFileSync('quotes.json', 'utf-8'));

// Middleware: Rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        error: "Rate limit exceeded. You can make up to 5 requests per minute."
    }
});

app.use(limiter);

// Route: Get a random quote
app.get('/quote', (req, res) => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const { quote, author } = quotes[randomIndex]; // Exclude "type" field
    res.json({ quote, author });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
