import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ProductsModule } from './products/products.module';
import { SourcesModule } from './sources/sources.module';
import { ClaimsModule } from './claims/claims.module';
import { CriteriaModule } from './criteria/criteria.module';
import { ScoringModule } from './scoring/scoring.module';
import { EditorialModule } from './editorial/editorial.module';
import { SeoModule } from './seo/seo.module';
import { AffiliateModule } from './affiliate/affiliate.module';
import { ExportsModule } from './exports/exports.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'product_review_crew',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    TerminusModule,
    AuthModule,
    ReviewsModule,
    ProductsModule,
    SourcesModule,
    ClaimsModule,
    CriteriaModule,
    ScoringModule,
    EditorialModule,
    SeoModule,
    AffiliateModule,
    ExportsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

