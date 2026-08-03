import "server-only";

import { createHash } from "node:crypto";

import {
  APIError,
  getCurrentAdapter,
  type BetterAuthPlugin,
  type DBAdapter,
} from "better-auth";
import { createAuthMiddleware } from "better-auth/api";

import { invitationCodeSchema } from "@/server/validation/moderation";

const INVALID_INVITATION_MESSAGE = "邀请码无效或已失效";

type InvitationAdapterRow = Readonly<{
  id: string;
  codeHash: string;
  maxUses: number;
  usedCount: number;
  expiresAt: Date;
  disabledAt: Date | null;
}>;

export function hashInvitationCode(code: string): string {
  return createHash("sha256").update(code, "utf8").digest("hex");
}

function invalidInvitation(): never {
  throw APIError.from("BAD_REQUEST", {
    code: "INVALID_INVITATION",
    message: INVALID_INVITATION_MESSAGE,
  });
}

function readInvitationCode(body: unknown): string {
  if (!body || typeof body !== "object" || !("inviteCode" in body)) {
    return invalidInvitation();
  }

  const parsed = invitationCodeSchema.safeParse(body.inviteCode);
  return parsed.success ? parsed.data : invalidInvitation();
}

async function findUsableInvitation(
  adapter: Pick<DBAdapter, "findOne">,
  codeHash: string,
  now: Date,
): Promise<InvitationAdapterRow | null> {
  const row = await adapter.findOne<InvitationAdapterRow>({
    model: "invitation",
    where: [
      { field: "codeHash", value: codeHash },
      { field: "disabledAt", value: null },
      { field: "expiresAt", operator: "gt", value: now },
    ],
  });

  return row && row.usedCount < row.maxUses ? row : null;
}

/**
 * Better Auth registration extension. The HTTP hook gives every email sign-up
 * the same invitation error before duplicate-email handling. The account hook
 * performs the authoritative guarded increment through Better Auth's current
 * transaction adapter, so user/account creation and invitation consumption
 * commit or roll back together.
 */
export function invitationRegistrationPlugin(): BetterAuthPlugin {
  return {
    id: "poetryclub-invitation-registration",
    schema: {
      invitation: {
        fields: {
          codeHash: { type: "string", required: true, unique: true },
          createdBy: { type: "string", required: true },
          maxUses: { type: "number", required: true },
          usedCount: { type: "number", required: true, defaultValue: 0 },
          expiresAt: { type: "date", required: true },
          disabledAt: { type: "date", required: false },
          disabledBy: { type: "string", required: false },
          createdAt: { type: "date", required: true },
        },
      },
    },
    hooks: {
      before: [
        {
          matcher: (context) => context.path === "/sign-up/email",
          handler: createAuthMiddleware(async (context) => {
            const code = readInvitationCode(context.body);
            const invitation = await findUsableInvitation(
              context.context.adapter,
              hashInvitationCode(code),
              new Date(),
            );
            if (!invitation) invalidInvitation();
          }),
        },
      ],
    },
    init(context) {
      return {
        options: {
          databaseHooks: {
            account: {
              create: {
                async before(account, endpointContext) {
                  if (
                    endpointContext?.path !== "/sign-up/email" ||
                    account.providerId !== "credential"
                  ) {
                    return;
                  }

                  const code = readInvitationCode(endpointContext.body);
                  const codeHash = hashInvitationCode(code);
                  const adapter = await getCurrentAdapter(context.adapter);
                  const invitation = await findUsableInvitation(
                    adapter,
                    codeHash,
                    new Date(),
                  );
                  if (!invitation) invalidInvitation();

                  const consumed = await adapter.incrementOne<InvitationAdapterRow>({
                    model: "invitation",
                    where: [
                      { field: "id", value: invitation.id },
                      { field: "codeHash", value: codeHash },
                      { field: "disabledAt", value: null },
                      { field: "expiresAt", operator: "gt", value: new Date() },
                      {
                        field: "usedCount",
                        operator: "lt",
                        value: invitation.maxUses,
                      },
                    ],
                    increment: { usedCount: 1 },
                  });
                  if (!consumed) invalidInvitation();
                },
              },
            },
          },
        },
      };
    },
  };
}
