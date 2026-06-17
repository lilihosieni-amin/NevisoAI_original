import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppConfigModule } from './config/app-config.module';
import { AppConfigService } from './config/app-config.service';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { AppResolver } from './app.resolver';
import { formatError } from './common/errors/format-error';

@Module({
  imports: [
    AppConfigModule,
    CommonModule,
    AuthModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        autoSchemaFile: true,
        sortSchema: true,
        playground: false,
        introspection: true,
        // The central sanitizer (ARD §16): nothing technical reaches the client.
        formatError,
        // Expose req/res to resolvers + guards (auth, cookies).
        context: ({ req, res }: { req: unknown; res: unknown }) => ({ req, res }),
        subscriptions: {
          'graphql-ws': true,
        },
        // Lock down the schema-introspecting playground in production.
        ...(config.isProduction ? { introspection: false } : {}),
      }),
    }),
  ],
  controllers: [HealthController],
  providers: [AppResolver],
})
export class AppModule {}
