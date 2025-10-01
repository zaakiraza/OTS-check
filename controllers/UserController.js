const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const BaseController = require("./BaseController.js");
const UserRepo = require("../repos/UserRepo.js");
const { ROLES } = require("../constants/constants.js");
const UserValidator = require("../validators/UserValidator.js");
const RoleRepo = require("../repos/RoleRepo.js");
const sendMail = require("../utils/mailer.js");
const db = require("../models/index.js");

class UserController extends BaseController {
  constructor() {
    super();
  }

  registerUser = async (req, res) => {
    const result = UserValidator.validateRegisterUser(req.body);
    if (!result.status) {
      return this.validationErrorResponse(
        res,
        result?.message || "Invalid data"
      );
    }

    const { email, username, roleName, password, phone, rememberMe } =
      result.data;

    const existingUser = await UserRepo.findUser({
      where: { email },
    });
    if (existingUser) {
      return this.errorResponse(
        400,
        res,
        "User already exists with this email"
      );
    }

    const saltRounds = parseInt(process.env.SALT_ROUNDS);
    const salt = bcrypt.genSaltSync(saltRounds);

    const [hashedPassword, role] = await Promise.all([
      bcrypt.hash(password, salt),
      RoleRepo.findRole({
        where: {
          name: roleName,
        },
      }),
    ]);

    // ✅ Generate 4-digit OTP
    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
    const resetCodeExpiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 min expiry

    const userObj = {
      email,
      username: username || "",
      password: hashedPassword,
      roleId: role.id,
      resetCode,
      resetCodeExpiresAt,
      emailVerified: false,
    };
    // Check if phone number is provided
    if (phone) {
      userObj.phone = phone;
    }

    const user = await UserRepo.createUser(userObj);

    const expiresIn = rememberMe ? "30d" : "1d";

    delete user.dataValues.password;
    delete user.dataValues.resetCode;
    delete user.dataValues.resetCodeExpiresAt;

    const tokenObj = {
      id: user.id,
      email: user.email,
      username: user?.username || "",
      phone: user?.phone || "",
      roleId: user.roleId,
    };

    const token = jwt.sign(tokenObj, process.env.SECRET_KEY, {
      expiresIn,
    });

    // if (rememberMe) {
    //   user.rememberToken = token;
    //   await user.save();
    // }

    const emailData = {
      email,
      subject: "Your OTP Verification Code",
      text: `Your OTP code is: ${resetCode}. It will expire in 1 minutes.`,
    };

    await sendMail(emailData.email, emailData.subject, emailData.text);

    return this.successResponse(
      201,
      res,
      { user },
      "User registered successfully and OTP sent to your email."
    );
  };

  //*******Login************

  loginUser = async (req, res) => {
    const result = UserValidator.validateLoginUser(req.body);

    if (!result.status) {
      return this.validationErrorResponse(
        res,
        result?.message || "Invalid credentials"
      );
    }

    const { email, password, rememberMe } = result.data;

    const expiresIn = rememberMe ? "30d" : "1d";

    const user = await UserRepo.findUser({
      where: { email },
    });

    if (!user) {
      return this.errorResponse(401, res, "Invalid Credentials");
    }

    // console.log(user.emailVerified, "line 134");
    // Check if email is verified
    if (!user.emailVerified) {
      return this.errorResponse(
        403,
        res,
        "Email not verified. Please verify your email before logging in.",
        {
          resendOtpAvailable: true,
        }
      );
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return this.errorResponse(401, res, "Invalid credentials");
    }

    const tokenObj = {
      id: user.id,
      email: user.email,
      username: user.username,
      phone: user.phone,
      roleId: user.roleId,
      emailVerified: user.emailVerified,
    };

    const token = jwt.sign(tokenObj, process.env.SECRET_KEY, {
      expiresIn,
    });

    // Store the token in the user record if rememberMe is true
    if (rememberMe) {
      user.rememberToken = token;
      await user.save();
    }

    delete user.dataValues.password;

    return this.successResponse(200, res, { user, token }, "Login successful");
  };

  // ********************** FORGOT PASSWORD **********************
  forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return this.validationErrorResponse(res, "Email is required");
      }

      const user = await UserRepo.findUser({ where: { email } });
      if (!user) {
        return this.errorResponse(401, res, "User not found");
      }

      // Check if email is verified
      if (!user.emailVerified) {
        return this.errorResponse(
          403,
          res,
          "Email not verified. Please verify your email before resetting the password.",
          {
            resendOtpAvailable: true,
          }
        );
      }

      // Generate a reset code valid for 1 minutes
      const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
      const resetCodeExpiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 min expiry

      user.resetCode = resetCode;
      user.resetCodeExpiresAt = resetCodeExpiresAt;
      await user.save();

      const emailData = {
        email,
        subject: "Password Reset Request: Your OTP Verification Code",
        text: `Your OTP code is: ${resetCode}. It will expire in 1 minutes.`,
      };

      await sendMail(emailData.email, emailData.subject, emailData.text);

      return this.successResponse(
        200,
        res,
        {},
        "An OTP has been sent to your email"
      );
    } catch (error) {
      // console.error(error);
      return this.errorResponse(
        500,
        res,
        "An error occurred while processing the request"
      );
    }
  };

  // ********************** RESET PASSWORD **********************
  resetPassword = async (req, res) => {
    const { email } = req.query;
    const { newPassword } = req.body;

    if (!email || !newPassword) {
      return this.validationErrorResponse(
        res,
        "email and password are required"
      );
    }

    // Verify token
    try {
      // const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const user = await UserRepo.findUser({ where: { email } });

      if (!user) {
        return this.errorResponse(400, res, "User not found");
      }

      // Hash the new password
      const saltRounds = parseInt(process.env.SALT_ROUNDS);
      const salt = bcrypt.genSaltSync(saltRounds);
      user.password = await bcrypt.hash(newPassword, salt);
      user.resetCode = null;
      user.resetCodeExpiresAt = null;
      await user.save();

      delete user.dataValues.password;

      return this.successResponse(200, res, {}, "Password reset successfully");
    } catch (error) {
      return this.errorResponse(400, res, "Invalid or expired token");
    }
  };

  //******************OTP Verification***************** */
  verifyOtp = async (req, res) => {
    const { otp, email } = req.body;

    if (!email || !otp) {
      return this.validationErrorResponse(res, "Email and OTP are required.");
    }

    const user = await UserRepo.findUser({ where: { email } });

    if (!user) {
      return this.errorResponse(404, res, "User not found.");
    }

    const now = new Date();

    if (
      user.resetCode !== otp ||
      !user.resetCodeExpiresAt ||
      now > new Date(user.resetCodeExpiresAt)
    ) {
      return this.errorResponse(400, res, "Invalid or expired OTP.");
    }

    // ✅ OTP is valid, clear it from DB and set emailVerified to true
    user.resetCode = null;
    user.resetCodeExpiresAt = null;
    user.emailVerified = true;
    await user.save();

    return this.successResponse(200, res, null, "OTP verified successfully.");
  };

  getLoggedInUser = async (req, res) => {
    try {
      // Get user ID from the authenticated request
      const userId = req.user.id;

      // Find the user with all details including educational info and courses
      const user = await UserRepo.findUser({
        where: { id: userId },
        attributes: {
          exclude: ["password", "resetCode", "resetCodeExpiresAt"],
        }, // Exclude sensitive data
        include: [
          {
            model: db.Role,
            as: "role",
            attributes: ["id", "name"],
          },
          {
            model: db.EducationalInfo,
            as: "educationalInfo",
          },
          // {
          //   model: db.Course,
          //   as: "courses",
          // },
        ],
      });

      if (!user) {
        return this.errorResponse(404, res, "User not found");
      }

      return this.successResponse(
        200,
        res,
        user,
        "User data retrieved successfully"
      );
    } catch (error) {
      // console.error("Error fetching user data:", error);
      return this.serverErrorResponse(res, "Failed to retrieve user data");
    }
  };

  getAllUsers = async (req, res) => {
    try {
      // Extract query parameters
      const {
        page = 1,
        limit = 10,
        search = "",
        sortBy = "createdAt",
        sortOrder = "DESC",
        roleId: filterRoleId,
      } = req.query;

      // Build the query
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Build where clause
      const whereClause = {};

      // Add search functionality
      if (search) {
        whereClause[db.Sequelize.Op.or] = [
          { email: { [db.Sequelize.Op.like]: `%${search}%` } },
          { username: { [db.Sequelize.Op.like]: `%${search}%` } },
          { firstName: { [db.Sequelize.Op.like]: `%${search}%` } },
          { lastName: { [db.Sequelize.Op.like]: `%${search}%` } },
          { phone: { [db.Sequelize.Op.like]: `%${search}%` } },
        ];
      }

      // Add role filter
      if (filterRoleId) {
        whereClause.roleId = filterRoleId;
      }

      // Execute query with pagination
      const { count, rows: users } = await UserRepo.findAndCountUsers({
        where: whereClause,
        attributes: {
          exclude: ["password", "resetCode", "resetCodeExpiresAt"],
        },
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: offset,
        include: [
          {
            model: db.Role,
            as: "role",
            attributes: ["id", "name"],
          },
        ],
      });

      // Calculate pagination metadata
      const totalPages = Math.ceil(count / parseInt(limit));
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return this.successResponse(
        200,
        res,
        {
          users,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages,
            hasNextPage,
            hasPrevPage,
          },
        },
        "Users retrieved successfully"
      );
    } catch (error) {
      // console.error("Error fetching users:", error);
      return this.serverErrorResponse(res, "Failed to retrieve users");
    }
  };

  resendOtp = async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return this.validationErrorResponse(res, "Email is required");
      }

      const user = await UserRepo.findUser({ where: { email } });
      if (!user) {
        return this.errorResponse(404, res, "User not found");
      }

      // Generate a new OTP code valid for 1 minute
      const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
      const resetCodeExpiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 min expiry

      user.resetCode = resetCode;
      user.resetCodeExpiresAt = resetCodeExpiresAt;
      await user.save();

      const emailData = {
        email,
        subject: "Your New OTP Verification Code",
        text: `Your new OTP code is: ${resetCode}. It will expire in 1 minute.`,
      };

      await sendMail(emailData.email, emailData.subject, emailData.text);

      return this.successResponse(
        200,
        res,
        {},
        "A new OTP has been sent to your email"
      );
    } catch (error) {
      // console.error("Error resending OTP:", error);
      return this.serverErrorResponse(res, "Failed to resend OTP");
    }
  };

  adminLogin = async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate request
      if (!email || !password) {
        return this.validationErrorResponse(
          res,
          "Email and password are required"
        );
      }

      // get Admin role
      const adminRole = await RoleRepo.findRole({
        where: {
          name: [ROLES.ADMIN, ROLES.SUPER_ADMIN],
        },
      });

      // Find user by email
      const user = await UserRepo.findUser({
        where: {
          email,
          emailVerified: true,
          roleId: adminRole.id,
        },
        include: [
          {
            model: db.Role,
            as: "role",
            attributes: ["id", "name"],
          },
        ],
      });

      if (!user) {
        return this.errorResponse(401, res, "Invalid credentials");
      }

      // Check if user has admin role
      if (
        !user.role ||
        (user.role.name !== ROLES.ADMIN && user.role.name !== ROLES.SUPER_ADMIN)
      ) {
        return this.errorResponse(
          403,
          res,
          "Access denied. Admin privileges required."
        );
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return this.errorResponse(401, res, "Invalid credentials");
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          roleId: user.roleId,
          role: user.role.name,
          emailVerified: user.emailVerified,
        },
        process.env.SECRET_KEY,
        { expiresIn: "1d" }
      );

      // Return user data and token
      delete user.dataValues.password;
      delete user.dataValues.resetCode;
      delete user.dataValues.resetCodeExpiresAt;

      return this.successResponse(
        200,
        res,
        { user, token },
        "Admin login successful"
      );
    } catch (error) {
      // console.error("Admin login error:", error);
      return this.serverErrorResponse(res, "Login failed");
    }
  };

  // Delete user
  deleteUser = async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return this.validationErrorResponse(res, "Valid user ID is required");
      }

      // Find user first to check if it exists
      const user = await UserRepo.findUser({
        where: { id },
      });

      if (!user) {
        return this.errorResponse(404, res, "User not found");
      }

      // // Prevent deletion of super admin accounts
      // const superAdminRole = await RoleRepo.findRole({
      //   where: { name: ROLES.SUPER_ADMIN }
      // });

      const [superAdminRole, adminRole] = await Promise.all([
        RoleRepo.findRole({
          where: { name: ROLES.SUPER_ADMIN },
        }),
        RoleRepo.findRole({
          where: { name: ROLES.ADMIN },
        }),
      ]);

      if (user.roleId === superAdminRole.id || user.roleId === adminRole.id) {
        return this.errorResponse(
          403,
          res,
          "Super admin or admin accounts cannot be deleted"
        );
      }

      // Don't let users delete other users unless they are admins
      // if (req.user.roleId !== superAdminRole.id && req.user.id !== parseInt(id)) {
      //   return this.errorResponse(403, res, "You don't have permission to delete this user");
      // }

      await UserRepo.deleteUser({ where: { id } });

      return this.successResponse(200, res, null, "User deleted successfully");
    } catch (error) {
      // console.error("Error deleting user:", error);
      return this.serverErrorResponse(res, "Failed to delete user");
    }
  };

  // ****************** CHANGE PASSWORD **********************
  changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Validate request
    if (!currentPassword || !newPassword) {
      return this.validationErrorResponse(
        res,
        "Current password and new password are required."
      );
    }

    const userId = req.user.id; // Assuming the user ID is available from the JWT token

    try {
      // Find the user in the database
      const user = await UserRepo.findUser({
        where: { id: userId },
      });

      if (!user) {
        return this.errorResponse(404, res, "User not found.");
      }

      // Compare the current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        return this.errorResponse(401, res, "Current password is incorrect.");
      }

      // Hash the new password
      const saltRounds = parseInt(process.env.SALT_ROUNDS);
      const salt = bcrypt.genSaltSync(saltRounds);
      user.password = await bcrypt.hash(newPassword, salt);

      // Save the updated user record
      await user.save();

      // Remove sensitive data from the response
      delete user.dataValues.password;

      return this.successResponse(
        200,
        res,
        {},
        "Password changed successfully."
      );
    } catch (error) {
      // console.error("Error changing password:", error);
      return this.serverErrorResponse(
        res,
        "An error occurred while changing the password."
      );
    }
  };

  updateProfile = async (req, res) => {
    try {
      const userId = req.user.id; // Get user ID from authenticated token

      const validationResult = UserValidator.validateUpdateProfile(req.body);
      if (!validationResult.status) {
        return this.validationErrorResponse(res, validationResult.message);
      }

      const {
        firstName,
        lastName,
        dob,
        gender,
        imageUrl,
        city,
        country,
        youAre,
        educationalInfo,
      } = validationResult.data;

      // Start a transaction
      const transaction = await db.sequelize.transaction();

      try {
        // 1. Update user profile
        const userUpdateData = {};
        if (firstName !== undefined) userUpdateData.firstName = firstName;
        if (lastName !== undefined) userUpdateData.lastName = lastName;
        // if (username !== undefined) userUpdateData.username = username;
        if (dob !== undefined) userUpdateData.dob = dob;
        if (gender !== undefined) userUpdateData.gender = gender;
        if (imageUrl !== undefined) userUpdateData.imageUrl = imageUrl;
        // if (qualification !== undefined) userUpdateData.qualification = qualification;
        // if (designation !== undefined) userUpdateData.designation = designation;
        if (youAre !== undefined) userUpdateData.youAre = youAre;
        if (city !== undefined) userUpdateData.city = city;
        if (country !== undefined) userUpdateData.country = country;

        // Only update user if there are fields to update
        if (Object.keys(userUpdateData).length > 0) {
          await UserRepo.update(userUpdateData, {
            where: { id: userId },
            transaction,
          });
        }

        // 2. Handle educational info updates if provided
        if (educationalInfo) {
          // Get existing educational info record
          const existingEducInfo = await db.EducationalInfo.findOne({
            where: { userId },
            transaction,
          });

          // Process educational info as a single object
          // console.log("Processing Educational Info:", educationalInfo);
          if (existingEducInfo) {
            // Update existing record
            await db.EducationalInfo.update(
              {
                className: educationalInfo?.className || null,
                institutionType: educationalInfo?.institutionType || null,
                institutionName: educationalInfo?.institutionName || null,
                boardSystem: educationalInfo?.boardSystem || null,
                passingYear: educationalInfo?.passingYear || null,
                isCurrentEducation: educationalInfo?.isCurrentEducation || null,
              },
              {
                where: { id: existingEducInfo.id, userId },
                transaction,
              }
            );
          } else {
            // Create new record
            await db.EducationalInfo.create(
              {
                userId,
                className: educationalInfo?.className || null,
                institutionType: educationalInfo?.institutionType || null,
                institutionName: educationalInfo?.institutionName || null,
                boardSystem: educationalInfo?.boardSystem || null,
                passingYear: educationalInfo?.passingYear || null,
                isCurrentEducation: educationalInfo?.isCurrentEducation || null,
              },
              { transaction }
            );
          }
        }

        // 3. Handle courses updates if provided
        // if (courses && courses.length > 0) {
        //   // Get existing course records
        //   const existingCourses = await db.Course.findAll({
        //     where: { userId },
        //     transaction
        //   });

        //   const existingIds = existingCourses.map(course => course.id);
        //   const incomingIds = courses
        //     .filter(course => course.id)
        //     .map(course => course.id);

        //   // IDs to delete (exist in DB but not in incoming data)
        //   const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));

        //   // Delete removed records
        //   if (idsToDelete.length > 0) {
        //     await db.Course.destroy({
        //       where: { id: idsToDelete, userId },
        //       transaction
        //     });
        //   }

        //   // Process each course item
        //   for (const course of courses) {
        //     if (course.id) {
        //       // Update existing record
        //       await db.Course.update(
        //         {
        //           courseName: course?.courseName || null,
        //           institutionName: course?.institutionName || null,
        //           startDate: course?.startDate || null,
        //           endDate: course?.endDate || null,
        //           certificateUrl: course?.certificateUrl || null,
        //           isCompleted: course?.isCompleted || null
        //         },
        //         {
        //           where: { id: course.id, userId },
        //           transaction
        //         }
        //       );
        //     } else {
        //       // Create new record
        //       await db.Course.create(
        //         {
        //           userId,
        //           courseName: course?.courseName || null,
        //           institutionName: course?.institutionName || null,
        //           startDate: course?.startDate || null,
        //           endDate: course?.endDate || null,
        //           certificateUrl: course?.certificateUrl || null,
        //           isCompleted: course?.isCompleted || null
        //         },
        //         { transaction }
        //       );
        //     }
        //   }
        // }

        // Commit transaction
        await transaction.commit();

        // Fetch updated user data with associations
        const updatedUser = await UserRepo.findUser({
          where: { id: userId },
          include: [
            {
              model: db.Role,
              as: "role",
              attributes: ["id", "name"],
            },
            {
              model: db.EducationalInfo,
              as: "educationalInfo",
            },
            // {
            //   model: db.Course,
            //   as: 'courses'
            // }
          ],
        });

        // Remove sensitive data
        delete updatedUser?.dataValues?.password;
        delete updatedUser?.dataValues?.resetCode;
        delete updatedUser?.dataValues?.resetCodeExpiresAt;

        return this.successResponse(
          200,
          res,
          { user: updatedUser },
          "Profile updated successfully"
        );
      } catch (error) {
        // Rollback transaction in case of error
        // console.log("Transaction error:", error);
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      // console.error("Error updating profile:", error);
      return this.serverErrorResponse(res, "Failed to update profile");
    }
  };
}

module.exports = new UserController();
