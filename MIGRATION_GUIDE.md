# Database Schema Migration Guide

## Current Situation

You have **two different database schemas**:

### 1. Old Schema (`spms.sql`)
- Table: `users` (plural)
- Table: `portfolios` 
- Table: `holdings` (contains stock info directly)

### 2. New Schema (`table schemas.sql`)
- Table: `user` (singular)
- Table: `user_portfolio`
- Table: `stock` (separate table)
- Table: `broker` (separate table)

## Your Backend Code Uses

The backend code is configured to use the **NEW schema** with:
- `user` table (singular)
- `user_portfolio` table with foreign keys to `stock` and `broker`
- Separate `stock` and `broker` tables

## Options

### Option 1: Use New Schema (Recommended)
1. Create the new database with `table schemas.sql`
2. Populate `stock` and `broker` tables with data
3. Users will need to register again (passwords are hashed, can't be transferred)

### Option 2: Migrate Data from Old Schema
1. Convert `users` → `user`
2. Convert `holdings` → `user_portfolio` with references to `stock` and `broker`
3. Extract unique stocks and brokers into their respective tables

### Option 3: Update Backend to Use Old Schema
1. Modify backend controllers to work with old table structure
2. Update queries to match old schema

## Test Users in spms.sql

You have these users in your old database:
- `abinash@test.com`
- `abinash@gmail.com`
- `nash@gmail.com`
- `pri@gmail.com`
- `abin@gmail.com`
- `john@gmail.com`

**Note:** Passwords are hashed (bcrypt), so you'll need the original passwords to login, or reset them.

## Recommendation

If you want to keep your existing data, I can help you:
1. Create a migration script to convert the old schema to the new one
2. Extract stocks and brokers from holdings
3. Map the data correctly

Would you like me to create a migration script?
