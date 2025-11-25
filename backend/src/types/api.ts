// Generic types
export interface ApiResponse<T = never> {
    status: 'success' | 'error';
    data: T;
}

export interface ApiError {
    message: string;
}

export interface MongoDatabaseError {
    code: number;
    message: string;
}
