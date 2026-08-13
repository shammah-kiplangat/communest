import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { apiRequest } from "../utils/api";
import type { User, UserRole } from "../types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message: string; user?: User }>;
  register: (
    data: RegisterData,
  ) => Promise<{ success: boolean; message: string; user?: User }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

const STORAGE_KEY = "communest_current_user";
const TOKEN_KEY = "communest_auth_token";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    async function loadCurrentUser() {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return;

      try {
        const result = await apiRequest<{ user: User }>("/auth/me");
        setUser(result.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      }
    }

    loadCurrentUser();
  }, []);

  const persistAuth = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await apiRequest<{ accessToken: string; user: User }>(
        "/auth/login",
        {
          method: "POST",
          body: { email, password },
        },
      );
      persistAuth(result.user, result.accessToken);
      return { success: true, message: "Login successful.", user: result.user };
    } catch (error: any) {
      return { success: false, message: error?.message || "Login failed." };
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const result = await apiRequest<{ accessToken: string; user: User }>(
        "/auth/register",
        {
          method: "POST",
          body: {
            email: data.email,
            password: data.password,
            full_name: data.fullName,
            phone: data.phone,
          },
        },
      );
      persistAuth(result.user, result.accessToken);
      return {
        success: true,
        message: "Account created successfully.",
        user: result.user,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || "Registration failed.",
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    const body: Record<string, unknown> = {};
    if (updates.fullName !== undefined) body.full_name = updates.fullName;
    if (updates.phone !== undefined) body.phone = updates.phone;
    if (updates.profilePicture !== undefined)
      body.profile_picture = updates.profilePicture;
    if (updates.role !== undefined) body.role = updates.role;
    if (updates.estateId !== undefined) body.estate_id = updates.estateId;
    if (updates.emailVerified !== undefined)
      body.email_verified = updates.emailVerified;
    if (updates.phoneVerified !== undefined)
      body.phone_verified = updates.phoneVerified;

    if (Object.keys(body).length === 0) return;

    try {
      const result = await apiRequest<{ user: User }>(`/users/${user.id}`, {
        method: "PATCH",
        body,
      });
      setUser(result.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
    } catch (error) {
      console.warn("Unable to update user profile", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "communest_admin":
      return "Communest Admin";
    case "estate_admin":
      return "Estate Admin";
    case "tenant":
      return "Tenant";
    case "regular_user":
      return "Regular User";
  }
}
