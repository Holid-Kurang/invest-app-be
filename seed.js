const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedUsers() {
    try {
        console.log('🌱 Mulai seeding data user...');

        // Hash password untuk semua user
        const saltRounds = 10;
        const adminPassword = await bcrypt.hash('admin123', saltRounds);
        const investor1Password = await bcrypt.hash('investor123', saltRounds);
        const investor2Password = await bcrypt.hash('investor456', saltRounds);

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

        // Cek apakah user investor 1 sudah ada
        const existingInvestor1 = await prisma.user.findUnique({
            where: { email: 'investor@gmail.com' }
        });

        if (!existingInvestor1) {
            // Buat user investor 1
            const investorUser1 = await prisma.user.create({
                data: {
                    email: 'investor@gmail.com',
                    password: investor1Password,
                    role: 'investor'
                }
            });
            console.log('✅ User investor 1 berhasil dibuat:', {
                id_user: investorUser1.id_user,
                email: investorUser1.email,
                role: investorUser1.role
            });
        } else {
            console.log('ℹ️  User investor 1 sudah ada');
        }

        // Cek apakah user investor 2 sudah ada
        const existingInvestor2 = await prisma.user.findUnique({
            where: { email: 'investor2@gmail.com' }
        });

        if (!existingInvestor2) {
            // Buat user investor 2
            const investorUser2 = await prisma.user.create({
                data: {
                    email: 'investor2@gmail.com',
                    password: investor2Password,
                    role: 'investor'
                }
            });
            console.log('✅ User investor 2 berhasil dibuat:', {
                id_user: investorUser2.id_user,
                email: investorUser2.email,
                role: investorUser2.role
            });
        } else {
            console.log('ℹ️  User investor 2 sudah ada');
        }

        // Seed data untuk kedua investor
        await seedInvestorData();

        console.log('\n🎉 Seeding selesai!');
        console.log('\n📋 Data login:');
        console.log('Admin:');
        console.log('  Email: admin@gmail.com');
        console.log('  Password: admin123');
        console.log('\nInvestor 1:');
        console.log('  Email: investor@gmail.com');
        console.log('  Password: investor123');
        console.log('\nInvestor 2:');
        console.log('  Email: investor2@gmail.com');
        console.log('  Password: investor456');

    } catch (error) {
        console.error('❌ Error saat seeding:', error);
    } finally {
        await prisma.$disconnect();
    }
}

async function seedInvestorData() {
    try {
        console.log('\n💰 Mulai seeding data investor...');

        // Ambil data kedua investor
        const investor1 = await prisma.user.findUnique({
            where: { email: 'investor@gmail.com' }
        });

        const investor2 = await prisma.user.findUnique({
            where: { email: 'investor2@gmail.com' }
        });

        const investors = [
            { investor: investor1, name: 'Investor 1' },
            { investor: investor2, name: 'Investor 2' }
        ];

        for (const { investor, name } of investors) {
            if (!investor) {
                console.log(`❌ User ${name} tidak ditemukan!`);
                continue;
            }

            console.log(`\n💰 Seeding data untuk ${name}...`);

            // Seed data Invest
            const existingInvests = await prisma.invest.findMany({
                where: { id_user: investor.id_user }
            });

            if (existingInvests.length === 0) {
                const investData = investor.email === 'investor@gmail.com' ? [
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
                ] : [
                    {
                        id_user: investor.id_user,
                        amount: 1500000.00,
                        proof: 'proof_invest_4.jpg',
                        status: 'success',
                        date: new Date('2024-01-10')
                    },
                    {
                        id_user: investor.id_user,
                        amount: 3000000.00,
                        proof: 'proof_invest_5.jpg',
                        status: 'success',
                        date: new Date('2024-02-15')
                    },
                    {
                        id_user: investor.id_user,
                        amount: 800000.00,
                        proof: 'proof_invest_6.jpg',
                        status: 'pending',
                        date: new Date('2024-03-05')
                    }
                ];

                for (const invest of investData) {
                    await prisma.invest.create({ data: invest });
                }
                console.log(`✅ Data invest ${name} berhasil dibuat`);
            } else {
                console.log(`ℹ️  Data invest ${name} sudah ada`);
            }

            // Seed data Return
            const existingReturns = await prisma.return.findMany({
                where: { id_user: investor.id_user }
            });

            if (existingReturns.length === 0) {
                const returnData = investor.email === 'investor@gmail.com' ? [
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
                ] : [
                    {
                        id_user: investor.id_user,
                        amount: 200000.00,
                        status: 'succes',
                        request_at: new Date('2024-02-10'),
                        approved_at: new Date('2024-02-11')
                    },
                    {
                        id_user: investor.id_user,
                        amount: 450000.00,
                        status: 'succes',
                        request_at: new Date('2024-03-15'),
                        approved_at: new Date('2024-03-16')
                    },
                    {
                        id_user: investor.id_user,
                        amount: 120000.00,
                        status: 'pending',
                        request_at: new Date('2024-04-05'),
                        approved_at: null
                    }
                ];

                for (const returnItem of returnData) {
                    await prisma.return.create({ data: returnItem });
                }
                console.log(`✅ Data return ${name} berhasil dibuat`);
            } else {
                console.log(`ℹ️  Data return ${name} sudah ada`);
            }

            // Seed data Withdrawal
            const existingWithdrawals = await prisma.withdrawal.findMany({
                where: { id_user: investor.id_user }
            });

            if (existingWithdrawals.length === 0) {
                const withdrawalData = investor.email === 'investor@gmail.com' ? [
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
                ] : [
                    {
                        id_user: investor.id_user,
                        amount: 600000.00,
                        status: 'success',
                        date: new Date('2024-01-20')
                    },
                    {
                        id_user: investor.id_user,
                        amount: 900000.00,
                        status: 'success',
                        date: new Date('2024-02-25')
                    },
                    {
                        id_user: investor.id_user,
                        amount: 400000.00,
                        status: 'pending',
                        date: new Date('2024-03-12')
                    },
                    {
                        id_user: investor.id_user,
                        amount: 150000.00,
                        status: 'rejected',
                        date: new Date('2024-03-22')
                    }
                ];

                for (const withdrawal of withdrawalData) {
                    await prisma.withdrawal.create({ data: withdrawal });
                }
                console.log(`✅ Data withdrawal ${name} berhasil dibuat`);
            } else {
                console.log(`ℹ️  Data withdrawal ${name} sudah ada`);
            }
        }

        console.log('💰 Seeding data investor selesai!');

    } catch (error) {
        console.error('❌ Error saat seeding data investor:', error);
    }
}

// Jalankan seeder
seedUsers();
