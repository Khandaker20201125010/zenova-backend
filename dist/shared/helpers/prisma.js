"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("./logger"));
const prisma = new client_1.PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'event',
            level: 'error',
        },
        {
            emit: 'event',
            level: 'info',
        },
        {
            emit: 'event',
            level: 'warn',
        },
    ],
});
exports.prisma = prisma;
prisma.$on('error', (e) => {
    logger_1.default.error(`Prisma Error: ${e.message}`);
});
prisma.$on('info', (e) => {
    logger_1.default.info(`Prisma Info: ${e.message}`);
});
prisma.$on('warn', (e) => {
    logger_1.default.warn(`Prisma Warn: ${e.message}`);
});
//# sourceMappingURL=prisma.js.map