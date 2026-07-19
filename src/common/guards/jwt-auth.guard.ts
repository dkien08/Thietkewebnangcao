import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Hàm này kiểm tra quyền truy cập
  canActivate(context: ExecutionContext) {
    // Kế thừa khả năng kiểm tra token mặc định của Passport
    return super.canActivate(context);
  }

  // Hàm xử lý khi phát hiện lỗi xác thực
  handleRequest(err: any, user: any, info: any) {
    // Nếu có lỗi hoặc không giải mã được thông tin user từ Token
    if (err || !user) {
      throw err || new UnauthorizedException('Bạn chưa đăng nhập hoặc Token không hợp lệ!');
    }
    
    // Trả về thông tin user hợp lệ (sẽ được gán vào req.user)
    return user;
  }
}