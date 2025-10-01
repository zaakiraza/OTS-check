const BaseController = require("./BaseController.js");
const FaqRepo = require("../repos/FaqRepo.js");
const FaqValidator = require("../validators/FaqValidator.js");

class FaqController extends BaseController {
    constructor() {
        super();
    }

    // Get all FAQs with pagination
    getAllFAQs = async (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;
            const pagination = {
                limit: parseInt(limit),
                offset: parseInt(offset),
            };

            const customQuery = {
                where: {},
                ...pagination,
            };

            const faqs = await FaqRepo.findFaqs(customQuery);
            if (faqs.length === 0) {
                return this.errorResponse(404, res, "No FAQs found");
            }

            const totalFaqs = await FaqRepo.count();
            const totalPages = Math.ceil(totalFaqs / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            const response = {
                faqs,
                pagination: {
                    totalFaqs,
                    totalPages,
                    currentPage: parseInt(page),
                    limit: parseInt(limit),
                    hasNextPage,
                    hasPrevPage,
                },
            };

            return this.successResponse(200, res, response, "FAQs retrieved successfully");
        } catch (error) {
            console.error("Error fetching FAQs:", error);
            return this.serverErrorResponse(res, "Failed to retrieve FAQs");
        }
    };

    // Get FAQ by ID
    getFAQById = async (req, res) => {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return this.validationErrorResponse(res, "Valid FAQ ID is required");
            }

            const faq = await FaqRepo.findFaq({ where: { id } });

            if (!faq) {
                return this.errorResponse(404, res, "FAQ not found");
            }

            return this.successResponse(200, res, faq, "FAQ retrieved successfully");
        } catch (error) {
            console.error("Error fetching FAQ:", error);
            return this.serverErrorResponse(res, "Failed to retrieve FAQ");
        }
    };

    // Create new FAQ
    createFAQ = async (req, res) => {
        try {
            const validationResult = FaqValidator.validateCreateFaq(req.body);

            if (!validationResult.status) {
                return this.validationErrorResponse(res, validationResult.message);
            }

            const { question, answer } = validationResult.data;

            // Check if FAQ with same question already exists
            const existingFaq = await FaqRepo.findFaq({ where: { question } });

            if (existingFaq) {
                return this.errorResponse(409, res, "FAQ with this question already exists");
            }

            const faq = await FaqRepo.createFaq({ question, answer });

            return this.successResponse(201, res, faq, "FAQ created successfully");
        } catch (error) {
            console.error("Error creating FAQ:", error);
            return this.serverErrorResponse(res, "Failed to create FAQ");
        }
    };

    // Update FAQ
    updateFAQ = async (req, res) => {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return this.validationErrorResponse(res, "Valid FAQ ID is required");
            }

            const validationResult = FaqValidator.validateUpdateFaq(req.body);

            if (!validationResult.status) {
                return this.validationErrorResponse(res, validationResult.message);
            }

            const faq = await FaqRepo.findFaq({ where: { id } });

            if (!faq) {
                return this.errorResponse(404, res, "FAQ not found");
            }

            const updatedFAQ = await FaqRepo.updateFaq(validationResult.data, { where: { id } });

            return this.successResponse(200, res, updatedFAQ, "FAQ updated successfully");
        } catch (error) {
            console.error("Error updating FAQ:", error);
            return this.serverErrorResponse(res, "Failed to update FAQ");
        }
    };

    // Delete FAQ
    deleteFAQ = async (req, res) => {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return this.validationErrorResponse(res, "Valid FAQ ID is required");
            }

            const faq = await FaqRepo.findFaq({ where: { id } });

            if (!faq) {
                return this.errorResponse(404, res, "FAQ not found");
            }

            await FaqRepo.deleteFaq({ where: { id } });

            return this.successResponse(200, res, null, "FAQ deleted successfully");
        } catch (error) {
            console.error("Error deleting FAQ:", error);
            return this.serverErrorResponse(res, "Failed to delete FAQ");
        }
    };
}

module.exports = new FaqController();