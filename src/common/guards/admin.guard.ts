import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Thằng này được JwtAuthGuard giải mã từ Token và đút sẵn vào request

    // 🛡️ Kiểm tra nếu không có user hoặc role không phải Admin thì chặn đứng ngay!
    if (!user || user.role !== 'Admin') {
      throw new ForbiddenException('Bạn không có quyền truy cập tài nguyên này!');
    }

    return true;
  }
}