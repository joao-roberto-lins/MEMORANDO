# SIGM - Sistema Integrado de Gestão de Memorandos - TODO

## Banco de Dados
- [x] Criar tabela de usuários com perfis
- [x] Criar tabela de setores/departamentos
- [x] Criar tabela de memorandos
- [x] Criar tabela de tramitação
- [x] Criar tabela de logs de auditoria
- [x] Criar tabela de anexos

## Backend - Autenticação e Usuários
- [x] Implementar rotas de autenticação (login, logout)
- [x] Implementar CRUD de usuários (admin)
- [x] Implementar controle de perfis e permissões
- [x] Implementar CRUD de setores

## Backend - Memorandos
- [x] Implementar criação de memorandos
- [x] Implementar numeração automática de memorandos
- [x] Implementar edição de memorandos
- [x] Implementar listagem de memorandos com filtros
- [x] Implementar busca avançada de memorandos
- [x] Implementar exclusão lógica de memorandos

## Backend - Tramitação
- [x] Implementar sistema de tramitação entre setores
- [x] Implementar histórico de tramitação
- [x] Implementar mudança de status de memorandos
- [ ] Implementar notificações de recebimento

## Backend - PDF e Anexos
- [ ] Implementar geração de PDF de memorandos
- [ ] Implementar upload de anexos
- [ ] Implementar listagem de anexos
- [ ] Implementar exclusão de anexos

## Backend - Auditoria
- [x] Implementar log de auditoria para todas as ações
- [x] Implementar listagem de logs de auditoria
- [x] Implementar filtros em logs de auditoria

## Frontend - Layout e Autenticação
- [x] Implementar design brutalista com tema preto/branco/vermelho
- [x] Implementar tela de login (via Manus OAuth)
- [x] Implementar tela de dashboard
- [x] Implementar navegação principal

## Frontend - Gestão de Usuários (Admin)
- [x] Implementar tela de listagem de usuários
- [x] Implementar tela de criação de usuários
- [ ] Implementar tela de edição de usuários
- [x] Implementar tela de gestão de setores

## Frontend - Memorandos
- [x] Implementar tela de novo memorando
- [ ] Implementar tela de edição de memorando
- [x] Implementar tela de caixa de entrada
- [x] Implementar tela de caixa de saída
- [x] Implementar tela de visualização de memorando
- [x] Implementar busca e filtros avançados

## Frontend - Tramitação
- [x] Implementar tela de tramitação de memorandos
- [x] Implementar visualização de histórico de tramitação
- [x] Implementar mudança de status

## Frontend - Dashboard
- [x] Implementar estatísticas básicas
- [ ] Implementar gráficos de memorandos por período
- [ ] Implementar gráfico de memorandos por setor
- [ ] Implementar widget de pendências
- [ ] Implementar widget de memorandos em tramitação
- [ ] Implementar widget de memorandos arquivados

## Frontend - Auditoria
- [x] Implementar tela de logs de auditoria
- [x] Implementar filtros de auditoria

## Testes
- [x] Testar autenticação
- [x] Testar CRUD de usuários
- [x] Testar listagem de memorandos
- [x] Testar controle de acesso por perfil
- [x] Testar auditoria
- [ ] Testar criação de memorandos
- [ ] Testar tramitação de memorandos
- [ ] Testar geração de PDF
- [ ] Testar auditoria
- [ ] Testar responsividade

## Documentação
- [ ] Documentar API
- [ ] Documentar estrutura do banco de dados
- [ ] Documentar guia de implantação


## Correções e Melhorias
- [x] Implementar envio de email para setor ao enviar memorando
- [x] Criar página de relatórios com gráficos
- [x] Corrigir aba de relatórios no menu admin
