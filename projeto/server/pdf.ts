import { Memorando, Setor } from "../drizzle/schema";
import { getSetorById, getUserById } from "./db";

interface PDFOptions {
  memorando: Memorando;
  setorRemetente: Setor | undefined;
  setorDestinatario: Setor | undefined;
  usuarioRemetente: any;
}

export async function generateMemorandoPDF(options: PDFOptions): Promise<string> {
  const { memorando, setorRemetente, setorDestinatario, usuarioRemetente } = options;

  // Criar HTML do memorando
  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${memorando.numero}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #000;
          background: #fff;
        }
        
        .container {
          max-width: 210mm;
          height: 297mm;
          margin: 0 auto;
          padding: 20mm;
          background: white;
        }
        
        .header {
          text-align: center;
          border-bottom: 3px solid #000;
          padding-bottom: 15mm;
          margin-bottom: 15mm;
        }
        
        .header h1 {
          font-size: 24pt;
          font-weight: bold;
          margin-bottom: 5mm;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .divider {
          height: 2px;
          background: #ff0000;
          margin: 10mm 0;
        }
        
        .metadata {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10mm;
          margin-bottom: 15mm;
          font-size: 10pt;
        }
        
        .metadata-item {
          border: 1px solid #000;
          padding: 5mm;
        }
        
        .metadata-label {
          font-weight: bold;
          text-transform: uppercase;
          font-size: 8pt;
          margin-bottom: 3mm;
        }
        
        .metadata-value {
          font-size: 10pt;
        }
        
        .assunto {
          margin-bottom: 15mm;
        }
        
        .assunto-label {
          font-weight: bold;
          text-transform: uppercase;
          font-size: 9pt;
          margin-bottom: 3mm;
        }
        
        .assunto-value {
          font-size: 12pt;
          font-weight: bold;
        }
        
        .corpo {
          margin-bottom: 20mm;
          text-align: justify;
          font-size: 11pt;
          line-height: 1.8;
        }
        
        .footer {
          margin-top: 30mm;
          border-top: 1px solid #000;
          padding-top: 10mm;
          text-align: center;
          font-size: 8pt;
        }
        
        .signature-area {
          margin-top: 20mm;
          text-align: center;
        }
        
        .signature-line {
          width: 60mm;
          height: 1px;
          background: #000;
          margin: 30mm auto 5mm;
        }
        
        .signature-name {
          font-weight: bold;
          text-transform: uppercase;
          font-size: 10pt;
        }
        
        .protocolo {
          margin-top: 15mm;
          padding: 5mm;
          border: 1px solid #ff0000;
          background: #f9f9f9;
          font-size: 9pt;
          text-align: center;
        }
        
        .protocolo-label {
          font-weight: bold;
          color: #ff0000;
          text-transform: uppercase;
        }
        
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .container {
            margin: 0;
            padding: 20mm;
            height: auto;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MEMORANDO</h1>
          <div class="divider"></div>
        </div>
        
        <div class="metadata">
          <div class="metadata-item">
            <div class="metadata-label">Número</div>
            <div class="metadata-value">${memorando.numero}</div>
          </div>
          <div class="metadata-item">
            <div class="metadata-label">Data</div>
            <div class="metadata-value">${new Date(memorando.createdAt).toLocaleDateString("pt-BR")}</div>
          </div>
          <div class="metadata-item">
            <div class="metadata-label">Remetente</div>
            <div class="metadata-value">
              ${setorRemetente?.nome || "N/A"}<br>
              ${usuarioRemetente?.name || "N/A"}
            </div>
          </div>
          <div class="metadata-item">
            <div class="metadata-label">Destinatário</div>
            <div class="metadata-value">
              ${setorDestinatario?.nome || "N/A"}
            </div>
          </div>
        </div>
        
        <div class="assunto">
          <div class="assunto-label">Assunto:</div>
          <div class="assunto-value">${memorando.assunto}</div>
        </div>
        
        <div class="corpo">
          ${memorando.corpo.replace(/\n/g, "<br>")}
        </div>
        
        ${memorando.observacoes ? `
          <div style="margin-bottom: 15mm; border-left: 3px solid #ff0000; padding-left: 5mm;">
            <strong>Observações:</strong><br>
            ${memorando.observacoes.replace(/\n/g, "<br>")}
          </div>
        ` : ""}
        
        <div class="signature-area">
          <div class="signature-line"></div>
          <div class="signature-name">${usuarioRemetente?.name || "Assinado digitalmente"}</div>
          <div style="font-size: 9pt; margin-top: 3mm;">${setorRemetente?.nome || ""}</div>
        </div>
        
        ${memorando.protocolo ? `
          <div class="protocolo">
            <div class="protocolo-label">Protocolo Eletrônico:</div>
            <div>${memorando.protocolo}</div>
            <div style="font-size: 8pt; margin-top: 3mm;">
              ${new Date(memorando.data_envio || memorando.createdAt).toLocaleDateString("pt-BR")} às 
              ${new Date(memorando.data_envio || memorando.createdAt).toLocaleTimeString("pt-BR")}
            </div>
          </div>
        ` : ""}
        
        <div class="footer">
          <p>Este documento foi gerado eletronicamente pelo SIGM - Sistema Integrado de Gestão de Memorandos</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}
