"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorMessage = exports.validationErrorResponse = exports.errorMessageResponse = exports.errorResponse = exports.successResponse = void 0;
const successResponse = (message, data, meta) => ({
    success: true,
    message,
    data,
    meta,
});
exports.successResponse = successResponse;
const errorResponse = (message, error) => {
    // Convert error to proper type
    let errorValue;
    if (typeof error === 'string') {
        errorValue = error;
    }
    else if (Array.isArray(error)) {
        errorValue = error;
    }
    else if (error instanceof Error && error.message) {
        errorValue = error.message;
    }
    else if (error) {
        errorValue = String(error);
    }
    return {
        success: false,
        message,
        error: errorValue,
    };
};
exports.errorResponse = errorResponse;
const errorMessageResponse = (message) => ({
    success: false,
    message,
});
exports.errorMessageResponse = errorMessageResponse;
const validationErrorResponse = (errors) => {
    return {
        success: false,
        message: 'Validation failed',
        error: Array.isArray(errors) ? errors : [errors],
    };
};
exports.validationErrorResponse = validationErrorResponse;
// Helper to convert any error to string
const getErrorMessage = (error) => {
    if (typeof error === 'string')
        return error;
    if (error?.message)
        return error.message;
    if (Array.isArray(error))
        return error.join(', ');
    return 'An unknown error occurred';
};
exports.getErrorMessage = getErrorMessage;
//# sourceMappingURL=apiResponse.js.map