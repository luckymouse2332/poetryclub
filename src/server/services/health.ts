export type HealthStatus = Readonly<{
  status: "ok";
}>;

export function getHealthStatus(): HealthStatus {
  return { status: "ok" };
}
