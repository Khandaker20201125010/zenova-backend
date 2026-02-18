"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponseHelper = void 0;
const http_status_codes_1 = require("http-status-codes");
class ApiResponseHelper {
    static success(res, data, message = 'Success', statusCode = http_status_codes_1.StatusCodes.OK, meta) {
        const response = {
            success: true,
            message,
            data,
            meta,
        };
        return res.status(statusCode).json(response);
    }
    static error(res, message = 'An error occurred', statusCode = http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, errors) {
        const response = {
            success: false,
            message,
            errors,
        };
        return res.status(statusCode).json(response);
    }
    static created(res, data, message = 'Resource created successfully') {
        return this.success(res, data, message, http_status_codes_1.StatusCodes.CREATED);
    }
    static notFound(res, message = 'Resource not found') {
        return this.error(res, message, http_status_codes_1.StatusCodes.NOT_FOUND);
    }
    static badRequest(res, message = 'Bad request', errors) {
        return this.error(res, message, http_status_codes_1.StatusCodes.BAD_REQUEST, errors);
    }
    static unauthorized(res, message = 'Unauthorized') {
        return this.error(res, message, http_status_codes_1.StatusCodes.UNAUTHORIZED);
    }
    static forbidden(res, message = 'Forbidden') {
        return this.error(res, message, http_status_codes_1.StatusCodes.FORBIDDEN);
    }
    static validationError(res, errors) {
        return this.error(res, 'Validation failed', http_status_codes_1.StatusCodes.UNPROCESSABLE_ENTITY, errors);
    }
}
exports.ApiResponseHelper = ApiResponseHelper;
//# sourceMappingURL=response.helper.js.map