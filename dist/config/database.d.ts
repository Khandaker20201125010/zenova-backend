import { PrismaClient } from '@prisma/client';
declare const prisma: PrismaClient<{
    log: ("error" | "warn" | "query")[];
    errorFormat: "pretty";
}, "error" | "warn" | "query", import("@prisma/client/runtime/library").DefaultArgs>;
export default prisma;
//# sourceMappingURL=database.d.ts.map