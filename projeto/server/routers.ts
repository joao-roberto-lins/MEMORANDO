import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { generateMemorandoPDF } from "./pdf";
import { sendMemorandoNotification } from "./email";
import {
  createMemorado,
  getMemorandoById,
  getMemorandoByNumero,
  listMemorandos,
  updateMemorado,
  deleteMemorado,
  getProximoNumeroMemorado,
  getAllUsers,
  getUserById,
  updateUser,
  createUser,
  getAllSetores,
  getSetorById,
  createSetor,
  updateSetor,
  createTramite,
  getTramitesByMemorandoId,
  createAnexo,
  getAnexosByMemorandoId,
  deleteAnexo,
  createProtocolo,
  getProtocoloByMemorandoId,
  createLogAuditoria,
  getLogsAuditoria,
} from "./db";
import crypto from "crypto";

// ==================== ADMIN PROCEDURE ====================

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new Error("Acesso negado: apenas administradores podem acessar este recurso");
  }
  return next({ ctx });
});

// ==================== ROUTERS ====================

export const appRouter = router({
  system: systemRouter,

  // ==================== AUTH ====================
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ==================== USUÁRIOS ====================
  usuarios: router({
    listar: adminProcedure.query(async () => {
      return await getAllUsers();
    }),

    obter: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await getUserById(input.id);
    }),

    criar: adminProcedure
      .input(
        z.object({
          name: z.string(),
          email: z.string().email(),
          cargo: z.string(),
          setor_id: z.number(),
          status: z.enum(["ativo", "inativo"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const usuario = await createUser({
          openId: `user-${Date.now()}`,
          name: input.name,
          email: input.email,
          cargo: input.cargo,
          setor_id: input.setor_id,
          status: input.status,
          role: "user",
          loginMethod: "manual",
        });

        // Log de auditoria
        await createLogAuditoria({
          usuario_id: ctx.user.id,
          acao: "CRIAR",
          tabela: "users",
          descricao: `Usuário ${input.name} criado`,
          dados_novos: JSON.stringify(input),
        });

        return usuario;
      }),

    atualizar: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          email: z.string().email().optional(),
          cargo: z.string().optional(),
          setor_id: z.number().optional(),
          status: z.enum(["ativo", "inativo"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        await updateUser(id, updates);

        // Log de auditoria
        await createLogAuditoria({
          usuario_id: ctx.user.id,
          acao: "ATUALIZAR",
          tabela: "users",
          registro_id: id,
          descricao: `Usuário atualizado`,
          dados_novos: JSON.stringify(updates),
        });

        return { success: true };
      }),
  }),

  // ==================== SETORES ====================
  setores: router({
    listar: protectedProcedure.query(async () => {
      return await getAllSetores();
    }),

    obter: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await getSetorById(input.id);
    }),

    criar: adminProcedure
      .input(
        z.object({
          nome: z.string(),
          sigla: z.string(),
          email: z.string().email().optional(),
          descricao: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const setor = await createSetor({
          nome: input.nome,
          sigla: input.sigla,
          email: input.email,
          descricao: input.descricao,
          ativo: true,
        });

        // Log de auditoria
        await createLogAuditoria({
          usuario_id: ctx.user.id,
          acao: "CRIAR",
          tabela: "setores",
          descricao: `Setor ${input.nome} criado`,
          dados_novos: JSON.stringify(input),
        });

        return setor;
      }),

    atualizar: adminProcedure
      .input(
        z.object({
          id: z.number(),
          nome: z.string().optional(),
          sigla: z.string().optional(),
          email: z.string().email().optional(),
          descricao: z.string().optional(),
          ativo: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        await updateSetor(id, updates);

        // Log de auditoria
        await createLogAuditoria({
          usuario_id: ctx.user.id,
          acao: "ATUALIZAR",
          tabela: "setores",
          registro_id: id,
          descricao: `Setor atualizado`,
          dados_novos: JSON.stringify(updates),
        });

        return { success: true };
      }),
  }),

  // ==================== MEMORANDOS ====================
  memorandos: router({
    listar: protectedProcedure
      .input(
        z.object({
          setor_id: z.number().optional(),
          status: z.string().optional(),
          assunto: z.string().optional(),
          numero: z.string().optional(),
          dataInicio: z.date().optional(),
          dataFim: z.date().optional(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        return await listMemorandos(input);
      }),

    obter: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const memorando = await getMemorandoById(input.id);
        if (!memorando) {
          throw new Error("Memorando não encontrado");
        }
        return memorando;
      }),

    criar: protectedProcedure
      .input(
        z.object({
          destinatario_setor_id: z.number(),
          destinatario_usuario_id: z.number().optional(),
          assunto: z.string(),
          corpo: z.string(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const ano = new Date().getFullYear();
        const proximoNumero = await getProximoNumeroMemorado(ctx.user.setor_id || 1, ano);
        const setor = await getSetorById(ctx.user.setor_id || 1);
        const numero = `MEM-${String(proximoNumero).padStart(3, "0")}/${ano}-${setor?.sigla || "XXX"}`;

        const memorando = await createMemorado({
          numero,
          ano,
          setor_id: ctx.user.setor_id || 1,
          remetente_id: ctx.user.id,
          destinatario_setor_id: input.destinatario_setor_id,
          destinatario_usuario_id: input.destinatario_usuario_id,
          assunto: input.assunto,
          corpo: input.corpo,
          observacoes: input.observacoes,
          status: "em_elaboracao",
          ativo: true,
        });

        // Log de auditoria
        await createLogAuditoria({
          usuario_id: ctx.user.id,
          acao: "CRIAR",
          tabela: "memorandos",
          descricao: `Memorando ${numero} criado`,
          dados_novos: JSON.stringify(input),
        });

        return memorando;
      }),

    atualizar: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          assunto: z.string().optional(),
          corpo: z.string().optional(),
          observacoes: z.string().optional(),
          status: z.enum([
            "em_elaboracao",
            "enviado",
            "recebido",
            "em_analise",
            "respondido",
            "finalizado",
            "arquivado",
          ]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        const memorando = await getMemorandoById(id);

        if (!memorando) {
          throw new Error("Memorando não encontrado");
        }

        if (memorando.remetente_id !== ctx.user.id && ctx.user.role !== "admin") {
          throw new Error("Acesso negado: você não pode editar este memorando");
        }

        await updateMemorado(id, updates);

        // Log de auditoria
        await createLogAuditoria({
          usuario_id: ctx.user.id,
          acao: "ATUALIZAR",
          tabela: "memorandos",
          registro_id: id,
          descricao: `Memorando atualizado`,
          dados_novos: JSON.stringify(updates),
        });

        return { success: true };
      }),

    deletar: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const memorando = await getMemorandoById(input.id);

        if (!memorando) {
          throw new Error("Memorando não encontrado");
        }

        if (memorando.remetente_id !== ctx.user.id && ctx.user.role !== "admin") {
          throw new Error("Acesso negado: você não pode deletar este memorando");
        }

        await deleteMemorado(input.id);

        // Log de auditoria
        await createLogAuditoria({
          usuario_id: ctx.user.id,
          acao: "DELETAR",
          tabela: "memorandos",
          registro_id: input.id,
          descricao: `Memorando deletado`,
        });

        return { success: true };
      }),

    enviar: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const memorando = await getMemorandoById(input.id);

        if (!memorando) {
          throw new Error("Memorando não encontrado");
        }

        if (memorando.remetente_id !== ctx.user.id && ctx.user.role !== "admin") {
          throw new Error("Acesso negado");
        }

        // Gerar protocolo
        const numeroProtocolo = `PROT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const hashDocumento = crypto
          .createHash("sha256")
          .update(JSON.stringify(memorando))
          .digest("hex");

        await createProtocolo({
          numero_protocolo: numeroProtocolo,
          memorando_id: input.id,
          hash_documento: hashDocumento,
        });

        // Atualizar status
        await updateMemorado(input.id, {
          status: "enviado",
          protocolo: numeroProtocolo,
          data_envio: new Date(),
        });

        // Log de auditoria
        await createLogAuditoria({
          usuario_id: ctx.user.id,
          acao: "ENVIAR",
          tabela: "memorandos",
          registro_id: input.id,
          descricao: `Memorando enviado com protocolo ${numeroProtocolo}`,
        });

        // Enviar email para o setor destinatario
        const setorDestinatario = await getSetorById(memorando.destinatario_setor_id);
        const usuarioRemetente = await getUserById(memorando.remetente_id);
        const setorRemetente = await getSetorById(memorando.setor_id);

        if (setorDestinatario?.email) {
          await sendMemorandoNotification(
            setorDestinatario.email,
            memorando.numero,
            memorando.assunto,
            usuarioRemetente?.name || "Sistema",
            setorRemetente?.nome || "N/A"
          );
        }

        return { success: true, protocolo: numeroProtocolo };
      }),
  }),

  // ==================== TRAMITAÇÃO ====================
  tramites: router({
    listar: protectedProcedure
      .input(z.object({ memorando_id: z.number() }))
      .query(async ({ input }) => {
        return await getTramitesByMemorandoId(input.memorando_id);
      }),

    criar: protectedProcedure
      .input(
        z.object({
          memorando_id: z.number(),
          status_novo: z.string(),
          setor_destino_id: z.number().optional(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const memorando = await getMemorandoById(input.memorando_id);

        if (!memorando) {
          throw new Error("Memorando não encontrado");
        }

        const tramite = await createTramite({
          memorando_id: input.memorando_id,
          status_anterior: memorando.status,
          status_novo: input.status_novo,
          usuario_id: ctx.user.id,
          setor_origem_id: ctx.user.setor_id,
          setor_destino_id: input.setor_destino_id,
          observacoes: input.observacoes,
        });

        // Atualizar status do memorando
        await updateMemorado(input.memorando_id, {
          status: input.status_novo as any,
          data_recebimento: input.status_novo === "recebido" ? new Date() : undefined,
        });

        // Log de auditoria
        await createLogAuditoria({
          usuario_id: ctx.user.id,
          acao: "TRAMITAR",
          tabela: "tramites",
          registro_id: input.memorando_id,
          descricao: `Memorando tramitado para status ${input.status_novo}`,
          dados_novos: JSON.stringify(input),
        });

        return tramite;
      }),
  }),

  // ==================== AUDITORIA ====================
  auditoria: router({
    listar: adminProcedure
      .input(
        z.object({
          usuario_id: z.number().optional(),
          acao: z.string().optional(),
          tabela: z.string().optional(),
          dataInicio: z.date().optional(),
          dataFim: z.date().optional(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        return await getLogsAuditoria(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;


// Adicionar rota de PDF antes da exportação do tipo
const appRouterWithPDF = router({
  system: systemRouter,
  auth: appRouter.auth,
  usuarios: appRouter.usuarios,
  setores: appRouter.setores,
  memorandos: appRouter.memorandos,
  tramites: appRouter.tramites,
  auditoria: appRouter.auditoria,
  pdf: router({
    gerarMemorado: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const memorando = await getMemorandoById(input.id);

        if (!memorando) {
          throw new Error("Memorando nao encontrado");
        }

        const setorRemetente = await getSetorById(memorando.setor_id);
        const setorDestinatario = await getSetorById(memorando.destinatario_setor_id);
        const usuarioRemetente = await getUserById(memorando.remetente_id);

        const html = await generateMemorandoPDF({
          memorando,
          setorRemetente,
          setorDestinatario,
          usuarioRemetente,
        });

        return { html, numero: memorando.numero };
      }),
  }),
});
