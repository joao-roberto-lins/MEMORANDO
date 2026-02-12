import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";

export default function AdminRelatorios() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [filtros, setFiltros] = useState({
    dataInicio: "",
    dataFim: "",
    status: "",
  });

  const { data: memorandos } = trpc.memorandos.listar.useQuery({
    limit: 1000,
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

  // Filtrar memorandos
  const memorandosFiltrados = memorandos?.filter((m) => {
    if (filtros.status && m.status !== filtros.status) return false;
    if (filtros.dataInicio) {
      const dataInicio = new Date(filtros.dataInicio);
      if (new Date(m.createdAt) < dataInicio) return false;
    }
    if (filtros.dataFim) {
      const dataFim = new Date(filtros.dataFim);
      if (new Date(m.createdAt) > dataFim) return false;
    }
    return true;
  }) || [];

  // Calcular estatísticas
  const stats = {
    total: memorandosFiltrados.length,
    porStatus: {
      em_elaboracao: memorandosFiltrados.filter((m) => m.status === "em_elaboracao").length,
      enviado: memorandosFiltrados.filter((m) => m.status === "enviado").length,
      recebido: memorandosFiltrados.filter((m) => m.status === "recebido").length,
      em_analise: memorandosFiltrados.filter((m) => m.status === "em_analise").length,
      respondido: memorandosFiltrados.filter((m) => m.status === "respondido").length,
      finalizado: memorandosFiltrados.filter((m) => m.status === "finalizado").length,
      arquivado: memorandosFiltrados.filter((m) => m.status === "arquivado").length,
    },
  };

  const handleExportarCSV = () => {
    const headers = ["Número", "Data", "Assunto", "Status", "Protocolo"];
    const rows = memorandosFiltrados.map((m) => [
      m.numero,
      new Date(m.createdAt).toLocaleDateString("pt-BR"),
      m.assunto,
      m.status,
      m.protocolo || "N/A",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-memorandos-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tighter">RELATÓRIOS</h1>
            <div className="h-1 w-32 bg-accent"></div>
          </div>

          <div className="bg-card border border-border p-6 space-y-4">
            <h3 className="text-xl font-bold tracking-wide text-accent">FILTROS</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                  Data Início
                </label>
                <input
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) =>
                    setFiltros({ ...filtros, dataInicio: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) =>
                    setFiltros({ ...filtros, dataFim: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                  Status
                </label>
                <select
                  value={filtros.status}
                  onChange={(e) =>
                    setFiltros({ ...filtros, status: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">Todos os status</option>
                  <option value="em_elaboracao">Em Elaboração</option>
                  <option value="enviado">Enviado</option>
                  <option value="recebido">Recebido</option>
                  <option value="em_analise">Em Análise</option>
                  <option value="respondido">Respondido</option>
                  <option value="finalizado">Finalizado</option>
                  <option value="arquivado">Arquivado</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-1 w-full bg-accent"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border p-6 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Total
              </p>
              <p className="text-4xl font-bold text-accent">{stats.total}</p>
            </div>

            <div className="bg-card border border-border p-6 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Enviados
              </p>
              <p className="text-4xl font-bold text-accent">{stats.porStatus.enviado}</p>
            </div>

            <div className="bg-card border border-border p-6 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Recebidos
              </p>
              <p className="text-4xl font-bold text-accent">{stats.porStatus.recebido}</p>
            </div>

            <div className="bg-card border border-border p-6 text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Finalizados
              </p>
              <p className="text-4xl font-bold text-accent">{stats.porStatus.finalizado}</p>
            </div>
          </div>

          <div className="h-1 w-full bg-accent"></div>

          <div className="bg-card border border-border p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-wide text-accent">
                DISTRIBUIÇÃO POR STATUS
              </h2>
              <button
                onClick={handleExportarCSV}
                className="btn-primary text-sm"
              >
                EXPORTAR CSV
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-input border border-border p-4">
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Em Elaboração
                </p>
                <p className="text-3xl font-bold text-accent mt-2">
                  {stats.porStatus.em_elaboracao}
                </p>
              </div>

              <div className="bg-input border border-border p-4">
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Em Análise
                </p>
                <p className="text-3xl font-bold text-accent mt-2">
                  {stats.porStatus.em_analise}
                </p>
              </div>

              <div className="bg-input border border-border p-4">
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Respondidos
                </p>
                <p className="text-3xl font-bold text-accent mt-2">
                  {stats.porStatus.respondido}
                </p>
              </div>

              <div className="bg-input border border-border p-4">
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Arquivados
                </p>
                <p className="text-3xl font-bold text-accent mt-2">
                  {stats.porStatus.arquivado}
                </p>
              </div>
            </div>
          </div>

          <div className="h-1 w-full bg-accent"></div>

          <div className="bg-card border border-border p-8 space-y-6">
            <h2 className="text-2xl font-bold tracking-wide text-accent">
              MEMORANDOS ({memorandosFiltrados.length})
            </h2>
            {memorandosFiltrados.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-bold uppercase tracking-wider">
                        Número
                      </th>
                      <th className="text-left py-3 px-4 font-bold uppercase tracking-wider">
                        Data
                      </th>
                      <th className="text-left py-3 px-4 font-bold uppercase tracking-wider">
                        Assunto
                      </th>
                      <th className="text-left py-3 px-4 font-bold uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-bold uppercase tracking-wider">
                        Protocolo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {memorandosFiltrados.map((m) => (
                      <tr key={m.id} className="border-b border-border hover:bg-muted">
                        <td className="py-3 px-4 font-bold text-accent">{m.numero}</td>
                        <td className="py-3 px-4">
                          {new Date(m.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3 px-4">{m.assunto}</td>
                        <td className="py-3 px-4">
                          <span className="badge-status badge-status-active">
                            {m.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {m.protocolo || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
          </div>
        </div>
      </div>
    </div>
  );
}
