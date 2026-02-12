import nodemailer from "nodemailer";
import { ENV } from "./_core/env";

let transporter: nodemailer.Transporter | null = null;

export async function getEmailTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: ENV.smtpHost,
      port: parseInt(ENV.smtpPort || "587"),
      secure: ENV.smtpPort === "465", // true for 465, false for other ports
      auth: {
        user: ENV.smtpUser,
        pass: ENV.smtpPassword,
      },
    });
  }
  return transporter;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = await getEmailTransporter();

    const info = await transporter.sendMail({
      from: `"${ENV.smtpFromName || "SIGM"}" <${ENV.smtpUser}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || options.html,
      html: options.html,
    });

    console.log("[Email] Enviado com sucesso:", info.messageId);
    return true;
  } catch (error) {
    console.error("[Email] Erro ao enviar:", error);
    return false;
  }
}

export async function sendMemorandoNotification(
  setorEmail: string,
  memorandoNumero: string,
  assunto: string,
  remetente: string,
  setorRemetente: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background: #f9f9f9;
          border: 1px solid #ddd;
        }
        .header {
          background: #000;
          color: #fff;
          padding: 20px;
          text-align: center;
          border-bottom: 3px solid #ff0000;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .content {
          padding: 20px;
          background: #fff;
        }
        .info-box {
          background: #f0f0f0;
          border-left: 4px solid #ff0000;
          padding: 15px;
          margin: 15px 0;
        }
        .info-label {
          font-weight: bold;
          color: #000;
          text-transform: uppercase;
          font-size: 12px;
        }
        .info-value {
          font-size: 16px;
          color: #333;
          margin-top: 5px;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 12px;
          border-top: 1px solid #ddd;
        }
        .button {
          display: inline-block;
          background: #000;
          color: #fff;
          padding: 12px 30px;
          text-decoration: none;
          text-transform: uppercase;
          font-weight: bold;
          margin: 20px 0;
          border: 2px solid #ff0000;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>NOVO MEMORANDO</h1>
        </div>
        
        <div class="content">
          <p>Você recebeu um novo memorando no SIGM - Sistema Integrado de Gestão de Memorandos.</p>
          
          <div class="info-box">
            <div class="info-label">Número do Memorando</div>
            <div class="info-value">${memorandoNumero}</div>
          </div>
          
          <div class="info-box">
            <div class="info-label">Assunto</div>
            <div class="info-value">${assunto}</div>
          </div>
          
          <div class="info-box">
            <div class="info-label">Remetente</div>
            <div class="info-value">${remetente} - ${setorRemetente}</div>
          </div>
          
          <div class="info-box">
            <div class="info-label">Data de Recebimento</div>
            <div class="info-value">${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</div>
          </div>
          
          <p style="text-align: center; margin-top: 30px;">
            <a href="https://sigm.manus.space" class="button">Acessar SIGM</a>
          </p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Este é um email automático. Por favor, não responda. Se você não esperava receber este email, entre em contato com o administrador do sistema.
          </p>
        </div>
        
        <div class="footer">
          <p>SIGM - Sistema Integrado de Gestão de Memorandos</p>
          <p>© 2026 Todos os direitos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: setorEmail,
    subject: `SIGM - Novo Memorando: ${memorandoNumero}`,
    html,
  });
}
