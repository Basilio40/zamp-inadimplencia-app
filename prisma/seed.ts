import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const INAD_DATA = [
  ["21792","RIO ANIL SHOP CENTER","MA",2,26181.11,26181.11,"Jefferson Guedes","Marcelo Gomes"],
  ["16692","Shopping Buriti Goiania","GO",1,24278.88,24278.88,"-","-"],
  ["18517","ROAD SHOP - SS875889","SP",2,22677.36,22677.36,"Fabio Amorim","Marcelo Gomes"],
  ["31060","LONDRINA AV SAUL ELKIND,3149","PR",1,22532.56,22532.56,"Vagner de Brito","Rodrigo Cruz"],
  ["24363","AMERICANA - AV N SRA DE FATIMA 231","SP",1,19138.14,19138.14,"-","-"],
  ["22705","GRU - AV DR TIMOTEO PENTEADO 3975","SP",2,17979.12,17979.12,"-","-"],
  ["25073","BK - Shop Cajazeiras","MG",2,14999.66,14999.66,"-","-"],
  ["18316","SHOP BOA VISTA SP","SP",2,12994.83,12994.83,"Fabio Amorim","Marcelo Gomes"],
  ["22912","ITATIBA - AV CASTELO BRANCO 687","SP",1,12517.2,12517.2,"Fabio Amorim","Marcelo Gomes"],
  ["15374","SP - AV HELIO PELLEGRINO 1072","SP",2,10725.91,10725.91,"-","-"],
  ["26811","SP - AV RAGUEB CHOHFI 2022","SP",1,9998.73,9998.73,"-","-"],
  ["21800","SHOP JARDIM SUL","SP",1,9864.73,9864.73,"-","-"],
  ["26433","SANTO ANDRE - AV PRESTES MAIA","SP",1,9008.98,9008.98,"-","-"],
  ["24366","FS ARARAS - AV DONA RENATA 2858","SP",2,8933.75,8933.75,"-","-"],
  ["21844","SHOP CASTANHEIRAS","PA",4,8710.94,8710.94,"-","-"],
  ["28087","SHOP VILLA VISEU","SP",1,8660.36,8660.36,"-","-"],
  ["19527","ITAPECERICA SHOP","SP",1,7917.81,7917.81,"Fabio Amorim","Marcelo Gomes"],
  ["27468","SP - AV SALIM FARAH MALUF","SP",2,7524.87,7524.87,"-","-"],
  ["15511","BH SHOP","MG",1,7497.56,7497.56,"-","-"],
  ["18816","SHOP VIC SANTA BARBARA","SP",1,7425.69,7425.69,"Fabio Amorim","Marcelo Gomes"],
];

const DET_DATA = [
  ["21792","RIO ANIL SHOP CENTER","MA","16733","EXECUTADO",25129.92,"Troca de unidade condensadora"],
  ["21792","RIO ANIL SHOP CENTER","MA","16961","FOLHA DE SERVIÇO CRIADA",1051.19,"CAMARA DE RESFRIADOS - troca da contatora"],
  ["16692","Shopping Buriti Goiania","GO","17114","MATERIAL LIBERADO",24278.88,"Ar condicionado - troca de compressor e carga de gas"],
  ["18517","ROAD SHOP","SP","16761","FOLHA DE SERVIÇO CRIADA",12684.93,"Troca do compressor"],
  ["18517","ROAD SHOP","SP","16989","MATERIAL LIBERADO",9992.43,"Ar Condicionado - Splitão Hitachi - Substituição de compressor"],
  ["31060","LONDRINA AV SAUL ELKIND","PR","16717","EXECUTADO",22532.56,"Manutenção Splitão - troca de compressor"],
  ["24363","AMERICANA - AV N SRA DE FATIMA","SP","16856","EXECUTADO",19138.14,"Ar-condicionado Splitão"],
  ["22705","GRU - AV DR TIMOTEO PENTEADO 3975","SP","17148","EXECUTADO",8989.56,"Camara fria - troca do compressor"],
  ["22705","GRU - AV DR TIMOTEO PENTEADO 3975","SP","17194","EXECUTADO",8989.56,"Câmara de resfriado - troca do moto ventilador"],
  ["25073","BK - Shop Cajazeiras","MG","17232","MATERIAL LIBERADO",14021.58,"Camara de resfriado - troca do compressor"],
  ["25073","BK - Shop Cajazeiras","MG","17233","MATERIAL LIBERADO",978.08,"Camara congelado - troca do controlador"],
  ["18316","SHOP BOA VISTA SP","SP","16777","FOLHA DE SERVIÇO CRIADA",9700.83,"Motor elétrico trifásico Weg 5 cv"],
  ["18316","SHOP BOA VISTA SP","SP","16824","EXECUTADO",3294.0,"Rebobinamento de Motor WEG"],
  ["22912","ITATIBA - AV CASTELO BRANCO 687","SP","16767","EXECUTADO",12517.2,"Troca de placas da condensadora"],
  ["15374","SP - AV HELIO PELLEGRINO 1072","SP","16963","FOLHA DE SERVIÇO CRIADA",8950.7,"Câmara de resfriado - troca de compressor"],
  ["15374","SP - AV HELIO PELLEGRINO 1072","SP","17094","MATERIAL LIBERADO",1775.21,"Ar condicionado split - troca motor ventilador"],
  ["26811","SP - AV RAGUEB CHOHFI 2022","SP","16977","EXECUTADO",9998.73,"Ar condicionado - troca da placa"],
  ["21800","SHOP JARDIM SUL","SP","17199","EXECUTADO",9864.73,"Troca de unidade condensadora"],
];

const PREV_DATA = [
  ["BK 31068 - MACEIO","AL","FRIO/AR",800,725,1525],
  ["BK 18288 - MACEIO SHOPPING","AL","FRIO",800,0,800],
  ["BK 28359 - SALVADOR","BA","FRIO/AR",800,725,1525],
  ["BK 31876 - SHOPPING CONQUISTA SUL","BA","FRIO",800,725,1525],
  ["BK 15512 - SHOP BARRA SALVADOR","BA","FRIO",800,0,800],
  ["BK 16133 - SALVADOR SHOP","BA","FRIO",800,0,800],
  ["BK 17235 - SHOPPING PARALELA","BA","FRIO",800,0,800],
  ["BK 20899 - SHOPPING DA BAHIA","BA","FRIO",800,0,800],
  ["BK 21087 - SHOPPING BELA VISTA","BA","FRIO",800,0,800],
  ["BK 21909 - SHOPPING DA BAHIA II","BA","FRIO",800,0,800],
  ["BK 25073 - SHOP CAJAZEIRAS","BA","FRIO",800,0,800],
  ["BK 30904 - SALVADOR MANGABEIRA","BA","FRIO/AR",800,0,800],
  ["BK 16093 - SHOP IGUATEMI FORTALEZA","CE","FRIO",800,0,800],
  ["BK 17785 - SHOPPING VIA SUL","CE","FRIO",800,0,800],
  ["BK 20887 - SHOPPING BENFICA","CE","FRIO",800,0,800],
  ["BK 21344 - SHOPPING PARANGABA","CE","FRIO",800,0,800],
  ["BK 21476 - NORTH SHOP MARACANAU","CE","FRIO",800,0,800],
  ["BK 21661 - SHOP IGUATEMI FORTALEZA II","CE","FRIO",800,0,800],
  ["BK 22763 - NORTH SHOP FORTALEZA","CE","FRIO",800,0,800],
  ["BK 25854 - GRAND SHOP MESSEJANA","CE","FRIO",800,0,800],
];

async function main() {
  console.log('Iniciando seed...');

  const senhaHash = await bcrypt.hash('admin123', 10);
  const usuarios = [
    { email: 'admin@zamp.com', nome: 'Administrador', senhaHash, perfil: 'ADMIN' },
    { email: 'coord@zamp.com', nome: 'Coordenador', senhaHash, perfil: 'COORDENADOR' },
    { email: 'super@zamp.com', nome: 'Supervisor', senhaHash, perfil: 'SUPERVISOR', supervisorRegional: 'SP' },
    { email: 'leitor@zamp.com', nome: 'Leitor', senhaHash, perfil: 'LEITURA' },
  ];
  for (const u of usuarios) {
    await prisma.usuario.upsert({ where: { email: u.email }, update: {}, create: u });
  }

  for (const row of INAD_DATA) {
    const [bkn, nome, uf, qtdOscs, valorTotal, matParado, supervisor, coordenador] = row;
    const cliente = nome.includes('SHOP') || nome.includes('SHOPPING') ? 'BK' : 'CARREFOUR';
    
    const loja = await prisma.loja.create({
      data: {
        bkn: String(bkn),
        nome: String(nome),
        cliente,
        uf: String(uf),
        supervisor: String(supervisor),
        pcm: String(coordenador),
        escopo: 'FRIO/AR',
      },
    });

    const chamado = await prisma.chamado.create({
      data: {
        lojaId: loja.id,
        numeroChamado: `2026/${String(loja.id).padStart(4, '0')}`,
        pda: String(bkn),
        status: 'PENDENTE',
        mes: 'FEVEREIRO',
        descricaoServico: 'Chamado corretivo em aberto',
        valorProposta: Number(valorTotal),
        observacoes: `${qtdOscs} OSCs em aberto`,
      },
    });

    const oscsDet = DET_DATA.filter(d => d[0] === bkn);
    for (const oscRow of oscsDet) {
      await prisma.oSC.create({
        data: {
          lojaId: loja.id,
          chamadoId: chamado.id,
          numeroOsc: String(oscRow[3]),
          status: String(oscRow[4]),
          valor: Number(oscRow[5]),
          descricao: String(oscRow[6]),
          cobrancaImediata: String(oscRow[4]).toUpperCase().includes('EXECUTADO'),
        },
      });
    }

    if (oscsDet.length === 0) {
      await prisma.oSC.create({
        data: {
          lojaId: loja.id,
          chamadoId: chamado.id,
          numeroOsc: `OSC-${bkn}-1`,
          status: 'PENDENTE',
          valor: Number(valorTotal),
          descricao: 'Chamado corretivo',
          cobrancaImediata: false,
        },
      });
    }

    await prisma.faturamento.create({
      data: {
        lojaId: loja.id,
        tipo: 'CORRETIVA',
        status: 'PENDENTE',
        valor: Number(valorTotal),
      },
    });
  }

  for (const row of PREV_DATA) {
    const [lojaNome, uf, escopo, valFrio, valAr, total] = row;
    const bknMatch = String(lojaNome).match(/BK\s*(\d+)/);
    const bkn = bknMatch ? bknMatch[1] : null;
    
    let loja = bkn ? await prisma.loja.findFirst({ where: { bkn } }) : null;
    
    if (!loja) {
      loja = await prisma.loja.create({
        data: {
          bkn: bkn || `PREV-${Math.floor(Math.random() * 100000)}`,
          nome: String(lojaNome).replace(/BK\s*\d+\s*-\s*/, ''),
          cliente: 'BK',
          uf: String(uf),
          escopo: String(escopo).toUpperCase(),
        },
      });
    }

    await prisma.preventiva.create({
      data: {
        lojaId: loja.id,
        mesRef: 'MARÇO',
        ano: 2026,
        tipoManutencao: 'AR_CONDICIONADO',
        periodicidade: 'MENSAL',
        status: 'PENDENTE',
        valorFrio: Number(valFrio),
        valorAr: Number(valAr),
        valorTotal: Number(total),
      },
    });

    const existingFat = await prisma.faturamento.findFirst({
      where: { lojaId: loja.id, tipo: 'PREVENTIVA' },
    });
    if (!existingFat) {
      await prisma.faturamento.create({
        data: {
          lojaId: loja.id,
          tipo: 'PREVENTIVA',
          status: 'PENDENTE',
          valor: Number(total),
        },
      });
    }
  }

  console.log('Seed finalizado!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
