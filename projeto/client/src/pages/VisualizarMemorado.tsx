import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation, useRoute } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function VisualizarMemorado() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/memorandos/:id");
  const id = params?.id ? parseInt(params.id) : 0;

  const [novoStatus, setNovoStatus] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const { data: memorando, isLoading } = trpc.memorandos.obter.useQuery(
    { id },
    { enabled: !!id }
  );

  const { data: tramites } = trpc.tramites.listar.useQuery(
    { memorando_id: id },
    { enabled: !!id }
  );

  const { data: setores } = trpc.setores.listar.useQuery();

  const enviarMemorado = trpc.memorandos.enviar.useMutation();
  const criarTramite = trpc.tramites.criar.useMutation();

  const handleEnviar = async () => {
    try {
      const result = await enviarMemorado.mutateAsync({ id });
      toast.success(`Memorando enviado com protocolo: ${result.protocolo}`);
    } catch (error) {
      toast.error("Erro ao enviar memorando");
    }
  };

  const handleTramitar = async () => {
    if (!novoStatus) {
      toast.error("Selecione um novo status");
      return;
    }

    try {
      await criarTramite.mutateAsync({
        memorando_id: id,
        status_novo: novoStatus,
        observacoes: observacoes || undefined,
      });
      toast.success("Memorando tramitado com sucesso!");
      setNovoStatus("");
      setObservacoes("");
    } catch (error) {
      toast.error("Erro ao tramitar memorando");
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Carregando memorando...</p>
      </div>
    );
  }

  if (!memorando) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Memorando não encontrado</p>
          <button onClick={() => setLocation("/")} className="btn-primary">
            VOLTAR
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-5xl font-bold tracking-tighter">
                  {memorando.numero}
                </h1>
                <div className="h-1 w-32 bg-accent mt-4"></div>
              </div>
              <span className="badge-status badge-status-active">
                {getStatusBadge(memorando.status)}
              </span>
            </div>
          </div>

          <div className="bg-card border border-border p-8 space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Assunto
              </h3>
              <p className="text-xl font-semibold">{memorando.assunto}</p>
            </div>

            <div className="h-px bg-border"></div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Data de Criação
                </h3>
                <p>{new Date(memorando.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
              {memorando.protocolo && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Protocolo
                  </h3>
                  <p className="text-accent font-bold">{memorando.protocolo}</p>
                </div>
              )}
            </div>

            <div className="h-px bg-border"></div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                Corpo do Memorando
              </h3>
              <div className="bg-input p-4 whitespace-pre-wrap text-sm leading-relaxed">
                {memorando.corpo}
              </div>
            </div>

            {memorando.observacoes && (
              <>
                <div className="h-px bg-border"></div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Observações
                  </h3>
                  <p className="text-muted-foreground">{memorando.observacoes}</p>
                </div>
              </>
            )}
          </div>

          <div className="h-1 w-full bg-accent"></div>

          {tramites && tramites.length > 0 && (
            <div className="bg-card border border-border p-8 space-y-6">
              <h2 className="text-2xl font-bold tracking-wide text-accent">
                HISTÓRICO DE TRAMITAÇÃO
              </h2>
              <div className="space-y-4">
                {tramites.map((tramite, index) => (
                  <div key={tramite.id} className="border-l-4 border-accent pl-4 py-2">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-sm">
                        {tramite.status_anterior} → {tramite.status_novo}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tramite.data_movimentacao).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    </div>
                    {tramite.observacoes && (
                      <p className="text-sm text-muted-foreground">
                        {tramite.observacoes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {memorando.status === "em_elaboracao" && (
            <>
              <div className="h-1 w-full bg-accent"></div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setLocation("/")}
                  className="btn-secondary"
                >
                  VOLTAR
                </button>
                <button
                  onClick={handleEnviar}
                  disabled={enviarMemorado.isPending}
                  className="btn-primary"
                >
                  {enviarMemorado.isPending ? "ENVIANDO..." : "ENVIAR MEMORANDO"}
                </button>
              </div>
            </>
          )}

          {memorando.status !== "em_elaboracao" && (
            <>
              <div className="h-1 w-full bg-accent"></div>
              <div className="bg-card border border-border p-8 space-y-4">
                <h2 className="text-2xl font-bold tracking-wide text-accent">
                  TRAMITAR MEMORANDO
                </h2>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                    Novo Status
                  </label>
                  <select
                    value={novoStatus}
                    onChange={(e) => setNovoStatus(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Selecione um status</option>
                    <option value="recebido">Recebido</option>
                    <option value="em_analise">Em Análise</option>
                    <option value="respondido">Respondido</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="arquivado">Arquivado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                    Observações (Opcional)
                  </label>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="input-field min-h-24"
                    placeholder="Observações sobre a tramitação"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setLocation("/")}
                    className="btn-secondary flex-1"
                  >
                    CANCELAR
                  </button>
                  <button
                    onClick={handleTramitar}
                    disabled={criarTramite.isPending}
                    className="btn-primary flex-1"
                  >
                    {criarTramite.isPending ? "TRAMITANDO..." : "TRAMITAR"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
