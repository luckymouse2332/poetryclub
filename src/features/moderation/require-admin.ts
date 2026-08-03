import { forbidden } from "next/navigation";

import {
  AccessControlError,
  requireAdmin,
  type AuthoritativeUser,
} from "@/server/policies/access";

/**
 * 读取当前管理员身份；权限不足（非 admin 或已被禁用）时渲染 /admin 段级的
 * 403 边界。行为与 admin/layout 完全一致，供需要在页面内再取一次管理员
 * 身份的 Server Component 复用（如首页欢迎语、用户列表的自身标记）。
 */
export async function requireAdminOrForbidden(): Promise<AuthoritativeUser> {
  try {
    return await requireAdmin("/admin");
  } catch (error) {
    if (error instanceof AccessControlError) {
      forbidden();
    }
    throw error;
  }
}
