/**
 * 管理 Action 的共享类型与初始状态。
 *
 * 不能定义在 actions.ts（"use server" 文件只能导出 async 函数，值导出会被
 * Next 构建拒绝），因此单独放到非 server 模块；actions.ts 通过 re-export
 * 保持对外接口一致，Client Component 直接从此模块取值。
 */
export type AdminActionState = Readonly<{
  status: "idle" | "success" | "error";
  message?: string;
  /** 创建邀请码成功时，明文邀请码只在本次响应中出现一次。 */
  invitationCode?: string;
  fieldErrors?: Readonly<Record<string, string | undefined>>;
}>;

export const INITIAL_ADMIN_ACTION_STATE: AdminActionState = { status: "idle" };
