import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1, role: "admin" | "user" = "user"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    cargo: "Teste",
    setor_id: 1,
    status: "ativo",
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("Auth Router", () => {
  it("should return current user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result).toBeDefined();
    expect(result?.id).toBe(1);
    expect(result?.role).toBe("user");
  });


});

describe("Setores Router", () => {
  it("should return setores list", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.setores.listar();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Usuarios Router", () => {
  it("should deny user listing for non-admin", async () => {
    const { ctx } = createAuthContext(1, "user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.usuarios.listar();
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should allow user listing for admin", async () => {
    const { ctx } = createAuthContext(1, "admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.usuarios.listar();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Memorandos Router", () => {
  it("should list memorandos", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.memorandos.listar({});

    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter memorandos by status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.memorandos.listar({
      status: "enviado",
    });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("Auditoria Router", () => {
  it("should deny audit log access for non-admin", async () => {
    const { ctx } = createAuthContext(1, "user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.auditoria.listar({});
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should allow audit log access for admin", async () => {
    const { ctx } = createAuthContext(1, "admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auditoria.listar({});

    expect(Array.isArray(result)).toBe(true);
  });
});
