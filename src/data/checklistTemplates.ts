
import { ChecklistType } from "@/types";

interface ChecklistTemplate {
  type: ChecklistType;
  title: string;
  items: { description: string }[];
}

export const checklistTemplates: ChecklistTemplate[] = [
  {
    type: "reposicao-frente-loja",
    title: "Reposição Frente de Loja",
    items: [
      { description: "COLHER" },
      { description: "GUARDANAPO" },
      { description: "PAPEL KRAFT" },
      { description: "EMBALAGEM AÇAÍ" },
      { description: "LANCHE DELIVERY" },
      { description: "PAÇOCA" },
      { description: "ÁGUA COM GÁS" },
      { description: "ÁGUA SEM GÁS" },
      { description: "TAMPAS" },
      { description: "COMPLEMENTOS (POPS)" },
      { description: "HALLS" },
      { description: "TRIDENT" },
      { description: "CHICLETE" },
      { description: "ÁLCOOL LÍQUIDO" },
      { description: "PAÇOCAS" },
      { description: "ÁGUA DA CASA" },
      { description: "COPO DESCARTÁVEL" }
    ]
  },
  {
    type: "estoque-seco",
    title: "Estoque Seco",
    items: [
      { description: "PISO" },
      { description: "CAIXAS DE PAPELÃO" },
      { description: "RESÍDUOS" },
      { description: "PAREDES" },
      { description: "PRATELEIRAS" },
      { description: "GELADEIRA FUNCIONÁRIOS" },
      { description: "EMBALAGENS" },
      { description: "ARMAZENAGEM DOS PRODUTOS" },
      { description: "DESCARTÁVEIS" },
      { description: "CONTROLE DE VALIDADE (PVPS)" },
      { description: "IDENTIFICAÇÃO DOS PRODUTOS" },
      { description: "OBJETOS EM DESUSO" }
    ]
  },
  {
    type: "cozinha-copa",
    title: "Cozinha e Copa",
    items: [
      { description: "MESAS/ CADEIRAS" },
      { description: "CHÃO/ TETO/LUMINÁRIAS" },
      { description: "PAREDE/TOMADAS" },
      { description: "ARMÁRIOS" },
      { description: "FREEZER (FUNCIONÁRIOS)" },
      { description: "GELADEIRA / POLPA" },
      { description: "ARMÁRIOS/ GAVETAS" },
      { description: "BALCÃO" },
      { description: "BANDEJAS" },
      { description: "LIMPEZA INTERNA E EXTERNA" },
      { description: "PORTAS DE VIDRO" },
      { description: "LIXEIRAS" },
      { description: "PAINEL DE SENHAS" },
      { description: "BRINQUEDOTECA" }
    ]
  },
  {
    type: "banheiros",
    title: "Banheiros",
    items: [
      { description: "CHÃO" },
      { description: "TETO" },
      { description: "LUMINÁRIA" },
      { description: "PAREDES" },
      { description: "PORTA" },
      { description: "PIA" },
      { description: "TORNEIRA" },
      { description: "ESPELHO" },
      { description: "SABONETE" },
      { description: "VASO SANITÁRIO" },
      { description: "PORTA TOALHA" },
      { description: "PAPEL HIGIÊNICO" },
      { description: "LIXEIRA" },
      { description: "RALO TAMPADO" },
      { description: "MESA DE APOIO TROCA FRALDAS" }
    ]
  },
  {
    type: "area-producao",
    title: "Área de Produção",
    items: [
      { description: "TOUCA/MASCARA ENTRADA" },
      { description: "PISO" },
      { description: "PORTA" },
      { description: "PAREDE" },
      { description: "TETO" },
      { description: "PIA" },
      { description: "SABONETE BACTERICIDA" },
      { description: "PAPEL TOALHA" },
      { description: "LIXEIRA" },
      { description: "SIFAO" },
      { description: "MAQUINÁRIOS" },
      { description: "PRATELEIRAS" },
      { description: "EQUIPAMENTOS EM DESUSO" },
      { description: "BANCADA DE MANIPULAÇÃO" },
      { description: "PRODUTOS QUÍMICOS / LOCAL CORRETO" },
      { description: "ARMÁRIO" },
      { description: "FREEZER / POLPA" },
      { description: "S.O. / BANANA / POLPA QUEBRADAS" },
      { description: "BALDES PARA PRODUÇÃO" },
      { description: "LIXEIRAS" },
      { description: "AR CONDICIONADO" },
      { description: "MAPEAMENTO DOS BALDES" },
      { description: "PVPS" },
      { description: "COPOS TAMPADOS" },
      { description: "IDENTIFICAÇÃO DOS COPOS" },
      { description: "LIMPEZA FREEZER" },
      { description: "TEMPERATURA FREEZER" },
      { description: "GELO FREEZER" },
      { description: "TEMPO DESCONGELAMENTO" },
      { description: "VALIDADE AÇAÍ" },
      { description: "CONSISTENCIA AÇAÍ" },
      { description: "INSUMOS / MATÉRIA PRIMA" },
      { description: "LAVAGEM UTENSÍLIOS EM GERAL" },
      { description: "CHECAGEM BALANÇA" },
      { description: "REPOSIÇÃO DE ESTOQUE SECO" },
      { description: "REPOSIÇÃO DE MATÉRIA PRIMA" },
      { description: "PORCIONAMENTO GERAL" },
      { description: "HIGIENIZAÇÃO PESSOAL" },
      { description: "MONTAGEM DOS ITENS/ADICIONAIS" },
      { description: "MATÉRIA PRIMA EM DESUSO" },
      { description: "UTENSÍLIOS" },
      { description: "CONCHAS" }
    ]
  },
  {
    type: "area-externa",
    title: "Área Externa",
    items: [
      { description: "MESAS/ CADEIRAS" },
      { description: "CHÃO/ TETO/LUMINÁRIAS" },
      { description: "PAREDE/TOMADAS" },
      { description: "ARMÁRIOS" },
      { description: "FREEZER (FUNCIONÁRIOS)" },
      { description: "GELADEIRA / POLPA" },
      { description: "ARMÁRIOS/ GAVETAS" },
      { description: "BALCÃO" },
      { description: "BANDEJAS" },
      { description: "LIMPEZA INTERNA E EXTERNA" },
      { description: "PORTAS DE VIDRO" },
      { description: "LIXEIRAS" },
      { description: "PAINEL DE SENHAS" },
      { description: "BRINQUEDOTECA" }
    ]
  },
  {
    type: "vistoria1",
    title: "Vistoria Manhã",
    items: [
      { description: "MESAS/ CADEIRAS" },
      { description: "CHÃO/ TETO/LUMINÁRIAS" },
      { description: "PAREDE/TOMADAS" },
      { description: "ARMÁRIOS" },
      { description: "FREEZER (FUNCIONÁRIOS)" },
      { description: "GELADEIRA / POLPA" },
      { description: "ARMÁRIOS/ GAVETAS" },
      { description: "BALCÃO" },
      { description: "BANDEJAS" },
      { description: "LIMPEZA INTERNA E EXTERNA" },
      { description: "PORTAS DE VIDRO" },
      { description: "LIXEIRAS" },
      { description: "PAINEL DE SENHAS" },
      { description: "BRINQUEDOTECA" }
    ]
  },
  {
    type: "vistoria2",
    title: "Vistoria Tarde",
    items: [
      { description: "MESAS/ CADEIRAS" },
      { description: "CHÃO/ TETO/LUMINÁRIAS" },
      { description: "PAREDE/TOMADAS" },
      { description: "ARMÁRIOS" },
      { description: "FREEZER (FUNCIONÁRIOS)" },
      { description: "GELADEIRA / POLPA" },
      { description: "ARMÁRIOS/ GAVETAS" },
      { description: "BALCÃO" },
      { description: "BANDEJAS" },
      { description: "LIMPEZA INTERNA E EXTERNA" },
      { description: "PORTAS DE VIDRO" },
      { description: "LIXEIRAS" },
      { description: "PAINEL DE SENHAS" },
      { description: "BRINQUEDOTECA" }
    ]
  },
  {
    type: "vistoria3",
    title: "Vistoria Noite",
    items: [
      { description: "MESAS/ CADEIRAS" },
      { description: "CHÃO/ TETO/LUMINÁRIAS" },
      { description: "PAREDE/TOMADAS" },
      { description: "ARMÁRIOS" },
      { description: "FREEZER (FUNCIONÁRIOS)" },
      { description: "GELADEIRA / POLPA" },
      { description: "ARMÁRIOS/ GAVETAS" },
      { description: "BALCÃO" },
      { description: "BANDEJAS" },
      { description: "LIMPEZA INTERNA E EXTERNA" },
      { description: "PORTAS DE VIDRO" },
      { description: "LIXEIRAS" },
      { description: "PAINEL DE SENHAS" },
      { description: "BRINQUEDOTECA" }
    ]
  }
];
