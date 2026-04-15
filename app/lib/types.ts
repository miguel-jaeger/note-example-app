export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  providers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  board_id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user?: User;
  accessToken?: string;
  csrfToken?: string;
  refreshToken?: string;
  error?: string;
  message?: string;
  requireEmailVerification?: boolean;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}