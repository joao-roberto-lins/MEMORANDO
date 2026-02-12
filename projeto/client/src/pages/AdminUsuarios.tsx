import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminUsuarios() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cargo: "",
    setor_id: 0,
    status: "ativo" as "ativo" | "inativo",
  });

  const { data: usuarios, refetch } = trpc.usuarios.listar.useQuery();
  const { data: setores } = trpc.setores.listar.useQuery();
  const criarUsuario = trpc.usuarios.criar.useMutation();

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

    if (!formData.name || !formData.email || !formData.cargo || !formData.setor_id) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await criarUsuario.mutateAsync(formData);
      toast.success("Usuário criado com sucesso!");
      setFormData({
        name: "",
        email: "",
        cargo: "",
        setor_id: 0,
        status: "ativo",
      });
      setShowForm(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao criar usuário");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tighter">GESTÃO DE USUÁRIOS</h1>
            <div className="h-1 w-32 bg-accent"></div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
            >
              {showForm ? "CANCELAR" : "NOVO USUÁRIO"}
            </button>
            <button onClick={() => setLocation("/")} className="btn-secondary">
              VOLTAR
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-card border border-border p-8 space-y-6">
              <h2 className="text-2xl font-bold tracking-wide text-accent">
                CRIAR NOVO USUÁRIO
              </h2>
              <div className="h-px bg-border"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                    Email
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

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={formData.cargo}
                    onChange={(e) =>
                      setFormData({ ...formData, cargo: e.target.value })
                    }
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                    Setor
                  </label>
                  <select
                    value={formData.setor_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        setor_id: parseInt(e.target.value),
                      })
                    }
                    className="input-field"
                  >
                    <option value={0}>Selecione um setor</option>
                    {setores?.map((setor) => (
                      <option key={setor.id} value={setor.id}>
                        {setor.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                    className="input-field"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
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
                  disabled={criarUsuario.isPending}
                  className="btn-primary"
                >
                  {criarUsuario.isPending ? "CRIANDO..." : "CRIAR USUÁRIO"}
                </button>
              </div>
            </form>
          )}

          <div className="h-1 w-full bg-accent"></div>

          <div className="bg-card border border-border p-8 space-y-6">
            <h2 className="text-2xl font-bold tracking-wide text-accent">
              USUÁRIOS DO SISTEMA
            </h2>
            {usuarios && usuarios.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-bold uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="text-left py-3 px-4 font-bold uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-bold uppercase tracking-wider">
                        Cargo
                      </th>
                      <th className="text-left py-3 px-4 font-bold uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr key={u.id} className="border-b border-border hover:bg-muted">
                        <td className="py-3 px-4">{u.name}</td>
                        <td className="py-3 px-4">{u.email}</td>
                        <td className="py-3 px-4">{u.cargo}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`badge-status ${
                              u.status === "ativo"
                                ? "badge-status-active"
                                : "badge-status-inactive"
                            }`}
                          >
                            {u.status?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum usuário encontrado</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
