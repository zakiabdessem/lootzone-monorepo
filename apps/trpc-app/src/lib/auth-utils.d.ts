import { UserRole } from "~/constants/enums";
/**
 * Hash a password using bcrypt
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Create a new user with credentials
 */
export declare function createUserWithCredentials({ email, password, firstName, lastName, phone, role, }: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: UserRole;
}): Promise<any>;
/**
 * Verify a password against a hash
 */
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
