const app = require("./app");
const PORT = process.env.PORT || 5003;

// If run directly (e.g. `node server.js`) start the server.
// If imported (e.g. by Vercel's @vercel/node runtime) just export the app.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;