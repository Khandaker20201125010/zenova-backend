import { Request } from 'express';
import { Role } from './user.types';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

export interface ApiRequest<T = any> extends AuthenticatedRequest {
  body: T;
}

export interface QueryRequest extends AuthenticatedRequest {
  query: {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    [key: string]: any;
  };
}