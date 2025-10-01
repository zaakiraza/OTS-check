const RoleRepo = require("../repos/RoleRepo");
const { ROLES } = require("../constants/constants");

// Middleware to check if user has admin privileges
async function isAdmin(req, res, next) {
  try {
    // User should already be authenticated via authenticateToken middleware
    if (!req.user || !req.user.roleId) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized access",
      });
    }

    // Get admin roles
    const adminRoles = await RoleRepo.findRoles({
      where: {
        name: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
      },
    });

    // Extract admin role IDs
    const adminRoleIds = adminRoles.map((role) => role.id);

    // Check if user's role is in the admin roles
    if (!adminRoleIds.includes(req.user.roleId)) {
      return res.status(403).json({
        status: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    // User is an admin, proceed to the next middleware/controller
    next();
  } catch (error) {
    console.error("Error in admin middleware:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
}

module.exports = isAdmin;
