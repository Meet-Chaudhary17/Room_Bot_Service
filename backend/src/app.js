import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import staffRoutes from "./routes/staff.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import notFound from "./middleware/notFound.middleware.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

app.use(helmet());
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Base route for health check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Room Bot Service API is running"
    });
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/staff", staffRoutes);
app.use("/api/v1/admin", adminRoutes);

// Wildcard 404 handler
app.use(notFound);

// Global Error handler
app.use(errorHandler);

export default app;