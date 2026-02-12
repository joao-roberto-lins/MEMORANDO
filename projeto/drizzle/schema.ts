import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  longtext,
  boolean,
  decimal,
} from "drizzle-orm/mysql-core";

/**
 * Tabela de usuários com suporte a perfis e setores
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Campos específicos do SIGM
  cargo: varchar("cargo", { length: 255 }),
  setor_id: int("setor_id"),
  status: mysqlEnum("status", ["ativo", "inativo"]).default("ativo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de setores/departamentos
 */
export const setores = mysqlTable("setores", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  sigla: varchar("sigla", { length: 50 }).notNull().unique(),
  responsavel_id: int("responsavel_id"),
  email: varchar("email", { length: 320 }),
  descricao: text("descricao"),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Setor = typeof setores.$inferSelect;
export type InsertSetor = typeof setores.$inferInsert;

/**
 * Tabela de memorandos
 */
export const memorandos = mysqlTable("memorandos", {
  id: int("id").autoincrement().primaryKey(),
  numero: varchar("numero", { length: 50 }).notNull().unique(),
  ano: int("ano").notNull(),
  setor_id: int("setor_id").notNull(),
  remetente_id: int("remetente_id").notNull(),
  destinatario_setor_id: int("destinatario_setor_id").notNull(),
  destinatario_usuario_id: int("destinatario_usuario_id"),
  assunto: varchar("assunto", { length: 500 }).notNull(),
  corpo: longtext("corpo").notNull(),
  status: mysqlEnum("status", [
    "em_elaboracao",
    "enviado",
    "recebido",
    "em_analise",
    "respondido",
    "finalizado",
    "arquivado",
  ])
    .default("em_elaboracao")
    .notNull(),
  protocolo: varchar("protocolo", { length: 50 }).unique(),
  data_envio: timestamp("data_envio"),
  data_recebimento: timestamp("data_recebimento"),
  observacoes: longtext("observacoes"),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Memorando = typeof memorandos.$inferSelect;
export type InsertMemorado = typeof memorandos.$inferInsert;

/**
 * Tabela de tramitação de memorandos
 */
export const tramites = mysqlTable("tramites", {
  id: int("id").autoincrement().primaryKey(),
  memorando_id: int("memorando_id").notNull(),
  status_anterior: varchar("status_anterior", { length: 50 }),
  status_novo: varchar("status_novo", { length: 50 }).notNull(),
  usuario_id: int("usuario_id").notNull(),
  setor_origem_id: int("setor_origem_id"),
  setor_destino_id: int("setor_destino_id"),
  observacoes: longtext("observacoes"),
  data_movimentacao: timestamp("data_movimentacao").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Tramite = typeof tramites.$inferSelect;
export type InsertTramite = typeof tramites.$inferInsert;

/**
 * Tabela de anexos
 */
export const anexos = mysqlTable("anexos", {
  id: int("id").autoincrement().primaryKey(),
  memorando_id: int("memorando_id").notNull(),
  nome_arquivo: varchar("nome_arquivo", { length: 500 }).notNull(),
  tipo_arquivo: varchar("tipo_arquivo", { length: 100 }).notNull(),
  caminho: varchar("caminho", { length: 1000 }).notNull(),
  tamanho: int("tamanho"),
  url_s3: varchar("url_s3", { length: 1000 }),
  criado_por: int("criado_por").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Anexo = typeof anexos.$inferSelect;
export type InsertAnexo = typeof anexos.$inferInsert;

/**
 * Tabela de protocolos eletrônicos
 */
export const protocolos = mysqlTable("protocolos", {
  id: int("id").autoincrement().primaryKey(),
  numero_protocolo: varchar("numero_protocolo", { length: 50 }).notNull().unique(),
  memorando_id: int("memorando_id").notNull().unique(),
  data_protocolo: timestamp("data_protocolo").defaultNow().notNull(),
  hash_documento: varchar("hash_documento", { length: 255 }),
  qr_code: longtext("qr_code"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Protocolo = typeof protocolos.$inferSelect;
export type InsertProtocolo = typeof protocolos.$inferInsert;

/**
 * Tabela de logs de auditoria
 */
export const logs_auditoria = mysqlTable("logs_auditoria", {
  id: int("id").autoincrement().primaryKey(),
  usuario_id: int("usuario_id").notNull(),
  acao: varchar("acao", { length: 100 }).notNull(),
  tabela: varchar("tabela", { length: 100 }).notNull(),
  registro_id: int("registro_id"),
  descricao: longtext("descricao"),
  dados_anteriores: longtext("dados_anteriores"),
  dados_novos: longtext("dados_novos"),
  endereco_ip: varchar("endereco_ip", { length: 50 }),
  user_agent: varchar("user_agent", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LogAuditoria = typeof logs_auditoria.$inferSelect;
export type InsertLogAuditoria = typeof logs_auditoria.$inferInsert;
