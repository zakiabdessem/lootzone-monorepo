# Local Database Setup Guide

This guide will help you set up a local PostgreSQL database using Docker for development.

## Quick Start

1. **Start the PostgreSQL container:**
   ```bash
   docker-compose up -d
   ```

2. **Set your DATABASE_URL environment variable:**
   
   Create a `.env.local` file in `apps/trpc-app/` with:
   ```env
   DATABASE_URL="postgresql://lootzone:lootzone123@localhost:5432/lootzone_db?schema=public"
   ```

3. **Run Prisma migrations:**
   ```bash
   cd apps/trpc-app
   npx prisma migrate dev
   ```

4. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

## Database Connection Details

- **Host:** localhost
- **Port:** 5432
- **Database:** lootzone_db
- **Username:** lootzone
- **Password:** lootzone123
- **Connection String:** `postgresql://lootzone:lootzone123@localhost:5432/lootzone_db?schema=public`

## Useful Commands

- **Start database:** `docker-compose up -d`
- **Stop database:** `docker-compose down`
- **View logs:** `docker-compose logs -f postgres`
- **Reset database:** `docker-compose down -v` (removes all data)
- **Access PostgreSQL CLI:** `docker exec -it lootzone-postgres psql -U lootzone -d lootzone_db`

## Prisma Studio (Database GUI)

To open Prisma Studio and view/edit your database:
```bash
cd apps/trpc-app
npx prisma studio
```

This will open a web interface at `http://localhost:5555` where you can view and edit your database tables.

