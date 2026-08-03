export type CurrentUser = Readonly<{
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  role: "member" | "admin";
  status: "active" | "suspended";
}>;

export type CurrentSession = Readonly<{
  id: string;
  userId: string;
  expiresAt: Date;
  user: CurrentUser;
}>;

type AuthSessionLike = Readonly<{
  session: Readonly<{
    id: string;
    userId: string;
    expiresAt: Date | string;
  }>;
  user: Readonly<{
    id: string;
    name: string;
    email: string;
    createdAt: Date | string;
    role: unknown;
    status: unknown;
  }>;
}>;

function toValidDate(value: Date | string): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toCurrentSession(
  value: AuthSessionLike | null,
  now = new Date(),
): CurrentSession | null {
  if (
    !value ||
    value.session.userId !== value.user.id ||
    (value.user.role !== "member" && value.user.role !== "admin") ||
    (value.user.status !== "active" && value.user.status !== "suspended")
  ) {
    return null;
  }

  const expiresAt = toValidDate(value.session.expiresAt);
  const createdAt = toValidDate(value.user.createdAt);

  if (!expiresAt || !createdAt || expiresAt.getTime() <= now.getTime()) {
    return null;
  }

  return {
    id: value.session.id,
    userId: value.session.userId,
    expiresAt,
    user: {
      id: value.user.id,
      name: value.user.name,
      email: value.user.email,
      createdAt,
      role: value.user.role,
      status: value.user.status,
    },
  };
}
