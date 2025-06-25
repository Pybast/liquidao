# TheNile Database Integration

This directory contains the database integration for LiquiDAO using TheNile and PostgreSQL.

## Setup Instructions

### 1. Create a TheNile Database

1. Sign up for an invite to [TheNile](https://thenile.dev) if you don't have one already
2. Create a new workspace and database
3. Make sure to select "Use Token in Browser" for browser-based development

### 2. Create the Database Tables

Run the following SQL in TheNile's query editor:

```sql
-- Create the main DAO addresses table
CREATE TABLE IF NOT EXISTS "dao_addresses" (
  "id" SERIAL PRIMARY KEY,
  "dao_name" varchar(256) NOT NULL,
  "dao_token_address" varchar(42) NOT NULL,
  "pool_address" varchar(42),
  "address_count" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create the eligible addresses table (normalized)
CREATE TABLE IF NOT EXISTS "eligible_addresses" (
  "id" SERIAL PRIMARY KEY,
  "dao_id" integer NOT NULL,
  "address" varchar(42) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT fk_eligible_addresses_dao_id FOREIGN KEY ("dao_id") REFERENCES "dao_addresses"("id") ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_dao_addresses_dao_name ON dao_addresses(dao_name);
CREATE INDEX IF NOT EXISTS idx_dao_addresses_dao_token_address ON dao_addresses(dao_token_address);
CREATE INDEX IF NOT EXISTS idx_eligible_addresses_dao_id ON eligible_addresses(dao_id);
CREATE INDEX IF NOT EXISTS idx_eligible_addresses_address ON eligible_addresses(address);
```

### 3. Get Database Credentials

1. In TheNile console, go to Settings > Connection
2. Click on the Postgres button
3. Click "Generate Credentials" on the top right
4. Copy the connection string

### 4. Set Environment Variables

Add the following to your `.env.local` file:

```env
DATABASE_URL=postgres://your-connection-string-from-nile
```

### 5. Test the Integration

The API routes are now ready to use:

- **POST** `/api/dao/addresses` - Save a new DAO address list
- **GET** `/api/dao/addresses?daoName=ExampleDAO` - Get address list by DAO name
- **GET** `/api/dao/addresses?daoTokenAddress=0x...` - Get address list by token address

## API Usage Examples

### Save a DAO Address List

```bash
curl -X POST http://localhost:3000/api/dao/addresses \
  -H "Content-Type: application/json" \
  -d '{
    "daoName": "ExampleDAO",
    "daoTokenAddress": "0x1234567890123456789012345678901234567890",
    "eligibleAddresses": [
      "0xabcdef1234567890abcdef1234567890abcdef12",
      "0xfedcba0987654321fedcba0987654321fedcba09"
    ],
    "poolAddress": "0x9876543210abcdef9876543210abcdef98765432"
  }'
```

### Get Address List by DAO Name

```bash
curl "http://localhost:3000/api/dao/addresses?daoName=ExampleDAO"
```

### Get Address List by Token Address

```bash
curl "http://localhost:3000/api/dao/addresses?daoTokenAddress=0x1234567890123456789012345678901234567890"
```

## Database Schema

### dao_addresses Table

- `id`: Primary key (SERIAL)
- `dao_name`: Name of the DAO (varchar(256))
- `dao_token_address`: Token contract address (varchar(42))
- `pool_address`: Associated pool address (varchar(42), nullable)
- `address_count`: Number of eligible addresses (integer)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### eligible_addresses Table

- `id`: Primary key (SERIAL)
- `dao_id`: Foreign key to dao_addresses.id (integer)
- `address`: Ethereum address (varchar(42))
- `created_at`: Creation timestamp

## Features

- **Normalized Schema**: Eligible addresses are stored in a separate table for better data integrity
- **Foreign Key Constraints**: Ensures referential integrity between tables
- **Cascade Deletes**: Deleting a DAO automatically removes all associated eligible addresses
- **Address Validation**: Validates Ethereum address format (0x prefix, 42 characters)
- **Indexed Queries**: Optimized indexes for fast lookups by DAO name, token address, and eligible addresses
- **Transaction Support**: API uses transactions to ensure data consistency
- **Error Handling**: Comprehensive error handling and validation
