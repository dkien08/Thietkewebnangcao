// File: src/user/user.module.ts
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config"; // Import ConfigModule & ConfigService
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { AuthController } from "./auth.controller";
import { User } from "./user.entity";
import { JwtStrategy } from "../common/strategies/jwt.strategy";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    // Cấu hình JwtModule đọc biến môi trường qua ConfigService một cách an toàn
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET,
        signOptions: { expiresIn: "1d" },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController, AuthController],
  providers: [UserService, JwtStrategy],
  exports: [PassportModule, JwtModule, UserService],
})
export class UserModule {}