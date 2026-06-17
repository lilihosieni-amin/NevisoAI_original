/**
 * Database seed (DEVELOPMENT_PLAN §1.4).
 *
 * Idempotent — safe to run repeatedly. Seeds:
 *  - the first SUPER_ADMIN (mobile + bcrypt temp password; ARD §5.9.7)
 *  - AppSetting `otp.channels = "BOTH"` (ARD §5.9.8 / §7.2.1)
 *  - a few sample credit-pack Plan rows
 *
 * Credentials come from env (SEED_SUPER_ADMIN_MOBILE / _PASSWORD) so no real
 * secret is committed.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, AdminRole } from '../generated/client';

const prisma = new PrismaClient();

const SUPER_ADMIN_MOBILE = process.env.SEED_SUPER_ADMIN_MOBILE ?? '9120000000';
const SUPER_ADMIN_PASSWORD = process.env.SEED_SUPER_ADMIN_PASSWORD ?? 'ChangeMe!123';
const BCRYPT_COST = 12;

async function seedSuperAdmin() {
  const passwordHash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, BCRYPT_COST);
  const admin = await prisma.admin.upsert({
    where: { mobile: SUPER_ADMIN_MOBILE },
    update: {},
    create: {
      mobile: SUPER_ADMIN_MOBILE,
      passwordHash,
      displayName: 'مدیر ارشد',
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
  });
  console.log(`  ✓ SUPER_ADMIN ready (mobile ${admin.mobile})`);
}

async function seedAppSettings() {
  await prisma.appSetting.upsert({
    where: { key: 'otp.channels' },
    update: {},
    create: { key: 'otp.channels', value: 'BOTH' },
  });
  console.log('  ✓ AppSetting otp.channels = "BOTH"');
}

async function seedPlans() {
  const plans = [
    { name: 'بستهٔ ۱۰۰ اعتباری', originalPriceIRT: 100_000, priceIRT: 90_000, credits: 100 },
    { name: 'بستهٔ ۳۰۰ اعتباری', originalPriceIRT: 300_000, priceIRT: 240_000, credits: 300 },
    { name: 'بستهٔ ۱۰۰۰ اعتباری', originalPriceIRT: 1_000_000, priceIRT: 700_000, credits: 1000 },
  ];

  for (const plan of plans) {
    const existing = await prisma.plan.findFirst({ where: { name: plan.name } });
    if (existing) {
      await prisma.plan.update({ where: { id: existing.id }, data: plan });
    } else {
      await prisma.plan.create({ data: plan });
    }
  }
  console.log(`  ✓ ${plans.length} sample credit-pack plans ready`);
}

async function main() {
  console.log('Seeding Neviso database…');
  await seedSuperAdmin();
  await seedAppSettings();
  await seedPlans();
  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
