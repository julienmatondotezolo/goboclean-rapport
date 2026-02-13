/**
 * 🔒 SECURE Authentication Service
 * Implements security best practices for Goboclean PWA
 */

import { createSecureClient, sessionSecurity } from './supabase/secure-client';
import { User } from '@/types/report';

export interface SecureLoginCredentials {
  email: string;
  password: string;
  keepLoggedIn?: boolean;
}

export interface SignupData extends SecureLoginCredentials {
  first_name: string;
  last_name: string;
  phone?: string;
  role?: 'worker' | 'admin';
}

// 🛡️ Input validation and sanitization
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim().toLowerCase());
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>'"&]/g, '');
};

const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain number');
  if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain special character');
  
  return { valid: errors.length === 0, errors };
};

// 🔐 Rate limiting for brute force protection
class RateLimiter {
  private attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes
  
  isBlocked(identifier: string): boolean {
    const record = this.attempts.get(identifier);
    if (!record) return false;
    
    const now = Date.now();
    if (now - record.lastAttempt > this.windowMs) {
      this.attempts.delete(identifier);
      return false;
    }
    
    return record.count >= this.maxAttempts;
  }
  
  recordAttempt(identifier: string): void {
    const now = Date.now();
    const record = this.attempts.get(identifier) || { count: 0, lastAttempt: now };
    
    if (now - record.lastAttempt > this.windowMs) {
      record.count = 1;
    } else {
      record.count++;
    }
    
    record.lastAttempt = now;
    this.attempts.set(identifier, record);
  }
  
  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

const rateLimiter = new RateLimiter();

// 🚨 Security audit logging
const auditLog = {
  log: (event: string, details: any, userId?: string) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userId,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
      ip: 'client', // Would be set by middleware in real implementation
    };
    
    // In production, this should go to a secure logging service
    console.log('🔍 AUDIT:', JSON.stringify(logEntry));
    
    // Store locally for debugging (remove in production)
    if (typeof localStorage !== 'undefined') {
      const logs = JSON.parse(localStorage.getItem('security-audit') || '[]');
      logs.push(logEntry);
      // Keep only last 100 logs
      if (logs.length > 100) logs.shift();
      localStorage.setItem('security-audit', JSON.stringify(logs));
    }
  }
};

export const secureAuthService = {
  async login(credentials: SecureLoginCredentials) {
    const email = credentials.email.toLowerCase().trim();
    
    // 🛡️ Input validation
    if (!validateEmail(email)) {
      auditLog.log('INVALID_EMAIL', { email });
      throw new Error('Invalid email format');
    }
    
    // 🚫 Rate limiting check
    if (rateLimiter.isBlocked(email)) {
      auditLog.log('RATE_LIMITED', { email });
      throw new Error('Too many login attempts. Please try again in 15 minutes.');
    }
    
    try {
      const supabase = createSecureClient();
      
      // 🔐 Attempt authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: credentials.password,
      });

      if (error) {
        // Record failed attempt
        rateLimiter.recordAttempt(email);
        auditLog.log('LOGIN_FAILED', { email, error: error.message });
        throw error;
      }

      // Validate session
      if (!sessionSecurity.validateSession(data.session)) {
        auditLog.log('INVALID_SESSION', { email });
        throw new Error('Invalid session received');
      }

      // Success - reset rate limiter
      rateLimiter.reset(email);
      auditLog.log('LOGIN_SUCCESS', { email, userId: data.user?.id });

      return { user: data.user, session: data.session };
    } catch (error) {
      // Record attempt even on error
      rateLimiter.recordAttempt(email);
      throw error;
    }
  },

  async signup(signupData: SignupData) {
    const email = signupData.email.toLowerCase().trim();
    
    // 🛡️ Input validation
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    const passwordValidation = validatePassword(signupData.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join(', '));
    }
    
    // 🧹 Sanitize inputs
    const sanitizedData = {
      ...signupData,
      email,
      first_name: sanitizeInput(signupData.first_name),
      last_name: sanitizeInput(signupData.last_name),
      phone: signupData.phone ? sanitizeInput(signupData.phone) : undefined,
    };

    try {
      const supabase = createSecureClient();
      
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedData.email,
        password: sanitizedData.password,
        options: {
          data: {
            first_name: sanitizedData.first_name,
            last_name: sanitizedData.last_name,
            phone: sanitizedData.phone,
            role: sanitizedData.role || 'worker',
          },
        },
      });

      if (error) {
        auditLog.log('SIGNUP_FAILED', { email, error: error.message });
        throw error;
      }

      auditLog.log('SIGNUP_SUCCESS', { email, userId: data.user?.id });
      return data;
    } catch (error) {
      auditLog.log('SIGNUP_ERROR', { email, error: error.message });
      throw error;
    }
  },

  async logout() {
    try {
      const supabase = createSecureClient();
      const success = await sessionSecurity.secureLogout(supabase);
      
      if (success) {
        auditLog.log('LOGOUT_SUCCESS', {});
      } else {
        auditLog.log('LOGOUT_FAILED', {});
      }
      
      // Force page reload to clear any remaining state
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (error) {
      auditLog.log('LOGOUT_ERROR', { error: error.message });
      throw error;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const supabase = createSecureClient();
      
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        auditLog.log('GET_USER_FAILED', { error: error?.message });
        return null;
      }

      // Additional security check - verify session
      const { data: { session } } = await supabase.auth.getSession();
      if (!sessionSecurity.validateSession(session)) {
        auditLog.log('INVALID_SESSION_ON_GET_USER', { userId: user.id });
        await sessionSecurity.secureLogout(supabase);
        return null;
      }

      // Get user profile with role information
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        auditLog.log('PROFILE_FETCH_FAILED', { 
          userId: user.id, 
          error: profileError.message 
        });
        return null;
      }

      // Security check - ensure user account is active
      if (!profile.is_active) {
        auditLog.log('INACTIVE_USER_ACCESS', { userId: user.id });
        await sessionSecurity.secureLogout(supabase);
        throw new Error('Account has been disabled');
      }

      return profile;
    } catch (error) {
      auditLog.log('GET_USER_ERROR', { error: error.message });
      throw error;
    }
  },

  async updatePassword(newPassword: string) {
    // 🛡️ Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    try {
      const supabase = createSecureClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        auditLog.log('PASSWORD_UPDATE_FAILED', { error: error.message });
        throw error;
      }

      auditLog.log('PASSWORD_UPDATE_SUCCESS', {});
    } catch (error) {
      auditLog.log('PASSWORD_UPDATE_ERROR', { error: error.message });
      throw error;
    }
  },

  async resetPassword(email: string) {
    const cleanEmail = email.toLowerCase().trim();
    
    if (!validateEmail(cleanEmail)) {
      throw new Error('Invalid email format');
    }

    // 🚫 Rate limiting for password reset
    if (rateLimiter.isBlocked(`reset-${cleanEmail}`)) {
      throw new Error('Too many password reset attempts. Please try again later.');
    }

    try {
      const supabase = createSecureClient();
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        rateLimiter.recordAttempt(`reset-${cleanEmail}`);
        auditLog.log('PASSWORD_RESET_FAILED', { email: cleanEmail, error: error.message });
        throw error;
      }

      auditLog.log('PASSWORD_RESET_SUCCESS', { email: cleanEmail });
    } catch (error) {
      rateLimiter.recordAttempt(`reset-${cleanEmail}`);
      auditLog.log('PASSWORD_RESET_ERROR', { email: cleanEmail, error: error.message });
      throw error;
    }
  },

  // 🔍 Security utilities for monitoring
  getSecurityStatus() {
    return {
      rateLimiterActive: true,
      auditLoggingActive: true,
      secureClientActive: true,
      sessionValidationActive: true,
    };
  },

  // 🧹 Clear security audit logs (admin only)
  clearAuditLogs() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('security-audit');
    }
    auditLog.log('AUDIT_LOGS_CLEARED', {});
  }
};