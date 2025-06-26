import {
  pgTable,
  varchar,
  timestamp,
  integer,
  serial,
  unique,
} from "drizzle-orm/pg-core";

// DAO Addresses table schema
export const daoLiquidityPoolSchema = pgTable("dao_liquidity_pool", {
  id: serial("id").primaryKey(),
  daoName: varchar("dao_name", { length: 256 }).notNull(),
  poolId: varchar("pool_id", { length: 256 }).notNull(),
  poolOwner: varchar("pool_owner", { length: 42 }).notNull(), // Ethereum address format
  daoTokenAddress: varchar("dao_token_address", { length: 42 }).notNull(), // Ethereum address format
  daoTokenName: varchar("dao_token_name", { length: 256 }).notNull(),
  daoTokenSymbol: varchar("dao_token_symbol", { length: 256 }).notNull(),
  daoTokenDecimals: integer("dao_token_decimals").notNull(),
  liquidityTokenAddress: varchar("liquidity_token_address", {
    length: 42,
  }).notNull(), // Ethereum address format
  liquidityTokenName: varchar("liquidity_token_name", {
    length: 256,
  }).notNull(),
  liquidityTokenSymbol: varchar("liquidity_token_symbol", {
    length: 256,
  }).notNull(),
  liquidityTokenDecimals: integer("liquidity_token_decimals").notNull(),
  tickSpacing: integer("tick_spacing").notNull(),
  lpFee: integer("lp_fee").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Eligible Addresses table schema
export const eligibleAddressesSchema = pgTable(
  "eligible_addresses",
  {
    id: serial("id").primaryKey(),
    daoId: integer("dao_id")
      .notNull()
      .references(() => daoLiquidityPoolSchema.id),
    address: varchar("address", { length: 42 }).notNull(), // Ethereum address format
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [unique("unique_dao_address").on(t.daoId, t.address)]
);

// Types for TypeScript
export type DaoLiquidityPool = typeof daoLiquidityPoolSchema.$inferSelect;
export type NewDaoLiquidityPool = typeof daoLiquidityPoolSchema.$inferInsert;
export type EligibleAddress = typeof eligibleAddressesSchema.$inferSelect;
export type NewEligibleAddress = typeof eligibleAddressesSchema.$inferInsert;
