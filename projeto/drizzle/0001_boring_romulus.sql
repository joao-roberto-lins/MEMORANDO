CREATE TABLE `anexos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memorando_id` int NOT NULL,
	`nome_arquivo` varchar(500) NOT NULL,
	`tipo_arquivo` varchar(100) NOT NULL,
	`caminho` varchar(1000) NOT NULL,
	`tamanho` int,
	`url_s3` varchar(1000),
	`criado_por` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `anexos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `logs_auditoria` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuario_id` int NOT NULL,
	`acao` varchar(100) NOT NULL,
	`tabela` varchar(100) NOT NULL,
	`registro_id` int,
	`descricao` longtext,
	`dados_anteriores` longtext,
	`dados_novos` longtext,
	`endereco_ip` varchar(50),
	`user_agent` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `logs_auditoria_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memorandos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numero` varchar(50) NOT NULL,
	`ano` int NOT NULL,
	`setor_id` int NOT NULL,
	`remetente_id` int NOT NULL,
	`destinatario_setor_id` int NOT NULL,
	`destinatario_usuario_id` int,
	`assunto` varchar(500) NOT NULL,
	`corpo` longtext NOT NULL,
	`status` enum('em_elaboracao','enviado','recebido','em_analise','respondido','finalizado','arquivado') NOT NULL DEFAULT 'em_elaboracao',
	`protocolo` varchar(50),
	`data_envio` timestamp,
	`data_recebimento` timestamp,
	`observacoes` longtext,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memorandos_id` PRIMARY KEY(`id`),
	CONSTRAINT `memorandos_numero_unique` UNIQUE(`numero`),
	CONSTRAINT `memorandos_protocolo_unique` UNIQUE(`protocolo`)
);
--> statement-breakpoint
CREATE TABLE `protocolos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numero_protocolo` varchar(50) NOT NULL,
	`memorando_id` int NOT NULL,
	`data_protocolo` timestamp NOT NULL DEFAULT (now()),
	`hash_documento` varchar(255),
	`qr_code` longtext,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `protocolos_id` PRIMARY KEY(`id`),
	CONSTRAINT `protocolos_numero_protocolo_unique` UNIQUE(`numero_protocolo`),
	CONSTRAINT `protocolos_memorando_id_unique` UNIQUE(`memorando_id`)
);
--> statement-breakpoint
CREATE TABLE `setores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`sigla` varchar(50) NOT NULL,
	`responsavel_id` int,
	`email` varchar(320),
	`descricao` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `setores_id` PRIMARY KEY(`id`),
	CONSTRAINT `setores_sigla_unique` UNIQUE(`sigla`)
);
--> statement-breakpoint
CREATE TABLE `tramites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memorando_id` int NOT NULL,
	`status_anterior` varchar(50),
	`status_novo` varchar(50) NOT NULL,
	`usuario_id` int NOT NULL,
	`setor_origem_id` int,
	`setor_destino_id` int,
	`observacoes` longtext,
	`data_movimentacao` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tramites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `cargo` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `setor_id` int;--> statement-breakpoint
ALTER TABLE `users` ADD `status` enum('ativo','inativo') DEFAULT 'ativo' NOT NULL;