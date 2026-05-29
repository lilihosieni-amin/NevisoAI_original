/**
 * Database seed (idempotent). Run via `npm run seed --workspace=@neviso/db`.
 *
 * Phase 1 seeds:
 *  - AppSetting `otp.channels` = "BOTH"  (ARD §7.2.1 — seeded to BOTH at launch)
 *  - The first SUPER_ADMIN from env credentials (ARD rule §16.10 — no public
 *    admin sign-up; the first operator is seeded). Password is bcrypt-hashed.
 *
 * Safe to re-run: every write is an upsert.
 */
import { hash } from 'bcryptjs';
import { PrismaClient } from '../generated/client';

const prisma = new PrismaClient();

const BCRYPT_COST = 12;

async function seedOtpChannelMode(): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key: 'otp.channels' },
    update: {},
    create: { key: 'otp.channels', value: 'BOTH' },
  });
  console.log('✓ AppSetting otp.channels = BOTH');
}

async function seedSuperAdmin(): Promise<void> {
  const email = process.env.SEED_SUPER_ADMIN_EMAIL;
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD;
  const mobile = process.env.SEED_SUPER_ADMIN_MOBILE;
  const displayName = process.env.SEED_SUPER_ADMIN_NAME ?? 'Super Admin';

  if (!email || !password || !mobile) {
    console.warn(
      '! Skipping SUPER_ADMIN seed: set SEED_SUPER_ADMIN_EMAIL, ' +
        'SEED_SUPER_ADMIN_PASSWORD and SEED_SUPER_ADMIN_MOBILE to create it.',
    );
    return;
  }

  const passwordHash = await hash(password, BCRYPT_COST);
  await prisma.admin.upsert({
    where: { email },
    // Never silently overwrite an existing admin's password/role on re-seed.
    update: {},
    create: { email, passwordHash, mobile, displayName, role: 'SUPER_ADMIN', isActive: true },
  });
  console.log(`✓ SUPER_ADMIN ${email}`);
}

async function main(): Promise<void> {
  await seedOtpChannelMode();
  await seedSuperAdmin();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
