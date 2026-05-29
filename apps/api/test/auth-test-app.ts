import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { OTP_BALE_SENDER, OTP_SMS_SENDER } from '../src/otp/otp-sender.interface';
import { FakeBaleSender, FakeSmsSender } from '../src/otp/providers/fake-senders';
import { PrismaService } from '../src/prisma/prisma.service';

export interface TestApp {
  app: INestApplication;
  prisma: PrismaService;
  sms: FakeSmsSender;
  bale: FakeBaleSender;
}

/**
 * Boots the real API (GraphQL + Prisma + Redis) against the ephemeral test
 * stack, with the OTP providers replaced by inspectable in-memory fakes
 * (working agreement: external services are faked in tests).
 */
export async function createTestApp(): Promise<TestApp> {
  const sms = new FakeSmsSender();
  const bale = new FakeBaleSender();

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(OTP_SMS_SENDER)
    .useValue(sms)
    .overrideProvider(OTP_BALE_SENDER)
    .useValue(bale)
    .compile();

  const app = moduleRef.createNestApplication();
  app.use(cookieParser());
  await app.init();

  return { app, prisma: app.get(PrismaService), sms, bale };
}

/** Sets the OTP channel mode in the test DB (defaults to BOTH when unset). */
export async function setOtpMode(prisma: PrismaService, mode: string): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key: 'otp.channels' },
    update: { value: mode },
    create: { key: 'otp.channels', value: mode },
  });
}
