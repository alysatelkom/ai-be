# Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Internet connection (for first time setup)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

**Important:** Generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 3. Initialize Database

Generate Prisma Client and create the database:

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Create Your First Account

1. Go to `/register`
2. Fill in your details
3. Click "Daftar"
4. Login with your credentials

## Troubleshooting

### Prisma Binary Download Issues

If you encounter issues downloading Prisma binaries:

```bash
# Set environment variable to skip checksum validation
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
npx prisma generate
```

### Port Already in Use

If port 3000 is already in use:

```bash
# Run on different port
PORT=3001 npm run dev
```

### Build Errors

Clear Next.js cache and rebuild:

```bash
rm -rf .next
npm run build
```

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
NODE_ENV="production"
```

### Database Migration

For production, use Prisma Migrate instead of db push:

```bash
npx prisma migrate dev --name init
npx prisma migrate deploy
```

## Sample Data

### Add Sample Instrument

After logging in, add your first instrument:

**Instrument Details:**
- Nama: Advanced Multi Product Calibrator
- Merek: Transmille
- Tipe: 4015
- Serial Number: Y1269E18

**Measurement Quantity:**
- Besaran: DC Voltmeter
- Rentang Min: 0.01
- Rentang Max: 202
- Satuan: mV
- CMC: 0.085
- Drift: 0.0001
- Ketidakpastian Kalibrasi: 0.00001

### Use the Calculator

1. Go to "Kalkulator Budget Ketidakpastian"
2. Select your instrument
3. Select measurement quantity
4. Select range
5. Click "Tampilkan Kalkulator"
6. Adjust components as needed
7. View calculated results

## Database Backup

### Backup SQLite Database

```bash
cp prisma/dev.db prisma/dev.db.backup
```

### Restore from Backup

```bash
cp prisma/dev.db.backup prisma/dev.db
```

## Updating Dependencies

```bash
npm update
npx prisma generate  # Regenerate after updating @prisma/client
```

## Development Tips

### View Database

Use Prisma Studio to view and edit data:

```bash
npx prisma studio
```

This opens a GUI at `http://localhost:5555`

### TypeScript Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

## Support

For issues or questions:
- Check the README.md file
- Review Next.js documentation: https://nextjs.org/docs
- Review Prisma documentation: https://www.prisma.io/docs
