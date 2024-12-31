# Renty

A Next.js project with Prisma ORM and Better-Auth integration.

## Getting Started

1. Copy the environment variables template:
```bash
cp .env.example .env
```

2. Update the `.env` file with your database credentials and Better-Auth configuration:
```env
# Better-Auth Configuration
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000

# Database Configuration
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=your_db_name
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"
```

3. Install dependencies:
```bash
yarn
```

4. Start the development server:
```bash
yarn dev
```

## Database Management with Prisma

### Available Commands

- `npm run db:studio` - Open Prisma Studio (visual database browser)
- `npm run db:push` - Push schema changes directly to the database (development only)
- `npm run db:pull` - Pull current database schema into your Prisma schema
- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate:dev` - Create and apply new migrations (development)
- `npm run db:migrate:reset` - Reset database and apply all migrations
- `npm run db:migrate:deploy` - Deploy pending migrations (production)

### Working with Migrations

#### Creating a New Migration

1. Make changes to your `schema.prisma` file
2. Run the migration command:
```bash
yarn run db:migrate:dev -- --name your_migration_name
```
This will:
- Detect schema changes
- Create a new migration file
- Apply the migration
- Regenerate Prisma Client

#### Deploying Migrations to Production

1. First, test your migrations locally:
```bash
yarn run db:migrate:reset
```

2. When deploying to production, run:
```bash
yarn run db:migrate:deploy
```

### Better-Auth Integration

Better-Auth automatically creates and manages its own tables in your database. These tables are:

- `user` - Stores user information (name, email, verification status)
- `session` - Manages user sessions (expiry, IP address, user agent)
- `account` - Handles authentication providers and credentials
- `verification` - Manages email verification tokens

/!\ You can modify the `user` and `session` tables as you see fit, but you have to add the new fields manually 
when you instanciate better-auth.

To sync Better-Auth tables with your database:

1. Ensure your database connection is configured in `.env`
2. Better-Auth will automatically create its tables on first use
3. You can reference Better-Auth tables in your Prisma schema to establish relationships

Example of referencing Better-Auth user in your schema:
```prisma
// Better-Auth User table
model user {
  id            String    @id
  name          String
  email         String    @unique
  emailVerified Boolean
  image         String?
  createdAt     DateTime  @db.Date
  updatedAt     DateTime  @db.Date
  account       account[]
  session       session[]
}

// Example of extending with a custom profile
model profile {
  id        Int      @id @default(autoincrement())
  userId    String   @unique
  bio       String?
  location  String?
  user      user     @relation(fields: [userId], references: [id])

  @@map("profiles")
}
```

### Rent Receipt Cron Job

The `rentReceipt` cron job is responsible for sending rent receipt emails to tenants. 
It is configured (as for every cron job) in the `vercel.json` file.

## Development Workflow

1. Pull latest database schema (if working with existing database):
```bash
yarn db:pull
```

2. Generate Prisma Client after schema changes:
```bash
yarn db:generate
```

3. Create new migrations for schema changes:
```bash
yarn db:migrate:dev -- --name describe_your_changes
```

4. Use Prisma Studio to browse and edit data:
```bash
yarn db:studio
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify your database credentials in `.env`
   - Ensure PostgreSQL is running
   - Check if the database exists

2. **Migration Conflicts**
   - If you get migration conflicts, you can reset the database:
     ```bash
     npm run db:migrate:reset
     ```
   - ⚠️ Warning: This will delete all data

3. **Prisma Client Generation Issues**
   - If you get Prisma Client errors, try:
     ```bash
     npm run db:generate
     ```
   - Delete `node_modules/.prisma` and regenerate if problems persist
