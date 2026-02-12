import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";

export default function CaixaEntrada() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [filtros, setFiltros] = useState({
    status: "",
    assunto: "",
  });

  const { data: memorandos, isLoading } = trpc.memorandos.listar.useQuery({
    setor_id: user?.setor_id || undefined,
    status: filtros.status || undefined,
    assunto: filtros.assunto || undefined,
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      em_elaboracao: "EM ELABORAÇÃO",
      enviado: "ENVIADO",
      recebido: "RECEBIDO",
      em_analise: "EM ANÁLISE",
      respondido: "RESPONDIDO",
      finalizado: "FINALIZADO",
      arquivado: "ARQUIVADO",
    };
    return statusMap[status] || status;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tighter">CAIXA DE ENTRADA</h1>
            <div className="h-1 w-32 bg-accent"></div>
          </div>

          <div className="bg-card border border-border p-6 space-y-4">
            <h3 className="text-xl font-bold tracking-wide text-accent">FILTROS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Filtrar por assunto"
                value={filtros.assunto}
                onChange={(e) =>
                  setFiltros({ ...filtros, assunto: e.target.value })
                }
                className="input-field"
              />
              <select
                value={filtros.status}
                onChange={(e) =>
                  setFiltros({ ...filtros, status: e.target.value })
                }
                className="input-field"
              >
                <option value="">Todos os status</option>
                <option value="recebido">Recebido</option>
                <option value="em_analise">Em Análise</option>
                <option value="respondido">Respondido</option>
                <option value="finalizado">Finalizado</option>
                <option value="arquivado">Arquivado</option>
              </select>
            </div>
          </div>

          <div className="h-1 w-full bg-accent"></div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando memorandos...</p>
            </div>
          ) : memorandos && memorandos.length > 0 ? (
            <div className="space-y-4">
              {memorandos.map((memo) => (
                <button
                  key={memo.id}
                  onClick={() => setLocation(`/memorandos/${memo.id}`)}
                  className="w-full bg-card border border-border p-6 hover:bg-muted transition-colors text-left"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold tracking-wide text-accent">
                        {memo.numero}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(memo.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span className="badge-status badge-status-active">
                      {getStatusBadge(memo.status)}
                    </span>
                  </div>
                  <p className="text-foreground font-semibold mb-2">
                    {memo.assunto}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {memo.corpo}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card border border-border p-8">
              <p className="text-muted-foreground text-lg">
                Nenhum memorando na caixa de entrada
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
