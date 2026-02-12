import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminSetores() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    sigla: "",
    email: "",
    descricao: "",
  });

  const { data: setores, refetch } = trpc.setores.listar.useQuery();
  const criarSetor = trpc.setores.criar.useMutation();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.sigla) {
      toast.error("Preencha nome e sigla do setor");
      return;
    }

    try {
      await criarSetor.mutateAsync(formData);
      toast.success("Setor criado com sucesso!");
      setFormData({
        nome: "",
        sigla: "",
        email: "",
        descricao: "",
      });
      setShowForm(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao criar setor");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tighter">GESTÃO DE SETORES</h1>
            <div className="h-1 w-32 bg-accent"></div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
            >
              {showForm ? "CANCELAR" : "NOVO SETOR"}
            </button>
            <button onClick={() => setLocation("/")} className="btn-secondary">
              VOLTAR
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-card border border-border p-8 space-y-6">
              <h2 className="text-2xl font-bold tracking-wide text-accent">
                CRIAR NOVO SETOR
              </h2>
              <div className="h-px bg-border"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                    Nome do Setor
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                    Sigla
                  </label>
                  <input
                    type="text"
                    value={formData.sigla}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sigla: e.target.value.toUpperCase(),
                      })
                    }
                    maxLength={10}
                    className="input-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                    Email do Setor
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="input-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData({ ...formData, descricao: e.target.value })
                    }
                    className="input-field min-h-24"
                  />
                </div>
              </div>

              <div className="flex gap-4 justify-center pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={criarSetor.isPending}
                  className="btn-primary"
                >
                  {criarSetor.isPending ? "CRIANDO..." : "CRIAR SETOR"}
                </button>
              </div>
            </form>
          )}

          <div className="h-1 w-full bg-accent"></div>

          <div className="bg-card border border-border p-8 space-y-6">
            <h2 className="text-2xl font-bold tracking-wide text-accent">
              SETORES DO SISTEMA
            </h2>
            {setores && setores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {setores.map((setor) => (
                  <div
                    key={setor.id}
                    className="bg-input border border-border p-6 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold text-accent">
                        {setor.nome}
                      </h3>
                      <span className="badge-status badge-status-active">
                        {setor.sigla}
                      </span>
                    </div>
                    {setor.email && (
                      <p className="text-sm text-muted-foreground">
                        {setor.email}
                      </p>
                    )}
                    {setor.descricao && (
                      <p className="text-sm text-foreground">
                        {setor.descricao}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum setor encontrado</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
