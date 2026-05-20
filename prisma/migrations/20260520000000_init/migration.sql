-- CreateTable
CREATE TABLE "Loja" (
    "id" SERIAL NOT NULL,
    "pda" TEXT,
    "bkn" TEXT,
    "cnpj" TEXT,
    "nome" TEXT NOT NULL,
    "cliente" TEXT,
    "uf" TEXT,
    "regional" TEXT,
    "endereco" TEXT,
    "escopo" TEXT DEFAULT 'FRIO',
    "supervisor" TEXT,
    "pcm" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chamado" (
    "id" SERIAL NOT NULL,
    "lojaId" INTEGER NOT NULL,
    "numeroChamado" TEXT,
    "pda" TEXT,
    "motivo" TEXT,
    "status" TEXT DEFAULT 'PENDENTE',
    "dataAbertura" TIMESTAMP(3),
    "mes" TEXT,
    "tecnico" TEXT,
    "descricaoServico" TEXT,
    "valorProposta" DOUBLE PRECISION DEFAULT 0,
    "oscOsbOsd" TEXT,
    "statusEquipamento" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chamado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OSC" (
    "id" SERIAL NOT NULL,
    "chamadoId" INTEGER,
    "lojaId" INTEGER NOT NULL,
    "numeroOsc" TEXT,
    "status" TEXT DEFAULT 'PENDENTE',
    "valor" DOUBLE PRECISION DEFAULT 0,
    "descricao" TEXT,
    "cobrancaImediata" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OSC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preventiva" (
    "id" SERIAL NOT NULL,
    "lojaId" INTEGER NOT NULL,
    "mesRef" TEXT,
    "ano" INTEGER DEFAULT 2026,
    "tipoManutencao" TEXT DEFAULT 'AR_CONDICIONADO',
    "periodicidade" TEXT DEFAULT 'MENSAL',
    "dataInicio" TIMESTAMP(3),
    "dataTermino" TIMESTAMP(3),
    "status" TEXT DEFAULT 'PENDENTE',
    "valorFrio" DOUBLE PRECISION DEFAULT 0,
    "valorAr" DOUBLE PRECISION DEFAULT 0,
    "valorTotal" DOUBLE PRECISION DEFAULT 0,
    "pmocStatus" TEXT,
    "artVencimento" TIMESTAMP(3),
    "artStatus" TEXT,
    "nfNumero" TEXT,
    "dataPagamento" TIMESTAMP(3),
    "proximoCiclo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Preventiva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ART" (
    "id" SERIAL NOT NULL,
    "lojaId" INTEGER NOT NULL,
    "osp" TEXT,
    "valor" DOUBLE PRECISION DEFAULT 0,
    "tipo" TEXT,
    "dataEmissao" TIMESTAMP(3),
    "vencimento" TIMESTAMP(3),
    "status" TEXT DEFAULT 'EM_DIA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ART_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faturamento" (
    "id" SERIAL NOT NULL,
    "lojaId" INTEGER NOT NULL,
    "tipo" TEXT DEFAULT 'CORRETIVA',
    "status" TEXT DEFAULT 'PENDENTE',
    "nfNumero" TEXT,
    "dataPagamento" TIMESTAMP(3),
    "proximoCiclo" TIMESTAMP(3),
    "valor" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faturamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "perfil" TEXT NOT NULL DEFAULT 'LEITURA',
    "supervisorRegional" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP(3),

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Historico" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER,
    "tabelaAfetada" TEXT,
    "registroId" INTEGER,
    "campo" TEXT,
    "valorAntigo" TEXT,
    "valorNovo" TEXT,
    "tipoAcao" TEXT DEFAULT 'EDIT',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Historico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Upload" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER,
    "nomeArquivo" TEXT NOT NULL,
    "tipo" TEXT,
    "status" TEXT DEFAULT 'PROCESSANDO',
    "linhasProcessadas" INTEGER DEFAULT 0,
    "linhasComErro" INTEGER DEFAULT 0,
    "metadados" TEXT,
    "dataUpload" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Snapshot" (
    "id" SERIAL NOT NULL,
    "uploadId" INTEGER,
    "tipoDados" TEXT,
    "dados" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Loja_bkn_key" ON "Loja"("bkn");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Chamado" ADD CONSTRAINT "Chamado_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OSC" ADD CONSTRAINT "OSC_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OSC" ADD CONSTRAINT "OSC_chamadoId_fkey" FOREIGN KEY ("chamadoId") REFERENCES "Chamado"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preventiva" ADD CONSTRAINT "Preventiva_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ART" ADD CONSTRAINT "ART_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Faturamento" ADD CONSTRAINT "Faturamento_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historico" ADD CONSTRAINT "Historico_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Upload" ADD CONSTRAINT "Upload_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
