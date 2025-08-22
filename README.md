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

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru (role: investor/admin)
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get profile user (protected)

### Investment (Investor & Admin)
- `POST /api/invest` - Buat investasi baru (protected)
- `GET /api/invest` - Get semua investasi user (protected)
- `GET /api/invest/:id` - Get detail investasi (protected)

### Investment Management (Admin Only)
- `PUT /api/invest/:id/status` - Update status investasi (admin only)

### Return (Investor & Admin)
- `POST /api/return` - Buat request return (protected)
- `GET /api/return` - Get semua return user (protected)

### Return Management (Admin Only)
- `PUT /api/return/:id/status` - Update status return (admin only)

### Withdrawal (Investor & Admin)
- `POST /api/withdrawal` - Buat withdrawal (protected)
- `GET /api/withdrawal` - Get semua withdrawal user (protected)
- `GET /api/withdrawal/:id` - Get detail withdrawal (protected)

### Withdrawal Management (Admin Only)
- `PUT /api/withdrawal/:id/status` - Update status withdrawal (admin only)

### Admin Dashboard (Admin Only)
- `GET /api/admin/users` - Get semua users
- `GET /api/admin/investments` - Get semua investments
- `GET /api/admin/returns` - Get semua returns  
- `GET /api/admin/withdrawals` - Get semua withdrawals
- `GET /api/admin/dashboard` - Get dashboard statistics

### Health Check
- `GET /api/health` - Check status server

## Database Schema

### Users
```sql
TABLE users (
  id_user INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  role ENUM('investor', 'admin') DEFAULT 'investor',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Invest
```sql
TABLE invest (
  id_invest INT AUTO_INCREMENT PRIMARY KEY,
  id_user INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  proof VARCHAR(255),
  status ENUM('pending', 'success') DEFAULT 'pending',
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES users(id_user)
);
```

### Return
```sql
TABLE return (
  id_return INT AUTO_INCREMENT PRIMARY KEY,
  id_user INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status ENUM('pending', 'succes') DEFAULT 'pending',
  request_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME,
  FOREIGN KEY (id_user) REFERENCES users(id_user)
);
```

### Withdrawal
```sql
TABLE withdrawal (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_user INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status ENUM('pending', 'success', 'rejected') DEFAULT 'pending',
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_user) REFERENCES users(id_user)
);
```

## Scripts

- `npm start` - Jalankan server production
- `npm run dev` - Jalankan server development dengan nodemon
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Jalankan migrasi database
- `npm run prisma:studio` - Buka Prisma Studio

## Contoh Penggunaan API

### Register Investor
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "email": "investor@example.com",
  "password": "password123",
  "role": "investor"
}
```

### Register Admin
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}
```

### Login
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Buat Investasi
```javascript
POST /api/invest
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000000,
  "proof": "bukti_transfer.jpg"
}
```

### Buat Withdrawal
```javascript
POST /api/withdrawal
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500000
}
```

### Get Admin Dashboard (Admin Only)
```javascript
GET /api/admin/dashboard
Authorization: Bearer <admin_token>
```

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
