# Configure PostgreSQL and Prisma

## Goal

Provision a PostgreSQL database and set up Prisma as the ORM to facilitate type-safe database interactions. Define the database connection, initialize Prisma, and verify connectivity.

## Implementation

1. **Provision a Database:**
   - For local development, use Docker or a local installation. Example Docker Compose service:

     ```yaml
     # docker-compose.yml
     version: '3'
     services:
       db:
         image: postgres:16
         restart: always
         environment:
           POSTGRES_USER: carbon
           POSTGRES_PASSWORD: carbon
           POSTGRES_DB: carbon_compass
         ports:
           - '5432:5432'
         volumes:
           - db_data:/var/lib/postgresql/data
     volumes:
       db_data:
     ```

   - Alternatively, use a managed database (e.g., Supabase or Neon). Document credentials in a secure `.env` file.

2. **Create `.env` File:** Define environment variables for the database connection and Clerk API keys. Example:

   ```env
   DATABASE_URL="postgresql://carbon:carbon@localhost:5432/carbon_compass?schema=public"
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   OPENAI_API_KEY=your_openai_api_key
   ```

   Never commit secrets to version control. Use environment variables or secret management on deployment platforms.

3. **Initialize Prisma:** Run the following commands from the project root:

   ```bash
   npx prisma init --datasource-provider postgresql
   ```

   This creates a `prisma` directory with `schema.prisma` and updates `.env` if necessary.

4. **Configure `schema.prisma`:** Set up the data source:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   generator client {
     provider = "prisma-client-js"
   }
   ```

   Additional models will be added in subsequent tasks (see Task 08).

5. **Generate the Prisma Client:** After defining models, run:

   ```bash
   npx prisma generate
   ```

   This produces a type-safe client used to query the database.

6. **Test Connectivity:** Write a simple script in `prisma/test-connection.ts` that instantiates `PrismaClient` and executes a trivial query:

   ```ts
   import { PrismaClient } from '@prisma/client';

   const prisma = new PrismaClient();

   async function main() {
     const now = await prisma.$queryRaw`SELECT NOW();`;
     console.log('Database time:', now);
     await prisma.$disconnect();
   }
   main();
   ```

   Run with `ts-node prisma/test-connection.ts` to verify connectivity.

## Check When Done

- The PostgreSQL instance is running locally or via a managed service with a valid `DATABASE_URL` in `.env`.
- The `prisma` folder exists with an initialized `schema.prisma` referencing the database.
- The Prisma Client can be generated and used without errors.
- The `test-connection.ts` script prints the current database time, confirming connectivity.
