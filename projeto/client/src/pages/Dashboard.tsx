import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: memorandos } = trpc.memorandos.listar.useQuery({
    limit: 100,
  });

  const stats = {
    total: memorandos?.length || 0,
    emElaboracao: memorandos?.filter((m) => m.status === "em_elaboracao").length || 0,
    enviados: memorandos?.filter((m) => m.status === "enviado").length || 0,
    recebidos: memorandos?.filter((m) => m.status === "recebido").length || 0,
    emAnalise: memorandos?.filter((m) => m.status === "em_analise").length || 0,
    respondidos: memorandos?.filter((m) => m.status === "respondido").length || 0,
    finalizados: memorandos?.filter((m) => m.status === "finalizado").length || 0,
    arquivados: memorandos?.filter((m) => m.status === "arquivado").length || 0,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tighter">DASHBOARD</h1>
            <div className="h-1 w-32 bg-accent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border p-6 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Total
              </p>
              <p className="text-4xl font-bold text-accent">{stats.total}</p>
            </div>

            <div className="bg-card border border-border p-6 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Em Elaboração
              </p>
              <p className="text-4xl font-bold text-accent">{stats.emElaboracao}</p>
            </div>

            <div className="bg-card border border-border p-6 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Enviados
              </p>
              <p className="text-4xl font-bold text-accent">{stats.enviados}</p>
            </div>

            <div className="bg-card border border-border p-6 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Recebidos
              </p>
              <p className="text-4xl font-bold text-accent">{stats.recebidos}</p>
            </div>

            <div className="bg-card border border-border p-6 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Em Análise
              </p>
              <p className="text-4xl font-bold text-accent">{stats.emAnalise}</p>
            </div>

            <div className="bg-card border border-border p-6 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Respondidos
              </p>
              <p className="text-4xl font-bold text-accent">{stats.respondidos}</p>
            </div>

            <div className="bg-card border border-border p-6 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Finalizados
              </p>
              <p className="text-4xl font-bold text-accent">{stats.finalizados}</p>
            </div>

            <div className="bg-card border border-border p-6 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Arquivados
              </p>
              <p className="text-4xl font-bold text-accent">{stats.arquivados}</p>
            </div>
          </div>

          <div className="h-1 w-full bg-accent"></div>

          <div className="bg-card border border-border p-8 space-y-6">
            <h2 className="text-2xl font-bold tracking-wide text-accent">
              MEMORANDOS RECENTES
            </h2>
            {memorandos && memorandos.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {memorandos.slice(0, 10).map((memo) => (
                  <button
                    key={memo.id}
                    onClick={() => setLocation(`/memorandos/${memo.id}`)}
                    className="w-full bg-input border border-border p-4 hover:bg-muted transition-colors text-left text-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-accent">{memo.numero}</p>
                        <p className="text-foreground">{memo.assunto}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(memo.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum memorando encontrado</p>
            )}
          </div>

          <div className="h-1 w-full bg-accent"></div>

          <div className="flex gap-4 justify-center">
            <button onClick={() => setLocation("/")} className="btn-secondary">
              VOLTAR
            </button>
            <button
              onClick={() => setLocation("/memorandos/novo")}
              className="btn-primary"
            >
              NOVO MEMORANDO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
