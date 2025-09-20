# Invest App Backend

Backend API untuk aplikasi investasi menggunakan Express.js, PostgreSQL, dan Prisma ORM.

## Fitur

- 🔐 Autentikasi user (register, login)
- 💰 Manajemen investasi
- 📈 Sistem return investasi
- 💸 Penarikan dana (withdrawal)
- 🔒 JWT Authentication
- 📊 PostgreSQL dengan Prisma ORM

## Tech Stack

- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Password Hashing**: bcryptjs

## Instalasi

1. **Clone atau setup project**
   ```bash
   cd invest-app-be
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   
   Ubah file `.env` sesuai dengan konfigurasi database Anda:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/invest_app?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-here"
   PORT=3000
   NODE_ENV=development
   ```

4. **Setup database PostgreSQL**
   
   Pastikan PostgreSQL sudah terinstall dan berjalan, kemudian buat database:
   ```sql
   CREATE DATABASE invest_app;
   ```

5. **Jalankan migrasi database**
   ```bash
   npm run prisma:migrate
   ```

6. **Generate Prisma Client**
   ```bash
   npm run prisma:generate
   ```

## Menjalankan Aplikasi

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server akan berjalan di `http://localhost:3000`

## Scripts

- `npm start` - Jalankan server production
- `npm run dev` - Jalankan server development dengan nodemon
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Jalankan migrasi database
- `npm run prisma:studio` - Buka Prisma Studio

## Role-Based Access Control

### Investor Role
- Dapat membuat investasi, return, dan withdrawal
- Dapat melihat data investasi sendiri
- Tidak dapat mengakses area admin

### Admin Role  
- Dapat mengakses semua fitur investor
- Dapat melihat semua data users, investments, returns, withdrawals
- Dapat mengupdate status investasi, return, dan withdrawal
- Dapat mengakses dashboard statistics

## Struktur Project

```
invest-app-be/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── investController.js
│   │   ├── returnController.js
│   │   ├── withdrawalController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── authorization.js
│   └── routes/
│       ├── authRoutes.js
│       ├── investRoutes.js
│       ├── returnRoutes.js
│       ├── withdrawalRoutes.js
│       └── adminRoutes.js
├── prisma/
│   └── schema.prisma
├── .env
├── index.js
├── package.json
└── README.md
```

## Catatan

- Pastikan PostgreSQL sudah terinstall dan berjalan
- Ubah `DATABASE_URL` di file `.env` sesuai dengan konfigurasi database Anda
- Ganti `JWT_SECRET` dengan string yang lebih aman untuk production
- Untuk endpoint admin (update status), implementasikan sistem role/permission sesuai kebutuhan
