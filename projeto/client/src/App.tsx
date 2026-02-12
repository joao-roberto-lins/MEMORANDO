import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import NovoMemorado from "./pages/NovoMemorado";
import CaixaEntrada from "./pages/CaixaEntrada";
import CaixaSaida from "./pages/CaixaSaida";
import VisualizarMemorado from "./pages/VisualizarMemorado";
import Dashboard from "./pages/Dashboard";
import AdminUsuarios from "./pages/AdminUsuarios";
import AdminSetores from "./pages/AdminSetores";
import AdminAuditoria from "./pages/AdminAuditoria";
import AdminRelatorios from "./pages/AdminRelatorios";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/memorandos/novo"} component={NovoMemorado} />
      <Route path={"/memorandos/entrada"} component={CaixaEntrada} />
      <Route path={"/memorandos/saida"} component={CaixaSaida} />
      <Route path={"/memorandos/:id"} component={VisualizarMemorado} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/admin/usuarios"} component={AdminUsuarios} />
      <Route path={"/admin/setores"} component={AdminSetores} />
      <Route path={"/admin/auditoria"} component={AdminAuditoria} />
      <Route path={"/admin/relatorios"} component={AdminRelatorios} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
