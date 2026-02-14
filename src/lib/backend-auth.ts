/**
 * Backend Authentication Service - Simple JWT token management
 * Replaces Supabase auth for backend-only authentication
 */
export class BackendAuthService {
  private baseUrl: string;
  private static instance: BackendAuthService;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  }

  static getInstance(): BackendAuthService {
    if (!BackendAuthService.instance) {
      BackendAuthService.instance = new BackendAuthService();
    }
    return BackendAuthService.instance;
  }

  /**
   * Store JWT token in localStorage
   */
  private setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("goboclean-auth-token", token);
    }
  }

  /**
   * Get JWT token from localStorage
   */
  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("goboclean-auth-token");
    }
    return null;
  }

  /**
   * Clear stored JWT token
   */
  private clearToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("goboclean-auth-token");
    }
  }

  /**
   * Login with email/password and store JWT token
   */
  async login(email: string, password: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    const data = await response.json();

    if (data.access_token) {
      this.setToken(data.access_token);
    }

    return data;
  }

  /**
   * Get current user info using JWT token
   */
  async getCurrentUser(): Promise<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error("No authentication token");
    }

    const response = await fetch(`${this.baseUrl}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        throw new Error("Session expired");
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get user");
    }

    return response.json();
  }

  /**
   * Logout and clear stored token
   */
  async logout(): Promise<void> {
    const token = this.getToken();

    // Call backend logout if we have a token
    if (token) {
      try {
        await fetch(`${this.baseUrl}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.warn("Logout request failed:", error);
        // Continue with local cleanup even if backend call fails
      }
    }

    this.clearToken();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Export singleton instance
export const backendAuth = BackendAuthService.getInstance();
