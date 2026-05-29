import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
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
      // `as any`: @apollo/server ships dual CJS/ESM type decls; the plugin and
      // the driver config can resolve to different copies, producing a private
      // `__identity` clash under ts-jest. The runtime value is correct.
      plugins: isProduction ? [] : [ApolloServerPluginLandingPageLocalDefault() as any],
    }),
    PrismaModule,
    HealthModule,
  ],
})
export class AppModule {}
