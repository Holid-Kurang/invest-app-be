const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedUsers() {
    try {
        console.log('🌱 Mulai seeding data user...');

        // Hash password untuk kedua user
        const saltRounds = 10;
        const adminPassword = await bcrypt.hash('admin123', saltRounds);
        const investorPassword = await bcrypt.hash('investor123', saltRounds);

        // Cek apakah user admin sudah ada
        const existingAdmin = await prisma.user.findUnique({
            where: { email: 'admin@gmail.com' }
        });

        if (!existingAdmin) {
            // Buat user admin
            const adminUser = await prisma.user.create({
                data: {
                    email: 'admin@gmail.com',
                    password: adminPassword,
                    role: 'admin'
                }
            });
            console.log('✅ User admin berhasil dibuat:', {
                id_user: adminUser.id_user,
                email: adminUser.email,
                role: adminUser.role
            });
        } else {
            console.log('ℹ️  User admin sudah ada');
        }

        // Cek apakah user investor sudah ada
        const existingInvestor = await prisma.user.findUnique({
            where: { email: 'investor@gmail.com' }
        });

        if (!existingInvestor) {
            // Buat user investor
            const investorUser = await prisma.user.create({
                data: {
                    email: 'investor@gmail.com',
                    password: investorPassword,
                    role: 'investor'
                }
            });
            console.log('✅ User investor berhasil dibuat:', {
                id_user: investorUser.id_user,
                email: investorUser.email,
                role: investorUser.role
            });
        } else {
            console.log('ℹ️  User investor sudah ada');
        }

        // Seed data untuk investor
        await seedInvestorData();

        console.log('\n🎉 Seeding selesai!');
        console.log('\n📋 Data login:');
        console.log('Admin:');
        console.log('  Email: admin@gmail.com');
        console.log('  Password: admin123');
        console.log('\nInvestor:');
        console.log('  Email: investor@gmail.com');
        console.log('  Password: investor123');

    } catch (error) {
        console.error('❌ Error saat seeding:', error);
    } finally {
        await prisma.$disconnect();
    }
}

async function seedInvestorData() {
    try {
        console.log('\n💰 Mulai seeding data investor...');

        // Ambil data user investor
        const investor = await prisma.user.findUnique({
            where: { email: 'investor@gmail.com' }
        });

        if (!investor) {
            console.log('❌ User investor tidak ditemukan!');
            return;
        }

        // Seed data Invest
        const existingInvests = await prisma.invest.findMany({
            where: { id_user: investor.id_user }
        });

        if (existingInvests.length === 0) {
            const investData = [
                {
                    id_user: investor.id_user,
                    amount: 1000000.00,
                    proof: 'proof_invest_1.jpg',
                    status: 'success',
                    date: new Date('2024-01-15')
                },
                {
                    id_user: investor.id_user,
                    amount: 2500000.00,
                    proof: 'proof_invest_2.jpg',
                    status: 'success',
                    date: new Date('2024-02-20')
                },
                {
                    id_user: investor.id_user,
                    amount: 500000.00,
                    proof: 'proof_invest_3.jpg',
                    status: 'pending',
                    date: new Date('2024-03-10')
                }
            ];

            for (const invest of investData) {
                await prisma.invest.create({ data: invest });
            }
            console.log('✅ Data invest berhasil dibuat');
        } else {
            console.log('ℹ️  Data invest sudah ada');
        }

        // Seed data Return
        const existingReturns = await prisma.return.findMany({
            where: { id_user: investor.id_user }
        });

        if (existingReturns.length === 0) {
            const returnData = [
                {
                    id_user: investor.id_user,
                    amount: 150000.00,
                    status: 'succes',
                    request_at: new Date('2024-02-15'),
                    approved_at: new Date('2024-02-16')
                },
                {
                    id_user: investor.id_user,
                    amount: 300000.00,
                    status: 'succes',
                    request_at: new Date('2024-03-20'),
                    approved_at: new Date('2024-03-21')
                },
                {
                    id_user: investor.id_user,
                    amount: 75000.00,
                    status: 'pending',
                    request_at: new Date('2024-04-10'),
                    approved_at: null
                }
            ];

            for (const returnItem of returnData) {
                await prisma.return.create({ data: returnItem });
            }
            console.log('✅ Data return berhasil dibuat');
        } else {
            console.log('ℹ️  Data return sudah ada');
        }

        // Seed data Withdrawal
        const existingWithdrawals = await prisma.withdrawal.findMany({
            where: { id_user: investor.id_user }
        });

        if (existingWithdrawals.length === 0) {
            const withdrawalData = [
                {
                    id_user: investor.id_user,
                    amount: 500000.00,
                    status: 'success',
                    date: new Date('2024-01-25')
                },
                {
                    id_user: investor.id_user,
                    amount: 750000.00,
                    status: 'success',
                    date: new Date('2024-02-28')
                },
                {
                    id_user: investor.id_user,
                    amount: 250000.00,
                    status: 'pending',
                    date: new Date('2024-03-15')
                },
                {
                    id_user: investor.id_user,
                    amount: 100000.00,
                    status: 'rejected',
                    date: new Date('2024-03-25')
                }
            ];

            for (const withdrawal of withdrawalData) {
                await prisma.withdrawal.create({ data: withdrawal });
            }
            console.log('✅ Data withdrawal berhasil dibuat');
        } else {
            console.log('ℹ️  Data withdrawal sudah ada');
        }

        console.log('💰 Seeding data investor selesai!');

    } catch (error) {
        console.error('❌ Error saat seeding data investor:', error);
    }
}

// Jalankan seeder
seedUsers();
