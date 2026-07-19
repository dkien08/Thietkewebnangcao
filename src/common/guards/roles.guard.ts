import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy danh sách các Roles được phép truy cập từ Decorator `@Roles(...)` trên API
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true; // Nếu API không yêu cầu quyền cụ thể nào, cho phép đi qua
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Kiểm tra xem vai trò của user có nằm trong danh sách quyền được cho phép không
    const hasRole = requiredRoles.includes(user?.role);
    if (!hasRole) {
      throw new ForbiddenException('Bạn không có quyền thực hiện hành động này!');
    }

    return true;
  }
}