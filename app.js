require("dotenv").config();
require("express-async-errors");
const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const session = require("express-session");
const passport = require("./config/passport.js");
const routes = require("./router/routes.js");
const error = require("./middlewares/error.middleware.js");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configure session for Passport.js
app.use(
  session({
    secret: process.env.SECRET_KEY || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // secure cookies only in prod (requires HTTPS)
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
    },
  })
);

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// // Configure CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "https://edu.offtheschool.io"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// app.use(cors());

// Later we will let the SPA handle the root route (served in SPA fallback)

// Basic health route (quick check without auth)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV || "development", time: new Date().toISOString() });
});

app.use("/api", routes);

app.get("/users", (req, res) => {
  res.json([{ name: "John Doeeeeee" }]);
});

// Simple root route so hitting the bare backend domain gives a friendly message instead of 404
app.get("/", (req, res, next) => {
  // If a frontend build exists we prefer to let static middleware handle it; we'll only answer here if no dist folder.
  if (fs.existsSync(path.join(__dirname, "dist", "index.html"))) return next();
  return res.json({ service: "OffTheSchool Backend", status: "running", docs: "/api/health" });
});

// Ensure you have copied your frontend build output folder (e.g., from Vite/React) to backend root as /dist
const frontendDistPath = path.join(__dirname, "dist");

// Serve raw build folder (so /index.html, /assets/* also work)
if (fs.existsSync(frontendDistPath)) {
  app.use(
    express.static(frontendDistPath, {
      maxAge: "1d",
      extensions: ["html"],
    })
  );

  // Additional mount so assets requested with Vite base '/production-base/' resolve
  app.use(
    "/production-base/assets",
    express.static(path.join(frontendDistPath, "assets"), { maxAge: "1d" })
  );
  // (Optional) direct /assets as well
  app.use(
    "/assets",
    express.static(path.join(frontendDistPath, "assets"), { maxAge: "1d" })
  );

  // SPA fallback: for any non-API route that isn't a static file, send index.html
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    if (req.path.startsWith("/production-base/assets")) return next();
    // Ignore real files (with extension)
    if (path.extname(req.path)) return next();
    return res.sendFile(path.join(frontendDistPath, "index.html"));
  });
} else {
  console.log("[startup] No dist folder found; skipping static frontend serving");
}

app.use(error);

module.exports = app;
