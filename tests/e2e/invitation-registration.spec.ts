import { expect, test } from "@playwright/test";

import {
  countUsersByEmail,
  createTestInvitation,
  getUserAuthorityByEmail,
  readInvitationByCode,
} from "./helpers/database";

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100_000)}@example.com`;
}

function signUpBody(email: string, inviteCode?: string, password = "password123") {
  return {
    name: "准入测试用户",
    email,
    password,
    ...(inviteCode ? { inviteCode } : {}),
  };
}

test("public registration rejects missing, malformed, expired, and disabled invitations", async ({
  request,
}) => {
  const expired = await createTestInvitation({
    expiresAt: new Date(Date.now() - 60_000),
  });
  const disabled = await createTestInvitation({ disabled: true });
  const attempts = [
    signUpBody(uniqueEmail("invite-missing")),
    signUpBody(uniqueEmail("invite-malformed"), "not-a-valid-code"),
    signUpBody(uniqueEmail("invite-expired"), expired),
    signUpBody(uniqueEmail("invite-disabled"), disabled),
  ];

  for (const body of attempts) {
    const response = await request.post("/api/auth/sign-up/email", { data: body });
    expect(response.ok()).toBe(false);
  }
});

test("a failed registration does not consume an invitation", async ({ request }) => {
  const code = await createTestInvitation({ maxUses: 1 });
  const failed = await request.post("/api/auth/sign-up/email", {
    data: signUpBody(uniqueEmail("invite-failed"), code, "short"),
  });
  expect(failed.ok()).toBe(false);

  const afterFailure = await readInvitationByCode(code);
  expect(Number(afterFailure?.used_count)).toBe(0);

  const success = await request.post("/api/auth/sign-up/email", {
    data: signUpBody(uniqueEmail("invite-retry"), code),
  });
  expect(success.status()).toBe(200);
  expect(Number((await readInvitationByCode(code))?.used_count)).toBe(1);
});

test("concurrent registration cannot exceed an invitation's maximum uses", async ({
  request,
}) => {
  const code = await createTestInvitation({ maxUses: 1 });
  const emails = [uniqueEmail("invite-race-a"), uniqueEmail("invite-race-b")];
  const responses = await Promise.all(
    emails.map((email) =>
      request.post("/api/auth/sign-up/email", {
        data: signUpBody(email, code),
      }),
    ),
  );

  expect(responses.filter((response) => response.status() === 200)).toHaveLength(1);
  expect(responses.filter((response) => !response.ok())).toHaveLength(1);
  const invitation = await readInvitationByCode(code);
  expect(Number(invitation?.used_count)).toBe(1);
  expect(await countUsersByEmail(emails)).toBe(1);

  const serialized = JSON.stringify(invitation);
  expect(serialized).not.toContain(code);
  expect(invitation?.code_hash).not.toBe(code);
});

test("an exhausted invitation stays invalid", async ({ request }) => {
  const code = await createTestInvitation({ maxUses: 1 });
  const first = await request.post("/api/auth/sign-up/email", {
    data: signUpBody(uniqueEmail("invite-first"), code),
  });
  expect(first.status()).toBe(200);

  const second = await request.post("/api/auth/sign-up/email", {
    data: signUpBody(uniqueEmail("invite-exhausted"), code),
  });
  expect(second.ok()).toBe(false);
  expect(Number((await readInvitationByCode(code))?.used_count)).toBe(1);
});

test("registration ignores forged role and account status fields", async ({ request }) => {
  const code = await createTestInvitation();
  const email = uniqueEmail("invite-forged-authority");
  const response = await request.post("/api/auth/sign-up/email", {
    data: {
      ...signUpBody(email, code),
      role: "admin",
      status: "suspended",
    },
  });
  if (response.ok()) {
    const authority = await getUserAuthorityByEmail(email);
    expect(authority.role).toBe("member");
    expect(authority.status).toBe("active");
  } else {
    expect(await countUsersByEmail([email])).toBe(0);
  }
});
