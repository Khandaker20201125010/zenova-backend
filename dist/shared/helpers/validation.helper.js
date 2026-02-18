"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationHelper = void 0;
const zod_1 = require("zod");
const response_helper_1 = require("./response.helper");
class ValidationHelper {
    static validate(schema, data) {
        try {
            const validatedData = schema.parse(data);
            return { success: true, data: validatedData };
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                return { success: false, errors };
            }
            return { success: false, errors: [{ message: 'Validation failed' }] };
        }
    }
    static handleValidationError(res, validationResult) {
        if (!validationResult.success) {
            response_helper_1.ApiResponseHelper.validationError(res, validationResult.errors || []);
            return false;
        }
        return true;
    }
}
exports.ValidationHelper = ValidationHelper;
//# sourceMappingURL=validation.helper.js.map