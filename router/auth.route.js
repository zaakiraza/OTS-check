const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const UserRepo = require("../repos/UserRepo.js");

const router = express.Router();

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      // Generate JWT token
      const tokenObj = {
        id: req.user.id,
        email: req.user.email,
        username: req.user.username,
        phone: req.user.phone,
        roleId: req.user.roleId,
        emailVerified: req.user.emailVerified,
      };

      const token = jwt.sign(tokenObj, process.env.SECRET_KEY, {
        expiresIn: "1d",
      });

      // Remove sensitive data
      delete req.user.dataValues.password;
      delete req.user.dataValues.resetCode;
      delete req.user.dataValues.resetCodeExpiresAt;

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(
        `${frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(
          JSON.stringify(req.user)
        )}`
      );
    } catch (error) {
      console.error("Google OAuth callback error:", error);
      res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/login?error=authentication_failed`
      );
    }
  }
);

// API endpoint for Google Sign-in (for mobile apps)
router.post("/google/signin", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "ID token is required",
      });
    }

    // Verify the Google ID token
    const { OAuth2Client } = require("google-auth-library");
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user already exists with this Google ID
    let user = await UserRepo.findUser({
      where: { googleId },
    });

    if (user) {
      // User exists, generate token
      const tokenObj = {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        roleId: user.roleId,
        emailVerified: user.emailVerified,
      };

      const token = jwt.sign(tokenObj, process.env.SECRET_KEY, {
        expiresIn: "1d",
      });

      delete user.dataValues.password;
      delete user.dataValues.resetCode;
      delete user.dataValues.resetCodeExpiresAt;

      return res.json({
        success: true,
        message: "Login successful",
        data: { user, token },
      });
    }

    // Check if user exists with same email
    user = await UserRepo.findUser({
      where: { email },
    });

    if (user) {
      // User exists with same email, link Google account
      user.googleId = googleId;
      user.emailVerified = true;
      await user.save();

      const tokenObj = {
        id: user.id,
        email: user.email,
        username: user.username,
        phone: user.phone,
        roleId: user.roleId,
        emailVerified: user.emailVerified,
      };

      const token = jwt.sign(tokenObj, process.env.SECRET_KEY, {
        expiresIn: "1d",
      });

      delete user.dataValues.password;
      delete user.dataValues.resetCode;
      delete user.dataValues.resetCodeExpiresAt;

      return res.json({
        success: true,
        message: "Login successful",
        data: { user, token },
      });
    }

    // Create new user
    const RoleRepo = require("../repos/RoleRepo.js");
    const { ROLES } = require("../constants/constants.js");
    const studentRole = await RoleRepo.findRole({
      where: { name: ROLES.STUDENT },
    });

    const newUser = await UserRepo.createUser({
      googleId,
      email,
      username: name || email.split("@")[0],
      firstName: name?.split(" ")[0] || "",
      lastName: name?.split(" ").slice(1).join(" ") || "",
      imageUrl: picture || null,
      roleId: studentRole.id,
      emailVerified: true,
      password: null,
    });

    const tokenObj = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      phone: newUser.phone,
      roleId: newUser.roleId,
      emailVerified: newUser.emailVerified,
    };

    const token = jwt.sign(tokenObj, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    delete newUser.dataValues.password;
    delete newUser.dataValues.resetCode;
    delete newUser.dataValues.resetCodeExpiresAt;

    res.json({
      success: true,
      message: "User created and login successful",
      data: { user: newUser, token },
    });
  } catch (error) {
    console.error("Google Sign-in error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
});

module.exports = router;
