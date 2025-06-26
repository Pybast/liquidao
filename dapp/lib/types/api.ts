import { DaoLiquidityPool } from "@/lib/db/schema";

// Base API response structure
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Error response structure
export interface ApiErrorResponse {
  success: false;
  error: string;
}

// Type for a single DAO pool with eligible addresses
export interface DaoPoolWithAddresses extends DaoLiquidityPool {
  eligibleAddresses: string[];
}

// Return type for GET /api/dao/addresses
export type GetDaoAddressesResponse = ApiResponse<DaoPoolWithAddresses[]>;
