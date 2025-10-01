const BaseController = require('./BaseController.js');
const HelpRepo = require('../repos/HelpRepo.js');
const HelpValidator = require('../validators/HelpValidator.js');

class HelpController extends BaseController {
    constructor() {
        super();
    }

    // Get all help submissions
    getAllHelps = async (req, res) => {
        try {
            const { page = 1, limit = 10, emailAddress } = req.query; // Extract email query if exists
            const offset = (page - 1) * limit;
            const pagination = {
                limit: parseInt(limit),
                offset: parseInt(offset),
            };

            // Custom query for pagination and email filter (if email is provided)
            const customQuery = {
                where: emailAddress ? { emailAddress } : {}, // If email is provided, filter by email
                ...pagination, // Add pagination options
            };

            // Fetch help submissions based on the custom query
            const helps = await HelpRepo.findHelps(customQuery);

            if (helps.length === 0) {
                return this.errorResponse(404, res, 'No help submissions found');
            }

            // Pagination metadata
            const totalHelps = await HelpRepo.count({ where: emailAddress ? { emailAddress } : {} }); // Count rows matching the email filter
            const totalPages = Math.ceil(totalHelps / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            const response = {
                helps,
                pagination: {
                    totalHelps,
                    totalPages,
                    currentPage: parseInt(page),
                    limit: parseInt(limit),
                    hasNextPage,
                    hasPrevPage,
                },
            };

            return this.successResponse(200, res, response, 'Help submissions retrieved successfully');
        } catch (error) {
            console.error('Error fetching help submissions:', error);
            return this.serverErrorResponse(res, 'Failed to retrieve help submissions');
        }
    };

    // Get a specific help submission by ID
    getHelpById = async (req, res) => {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return this.validationErrorResponse(res, "Valid help ID is required");
            }

            const help = await HelpRepo.findHelp({ where: { id } });

            if (!help) {
                return this.errorResponse(404, res, "Help submission not found");
            }

            return this.successResponse(200, res, help, "Help submission retrieved successfully");
        } catch (error) {
            console.error("Error fetching help submission:", error);
            return this.serverErrorResponse(res, "Failed to retrieve help submission");
        }
    };

    // Create a new help submission
    createHelp = async (req, res) => {
        const validationResult = HelpValidator.validateCreateHelp(req.body);

        if (!validationResult.status) {
            return this.validationErrorResponse(res, validationResult.message);
        }

        const { firstName, emailAddress, phoneNumber, message, whereDidYouFindUs } = req.body;

        try {
            // Create a new help submission
            const help = await HelpRepo.createHelp({
                firstName,
                emailAddress,
                phoneNumber,
                message,
                whereDidYouFindUs,
            });

            return this.successResponse(201, res, help, 'Help submission created successfully');
        } catch (error) {
            console.error('Error creating help submission:', error);
            return this.serverErrorResponse(res, 'Failed to create help submission');
        }
    };

    // Delete a help submission by ID
    deleteHelp = async (req, res) => {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return this.validationErrorResponse(res, "Valid help ID is required");
            }

            const help = await HelpRepo.findHelp({ where: { id } });

            if (!help) {
                return this.errorResponse(404, res, "Help submission not found");
            }

            // Delete the help submission
            await HelpRepo.deleteHelp({ where: { id } });

            return this.successResponse(200, res, null, "Help submission deleted successfully");
        } catch (error) {
            console.error("Error deleting help submission:", error);
            return this.serverErrorResponse(res, "Failed to delete help submission");
        }
    };
}

module.exports = new HelpController();