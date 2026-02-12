import { eq, and, like, desc, asc, gte, lte, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  setores,
  memorandos,
  tramites,
  anexos,
  protocolos,
  logs_auditoria,
  Memorando,
  Setor,
  Tramite,
  LogAuditoria,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USERS ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "cargo"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (user.setor_id !== undefined) {
      values.setor_id = user.setor_id;
      updateSet.setor_id = user.setor_id;
    }

    if (user.status !== undefined) {
      values.status = user.status;
      updateSet.status = user.status;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users).orderBy(asc(users.name));
}

export async function updateUser(
  id: number,
  updates: Partial<InsertUser>
) {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set(updates).where(eq(users.id, id));
}

export async function createUser(user: InsertUser) {
  const db = await getDb();
  if (!db) return;

  const result = await db.insert(users).values(user);
  return result;
}

// ==================== SETORES ====================

export async function getAllSetores() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(setores).where(eq(setores.ativo, true));
}

export async function getSetorById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(setores).where(eq(setores.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSetor(setor: typeof setores.$inferInsert) {
  const db = await getDb();
  if (!db) return;

  const result = await db.insert(setores).values(setor);
  return result;
}

export async function updateSetor(id: number, updates: Partial<Setor>) {
  const db = await getDb();
  if (!db) return;

  await db.update(setores).set(updates).where(eq(setores.id, id));
}

// ==================== MEMORANDOS ====================

export async function createMemorado(memorando: typeof memorandos.$inferInsert) {
  const db = await getDb();
  if (!db) return;

  const result = await db.insert(memorandos).values(memorando);
  return result;
}

export async function getMemorandoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(memorandos)
    .where(and(eq(memorandos.id, id), eq(memorandos.ativo, true)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getMemorandoByNumero(numero: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(memorandos)
    .where(and(eq(memorandos.numero, numero), eq(memorandos.ativo, true)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listMemorandos(filters?: {
  setor_id?: number;
  remetente_id?: number;
  destinatario_setor_id?: number;
  status?: string;
  assunto?: string;
  numero?: string;
  dataInicio?: Date;
  dataFim?: Date;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(memorandos.ativo, true)];

  if (filters?.setor_id) {
    conditions.push(eq(memorandos.setor_id, filters.setor_id));
  }

  if (filters?.remetente_id) {
    conditions.push(eq(memorandos.remetente_id, filters.remetente_id));
  }

  if (filters?.destinatario_setor_id) {
    conditions.push(eq(memorandos.destinatario_setor_id, filters.destinatario_setor_id));
  }

  if (filters?.status) {
    conditions.push(eq(memorandos.status, filters.status as any));
  }

  if (filters?.assunto) {
    conditions.push(like(memorandos.assunto, `%${filters.assunto}%`));
  }

  if (filters?.numero) {
    conditions.push(like(memorandos.numero, `%${filters.numero}%`));
  }

  if (filters?.dataInicio) {
    conditions.push(gte(memorandos.createdAt, filters.dataInicio));
  }

  if (filters?.dataFim) {
    conditions.push(lte(memorandos.createdAt, filters.dataFim));
  }

  const result = await db
    .select()
    .from(memorandos)
    .where(and(...conditions))
    .orderBy(desc(memorandos.createdAt))
    .limit(filters?.limit || 50)
    .offset(filters?.offset || 0);

  return result;
}

export async function updateMemorado(
  id: number,
  updates: Partial<Memorando>
) {
  const db = await getDb();
  if (!db) return;

  await db.update(memorandos).set(updates).where(eq(memorandos.id, id));
}

export async function deleteMemorado(id: number) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(memorandos)
    .set({ ativo: false })
    .where(eq(memorandos.id, id));
}

export async function getProximoNumeroMemorado(setorId: number, ano: number) {
  const db = await getDb();
  if (!db) return 1;

  const setor = await getSetorById(setorId);
  if (!setor) return 1;

  const result = await db
    .select()
    .from(memorandos)
    .where(and(eq(memorandos.setor_id, setorId), eq(memorandos.ano, ano)))
    .orderBy(desc(memorandos.numero));

  if (result.length === 0) return 1;

  const ultimoNumero = result[0]?.numero;
  if (!ultimoNumero) return 1;

  const match = ultimoNumero.match(/MEM-(\d+)/);
  if (!match) return 1;

  return parseInt(match[1], 10) + 1;
}

// ==================== TRAMITES ====================

export async function createTramite(tramite: typeof tramites.$inferInsert) {
  const db = await getDb();
  if (!db) return;

  const result = await db.insert(tramites).values(tramite);
  return result;
}

export async function getTramitesByMemorandoId(memorandoId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(tramites)
    .where(eq(tramites.memorando_id, memorandoId))
    .orderBy(desc(tramites.data_movimentacao));
}

// ==================== ANEXOS ====================

export async function createAnexo(anexo: typeof anexos.$inferInsert) {
  const db = await getDb();
  if (!db) return;

  const result = await db.insert(anexos).values(anexo);
  return result;
}

export async function getAnexosByMemorandoId(memorandoId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(anexos)
    .where(eq(anexos.memorando_id, memorandoId));
}

export async function deleteAnexo(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(anexos).where(eq(anexos.id, id));
}

// ==================== PROTOCOLOS ====================

export async function createProtocolo(protocolo: typeof protocolos.$inferInsert) {
  const db = await getDb();
  if (!db) return;

  const result = await db.insert(protocolos).values(protocolo);
  return result;
}

export async function getProtocoloByMemorandoId(memorandoId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(protocolos)
    .where(eq(protocolos.memorando_id, memorandoId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ==================== AUDITORIA ====================

export async function createLogAuditoria(log: typeof logs_auditoria.$inferInsert) {
  const db = await getDb();
  if (!db) return;

  const result = await db.insert(logs_auditoria).values(log);
  return result;
}

export async function getLogsAuditoria(filters?: {
  usuario_id?: number;
  acao?: string;
  tabela?: string;
  dataInicio?: Date;
  dataFim?: Date;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.usuario_id) {
    conditions.push(eq(logs_auditoria.usuario_id, filters.usuario_id));
  }

  if (filters?.acao) {
    conditions.push(eq(logs_auditoria.acao, filters.acao));
  }

  if (filters?.tabela) {
    conditions.push(eq(logs_auditoria.tabela, filters.tabela));
  }

  if (filters?.dataInicio) {
    conditions.push(gte(logs_auditoria.createdAt, filters.dataInicio));
  }

  if (filters?.dataFim) {
    conditions.push(lte(logs_auditoria.createdAt, filters.dataFim));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const result = await db
    .select()
    .from(logs_auditoria)
    .where(whereClause)
    .orderBy(desc(logs_auditoria.createdAt))
    .limit(filters?.limit || 100)
    .offset(filters?.offset || 0);

  return result;
}
