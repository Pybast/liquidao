import { Address } from "viem";

if (!process.env.NEXT_PUBLIC_LIQUIDAO_HOOK_ADDRESS)
  throw new Error("NEXT_PUBLIC_LIQUIDAO_HOOK_ADDRESS is not set");

export const GATED_POOL_HOOK_ADDRESS = process.env
  .NEXT_PUBLIC_LIQUIDAO_HOOK_ADDRESS as Address;

export const V4_ROUTER_ADDRESS = "0x00000000000044a361Ae3cAc094c9D1b14Eece97";
