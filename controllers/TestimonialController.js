const BaseController = require('./BaseController.js');
const TestimonialRepo = require('../repos/TestimonialRepo.js');
const TestimonialValidator = require('../validators/TestimonialValidator.js');

class TestimonialController extends BaseController {
    constructor() {
        super();
    }

    // Get all testimonials
    getAllTestimonials = async (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;
            const pagination = {
                limit: parseInt(limit),
                offset: parseInt(offset),
            };

            // Define custom query for pagination
            const customQuery = {
                ...pagination,
            };

            // Fetch testimonials
            const testimonials = await TestimonialRepo.findTestimonials(customQuery);

            if (testimonials.length === 0) {
                return this.errorResponse(404, res, 'No testimonials found');
            }

            // Pagination metadata
            const totalTestimonials = await TestimonialRepo.count();
            const totalPages = Math.ceil(totalTestimonials / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            const response = {
                testimonials,
                pagination: {
                    totalTestimonials,
                    totalPages,
                    currentPage: parseInt(page),
                    limit: parseInt(limit),
                    hasNextPage,
                    hasPrevPage,
                },
            };

            return this.successResponse(
                200,
                res,
                response,
                'Testimonials retrieved successfully'
            );
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            return this.serverErrorResponse(res, 'Failed to retrieve testimonials');
        }
    };

    // Create a new testimonial
    createTestimonial = async (req, res) => {
        const validationResult = TestimonialValidator.validateCreateTestimonial(req.body);

        if (!validationResult.status) {
            return this.validationErrorResponse(res, validationResult.message);
        }

        const { text, name, img_url, designation, videoUrl } = req.body;

        try {
            // Create the new testimonial
            const testimonial = await TestimonialRepo.createTestimonial({
                text,
                name,
                img_url,
                designation,
                videoUrl
            });

            return this.successResponse(
                201,
                res,
                testimonial,
                'Testimonial created successfully'
            );
        } catch (error) {
            console.error('Error creating testimonial:', error);
            return this.serverErrorResponse(res, 'Failed to create testimonial');
        }
    };

    // Update an existing testimonial
    updateTestimonial = async (req, res) => {
        const validationResult = TestimonialValidator.validateCreateTestimonial(req.body);

        if (!validationResult.status) {
            return this.validationErrorResponse(res, validationResult.message);
        }

        const { id } = req.params;
        const { text, name, img_url, designation, videoUrl } = req.body;

        try {
            // Check if the testimonial exists
            const testimonial = await TestimonialRepo.findTestimonial({ where: { id } });

            if (!testimonial) {
                return this.errorResponse(404, res, 'Testimonial not found');
            }

            // Update the testimonial
            const updatedTestimonial = await TestimonialRepo.updateTestimonial(
                { text, name, img_url, designation, videoUrl },
                { where: { id } }
            );

            return this.successResponse(
                200,
                res,
                updatedTestimonial,
                'Testimonial updated successfully'
            );
        } catch (error) {
            console.error('Error updating testimonial:', error);
            return this.serverErrorResponse(res, 'Failed to update testimonial');
        }
    };

    deleteTestimonial = async (req, res) => {
        const { id } = req.params;

        try {
            // Check if the testimonial exists
            const testimonial = await TestimonialRepo.findTestimonial({ where: { id } });

            if (!testimonial) {
                return this.errorResponse(404, res, "Testimonial not found");
            }

            // Delete the testimonial
            await TestimonialRepo.deleteTestimonial({ where: { id } });

            return this.successResponse(200, res, null, "Testimonial deleted successfully");
        } catch (error) {
            console.error("Error deleting testimonial:", error);
            return this.serverErrorResponse(res, "Failed to delete testimonial");
        }
    };
}

module.exports = new TestimonialController();