const BaseController = require("./BaseController.js");
const RoleRepo = require("../repos/RoleRepo.js");
const { ROLES } = require("../constants/constants.js");

class UserController extends BaseController {
  constructor() {
    super();
  }

  getRoles = async (req, res) => {
    try {
      
      const roles = await RoleRepo.findRoles();
      
      if (!roles || roles.length === 0) {
        return this.notFoundResponse(res, "No roles found");
      }

      const filteredRoles = roles.map(role => {
        // filter Admin and Super Admin roles
        if (role.name !== ROLES.ADMIN && role.name !== ROLES.SUPER_ADMIN) {
          return {
            id: role.id,
            name: role.name,
          };
        }
      }).filter(role => role !== undefined);

      if (filteredRoles.length === 0) {
        return this.notFoundResponse(res, "No roles found");
      }

      return this.successResponse(
        200,
        res,
        {
          roles: filteredRoles,
        },
        "Users retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching roles:", error);
      return this.serverErrorResponse(res, "Failed to retrieve roles");
    }
  };
}

module.exports = new UserController();
