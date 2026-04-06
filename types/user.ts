import type { Role } from "@/constants/role";

export type User = {
  id: string | number;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  address?: string;
  role?: Role; 
  isActive?: boolean;
  createdAt?: string;
  subscribe?: boolean;
  activateToken?: string | null;
  activateTokenExpires?: number | null;
};
