import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";

export default function AdminAuditoria() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [filtros, setFiltros] = useState({
    acao: "",
    tabela: "",
  });

  const { data: logs } = trpc.auditoria.listar.useQuery({
    acao: filtros.acao || undefined,
    tabela: filtros.tabela || undefined,
    limit: 100,
  });

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Acesso negado</p>
          <button onClick={() => setLocation("/")} className="btn-primary">
            VOLTAR
          </button>
        </div>
      </div>
    );
  }

  const acoes = Array.from(new Set(logs?.map((l) => l.acao) || []));
  const tabelas = Array.from(new Set(logs?.map((l) => l.tabela) || []));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tighter">LOG DE AUDITORIA</h1>
            <div className="h-1 w-32 bg-accent"></div>
          </div>

          <div className="bg-card border border-border p-6 space-y-4">
            <h3 className="text-xl font-bold tracking-wide text-accent">FILTROS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={filtros.acao}
                onChange={(e) =>
                  setFiltros({ ...filtros, acao: e.target.value })
                }
                className="input-field"
              >
                <option value="">Todas as ações</option>
                {acoes.map((acao) => (
                  <option key={acao} value={acao}>
                    {acao}
                  </option>
                ))}
              </select>
              <select
                value={filtros.tabela}
                onChange={(e) =>
                  setFiltros({ ...filtros, tabela: e.target.value })
                }
                className="input-field"
              >
                <option value="">Todas as tabelas</option>
                {tabelas.map((tabela) => (
                  <option key={tabela} value={tabela}>
                    {tabela}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-1 w-full bg-accent"></div>

          <div className="bg-card border border-border p-8 space-y-6">
            {logs && logs.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-input border border-border p-4 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-accent">
                          {log.acao} - {log.tabela}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {log.descricao}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleDateString("pt-BR")}{" "}
                        {new Date(log.createdAt).toLocaleTimeString("pt-BR")}
                      </p>
                    </div>
                    {log.dados_novos && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          Ver detalhes
                        </summary>
                        <pre className="mt-2 bg-background p-2 text-xs overflow-auto max-h-32">
                          {JSON.stringify(JSON.parse(log.dados_novos), null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum log encontrado</p>
            )}
          </div>

          <div className="h-1 w-full bg-accent"></div>

          <div className="flex gap-4 justify-center">
            <button onClick={() => setLocation("/")} className="btn-secondary">
              VOLTAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
