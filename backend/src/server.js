import dotenv from "dotenv";
import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initSocketServer } from "./config/socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
    await connectDB();

    const server = http.createServer(app);
    initSocketServer(server);

    server.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

startServer();