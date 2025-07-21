export interface SignUpFields {
    firstName: string;
    lastName: string;
    emailAddress: string;
    password: string;
}

export interface SignInFields {
    emailAddress: string;
    password: string;
}

export interface AuthResult {
    success?: boolean;
    error?: string;
    data?: unknown;
}
