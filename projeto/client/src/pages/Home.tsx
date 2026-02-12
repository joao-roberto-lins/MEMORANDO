import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tighter mb-4">SIGM</h1>
          <p className="text-xl">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold tracking-tighter text-foreground">SIGM</h1>
            <div className="h-1 w-32 bg-accent mx-auto"></div>
            <p className="text-2xl font-bold tracking-wide text-foreground">
              SISTEMA INTEGRADO DE GESTÃO DE MEMORANDOS
            </p>
          </div>

          <div className="space-y-6 py-12">
            <p className="text-lg leading-relaxed text-muted-foreground">
              Plataforma profissional para gestão, tramitação e auditoria de memorandos internos em organizações públicas.
            </p>

            <div className="space-y-4 text-left bg-card border border-border p-8">
              <h3 className="text-xl font-bold tracking-wide text-accent">FUNCIONALIDADES</h3>
              <div className="h-px bg-accent my-4"></div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="text-accent mr-3 font-bold">▪</span>
                  <span>Autenticação segura com controle de perfis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-3 font-bold">▪</span>
                  <span>Criação e gestão de memorandos com numeração automática</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-3 font-bold">▪</span>
                  <span>Sistema de tramitação entre setores com histórico completo</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-3 font-bold">▪</span>
                  <span>Geração automática de PDF com layout oficial</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-3 font-bold">▪</span>
                  <span>Dashboard com estatísticas e indicadores</span>
                </li>
                <li className="flex items-start">
                  <span className="text-accent mr-3 font-bold">▪</span>
                  <span>Auditoria completa de todas as ações do sistema</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="h-1 w-full bg-accent"></div>

          <div className="pt-8">
            <a href={getLoginUrl()}>
              <Button className="btn-primary text-lg px-12 py-4">
                ACESSAR SISTEMA
              </Button>
            </a>
          </div>

          <p className="text-xs text-muted-foreground tracking-wider">
            © 2026 SIGM - Sistema Integrado de Gestão de Memorandos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tighter">BEM-VINDO, {user?.name?.toUpperCase()}</h1>
            <div className="h-1 w-32 bg-accent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setLocation("/memorandos/novo")}
              className="bg-card border border-border p-8 hover:bg-muted transition-colors text-left"
            >
              <h3 className="text-2xl font-bold tracking-wide text-accent mb-2">NOVO MEMORANDO</h3>
              <p className="text-muted-foreground">Criar um novo memorando</p>
            </button>

            <button
              onClick={() => setLocation("/memorandos/entrada")}
              className="bg-card border border-border p-8 hover:bg-muted transition-colors text-left"
            >
              <h3 className="text-2xl font-bold tracking-wide text-accent mb-2">CAIXA DE ENTRADA</h3>
              <p className="text-muted-foreground">Memorandos recebidos</p>
            </button>

            <button
              onClick={() => setLocation("/memorandos/saida")}
              className="bg-card border border-border p-8 hover:bg-muted transition-colors text-left"
            >
              <h3 className="text-2xl font-bold tracking-wide text-accent mb-2">CAIXA DE SAÍDA</h3>
              <p className="text-muted-foreground">Memorandos enviados</p>
            </button>

            <button
              onClick={() => setLocation("/dashboard")}
              className="bg-card border border-border p-8 hover:bg-muted transition-colors text-left"
            >
              <h3 className="text-2xl font-bold tracking-wide text-accent mb-2">DASHBOARD</h3>
              <p className="text-muted-foreground">Estatísticas e indicadores</p>
            </button>
          </div>

          {user?.role === "admin" && (
            <>
              <div className="h-1 w-full bg-accent my-8"></div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-wide text-accent">ADMINISTRAÇÃO</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setLocation("/admin/usuarios")}
                  className="bg-card border border-border p-8 hover:bg-muted transition-colors text-left"
                >
                  <h3 className="text-2xl font-bold tracking-wide text-accent mb-2">USUÁRIOS</h3>
                  <p className="text-muted-foreground">Gerenciar usuários do sistema</p>
                </button>

                <button
                  onClick={() => setLocation("/admin/setores")}
                  className="bg-card border border-border p-8 hover:bg-muted transition-colors text-left"
                >
                  <h3 className="text-2xl font-bold tracking-wide text-accent mb-2">SETORES</h3>
                  <p className="text-muted-foreground">Gerenciar setores e departamentos</p>
                </button>

                <button
                  onClick={() => setLocation("/admin/auditoria")}
                  className="bg-card border border-border p-8 hover:bg-muted transition-colors text-left"
                >
                  <h3 className="text-2xl font-bold tracking-wide text-accent mb-2">AUDITORIA</h3>
                  <p className="text-muted-foreground">Visualizar logs de auditoria</p>
                </button>

                <button
                  onClick={() => setLocation("/admin/relatorios")}
                  className="bg-card border border-border p-8 hover:bg-muted transition-colors text-left"
                >
                  <h3 className="text-2xl font-bold tracking-wide text-accent mb-2">RELATÓRIOS</h3>
                  <p className="text-muted-foreground">Gerar relatórios do sistema</p>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
