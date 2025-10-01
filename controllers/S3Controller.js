const BaseController = require("./BaseController.js");
const S3Service = require("../services/S3Service.js");

class S3Controller extends BaseController {
  constructor() {
    super();
  }

  getSignedUrl = async (req, res) => {
    try {
      const { fileType, fileName } = req.query;

      if (!fileType || !fileName) {
        return this.validationErrorResponse(
          res,
          "fileType and fileName are required"
        );
      }

      const result = await S3Service.generateUploadUrl(fileType, fileName);

      if (!result.status) {
        return this.errorResponse(500, res, result.message);
      }

      return this.successResponse(200, res, result.data, result.message);
    } catch (error) {
      console.error("Error in getSignedUrl:", error);
      return this.serverErrorResponse(res, "Failed to generate signed URL");
    }
  };

  getDownloadUrl = async (req, res) => {
    try {
      const { fileName } = req.query;
      const { expiresIn } = req.query;

      if (!fileName) {
        return this.validationErrorResponse(res, "fileName is required");
      }

      const result = await S3Service.generateDownloadUrl(
        fileName,
        expiresIn ? parseInt(expiresIn) : undefined
      );

      if (!result.status) {
        return this.errorResponse(500, res, result.message);
      }

      return this.successResponse(200, res, result.data, result.message);
    } catch (error) {
      console.error("Error in getDownloadUrl:", error);
      return this.serverErrorResponse(res, "Failed to generate download URL");
    }
  };
}

module.exports = new S3Controller();
