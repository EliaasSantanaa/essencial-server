export interface AuthUser {
  email: string;
  sub: string;
  role?: string;
  name?: string;
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: number;
}

export interface UpdateUserAttributes {
  accessToken: string;
  attributes: { Name: string; Value: string }[];
}

export interface AuthError {
  code: string;
  message: string;
}
