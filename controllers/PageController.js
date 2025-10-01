const BaseController = require('./BaseController.js');
const PageRepo = require('../repos/PageRepo.js');
const PageValidator = require('../validators/PageValidator.js');
const slugify = require('slugify');

class PageController extends BaseController {
    constructor() {
        super();
    }

    // GET: Retrieve a page by its slug (privacy-policy or terms-conditions)
    getPageBySlug = async (req, res) => {
        const { slug } = req.params;

        try {
            const page = await PageRepo.findPageBySlug(slug);

            if (!page) {
                return this.errorResponse(404, res, `${slug} not found`);
            }

            return this.successResponse(200, res, page, `${slug} retrieved successfully`);
        } catch (error) {
            console.error('Error fetching page:', error);
            return this.serverErrorResponse(res, 'Failed to retrieve page');
        }
    };

    // POST: Create or update the Privacy Policy or Terms & Conditions page
    createOrUpdatePage = async (req, res) => {
        const { title, content } = req.body;

        // Generate slug from the title
        const slug = slugify(title, { lower: true });

        const validationResult = PageValidator.validateCreateOrUpdatePage(req.body);

        if (!validationResult.status) {
            return this.validationErrorResponse(res, validationResult.message);
        }

        if (!content) {
            return this.validationErrorResponse(res, 'Content is required');
        }

        try {
            // Check if the page already exists
            const existingPage = await PageRepo.findPageBySlug(slug);

            if (existingPage) {
                // If page exists, update it
                const updatedPage = await PageRepo.updatePage({ content, slug }, slug);
                return this.successResponse(200, res, updatedPage, 'Page updated successfully');
            } else {
                // If no page exists, create it
                const newPage = await PageRepo.createPage({ title, content, slug });
                return this.successResponse(201, res, newPage, 'Page created successfully');
            }
        } catch (error) {
            console.error('Error creating/updating page:', error);
            return this.serverErrorResponse(res, 'Failed to create or update page');
        }
    };

    // DELETE: Delete a page by its slug
    deletePageSlug = async (req, res) => {
        const { slug } = req.params;

        try {
            // Find the page by its slug
            const page = await PageRepo.findPageBySlug(slug);

            if (!page) {
                return this.errorResponse(404, res, 'Page not found');
            }

            // Delete the page by slug
            await PageRepo.deletePage({ slug });

            return this.successResponse(200, res, null, 'Page deleted successfully');
        } catch (error) {
            console.error('Error deleting page:', error);
            return this.serverErrorResponse(res, 'Failed to delete page');
        }
    };

    // GET: Get all page titles
    getAllPageTitles = async (req, res) => {
        try {
            const titles = await PageRepo.getAllPageTitles();

            if (!titles || titles.length === 0) {
                return this.errorResponse(404, res, 'No page titles found');
            }

            return this.successResponse(200, res, titles, 'Page titles retrieved successfully');
        } catch (error) {
            console.error('Error fetching page titles:', error);
            return this.serverErrorResponse(res, 'Failed to retrieve page titles');
        }
    };

}

module.exports = new PageController();