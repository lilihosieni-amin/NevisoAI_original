import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './common/redis/redis.module';
import { formatError } from './common/errors/format-error';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';

const isProduction = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validationSchema,
      validationOptions: { abortEarly: false },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
      // Playground / introspection are dev-only (ARD §16, Phase 0).
      playground: false,
      introspection: !isProduction,
      // Expose req/res to resolvers (refresh-cookie I/O, client IP).
      context: ({ req, res }: { req: unknown; res: unknown }) => ({ req, res }),
      // Sanitize every outgoing error to { code, data?, traceId } (ARD §16.1).
      formatError,
      // `as any`: @apollo/server ships dual CJS/ESM type decls; the plugin and
      // the driver config can resolve to different copies, producing a private
      // `__identity` clash under ts-jest. The runtime value is correct.
      plugins: isProduction ? [] : [ApolloServerPluginLandingPageLocalDefault() as any],
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    AdminModule,
    HealthModule,
  ],
})
export class AppModule {}
