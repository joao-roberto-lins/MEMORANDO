import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function NovoMemorado() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    destinatario_setor_id: 0,
    assunto: "",
    corpo: "",
    observacoes: "",
  });

  const { data: setores } = trpc.setores.listar.useQuery();
  const criarMemorado = trpc.memorandos.criar.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.destinatario_setor_id) {
      toast.error("Selecione um setor destinatário");
      return;
    }

    if (!formData.assunto.trim()) {
      toast.error("Preencha o assunto");
      return;
    }

    if (!formData.corpo.trim()) {
      toast.error("Preencha o corpo do memorando");
      return;
    }

    try {
      await criarMemorado.mutateAsync(formData);
      toast.success("Memorando criado com sucesso!");
      setLocation("/memorandos/saida");
    } catch (error) {
      toast.error("Erro ao criar memorando");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tighter">NOVO MEMORANDO</h1>
            <div className="h-1 w-32 bg-accent"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-card border border-border p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                  Setor Destinatário
                </label>
                <select
                  value={formData.destinatario_setor_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      destinatario_setor_id: parseInt(e.target.value),
                    })
                  }
                  className="input-field"
                >
                  <option value={0}>Selecione um setor</option>
                  {setores?.map((setor) => (
                    <option key={setor.id} value={setor.id}>
                      {setor.nome} ({setor.sigla})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                  Assunto
                </label>
                <input
                  type="text"
                  value={formData.assunto}
                  onChange={(e) =>
                    setFormData({ ...formData, assunto: e.target.value })
                  }
                  className="input-field"
                  placeholder="Digite o assunto do memorando"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                  Corpo do Memorando
                </label>
                <textarea
                  value={formData.corpo}
                  onChange={(e) =>
                    setFormData({ ...formData, corpo: e.target.value })
                  }
                  className="input-field min-h-64"
                  placeholder="Digite o conteúdo do memorando"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase tracking-wider mb-2">
                  Observações (Opcional)
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                  className="input-field min-h-24"
                  placeholder="Observações internas"
                />
              </div>
            </div>

            <div className="h-1 w-full bg-accent"></div>

            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={() => setLocation("/")}
                className="btn-secondary"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                disabled={criarMemorado.isPending}
                className="btn-primary"
              >
                {criarMemorado.isPending ? "SALVANDO..." : "SALVAR MEMORANDO"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
