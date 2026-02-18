import { JwtPayload } from '../types';
export declare const generateToken: (payload: JwtPayload) => string;
export declare const generateRefreshToken: (payload: JwtPayload) => string;
export declare const verifyToken: (token: string) => JwtPayload;
export declare const verifyRefreshToken: (token: string) => JwtPayload;
//# sourceMappingURL=jwt.d.ts.map