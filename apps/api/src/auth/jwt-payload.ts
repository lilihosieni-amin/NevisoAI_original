/** Shape of a decoded user access token. */
export interface UserJwtPayload {
  sub: string; // user id
  aud?: string; // must NOT be "admin" on user resolvers
  act?: { adminId: string }; // present only for impersonation tokens
  iat?: number;
  exp?: number;
}

/** The authenticated principal attached to the request by GqlAuthGuard. */
export interface AuthenticatedUser {
  id: string;
  mobile: string;
  status: string;
  /** Set when an admin is impersonating this user (ARD §7.7). */
  impersonatorAdminId?: string;
}
