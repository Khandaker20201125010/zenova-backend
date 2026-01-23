export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: Role;
  status: UserStatus;
  emailVerified: boolean;
  phone?: string;
  company?: string;
  position?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCreate {
  email: string;
  password: string;
  name: string;
  role?: Role;
}

export interface IUserUpdate {
  name?: string;
  avatar?: string;
  phone?: string;
  company?: string;
  position?: string;
  bio?: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest extends ILoginRequest {
  name: string;
  confirmPassword: string;
}

export interface IAuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface ITokenPayload {
  id: string
  userId: string;
  email: string;
  role: Role;
}