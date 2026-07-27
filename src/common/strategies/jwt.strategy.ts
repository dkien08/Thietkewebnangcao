import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Lấy token từ header theo định dạng: Bearer <TOKEN>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Từ chối nếu token đã hết hạn
      secretOrKey: process.env.JWT_SECRET, // Khóa bí mật để giải mã
    });
  }

  // Sau khi giải mã thành công, NestJS sẽ tự động gọi hàm này
  async validate(payload: any) {
  const userId = payload.sub ?? payload.userId;
  return {
    id: Number(userId),
    userId: Number(userId),
    sub: Number(userId),
    role: payload.role,
    email: payload.email,
    currentMode: payload.currentMode

  };
}
}