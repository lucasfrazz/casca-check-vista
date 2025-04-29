
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
      { description: "Bancada limpa e seca" },
      { description: "Toalhas descartáveis disponíveis" },
      { description: "Copos para água disponíveis" },
      { description: "Porta guardanapos limpos e abastecidos" },
      { description: "Cardápios limpos" },
      { description: "Fachada limpa" },
      { description: "Chão limpo" },
      { description: "Máquina de cartão funcionando" },
    ]
  },
  {
    type: "estoque-seco",
    title: "Estoque Seco",
    items: [
      { description: "Prateleiras limpas e organizadas" },
      { description: "Produtos dentro da validade" },
      { description: "Sistema PVPS sendo respeitado" },
      { description: "Controle de validade atualizado" },
      { description: "Embalagens fechadas e protegidas" },
      { description: "Chão limpo e seco" },
      { description: "Ausência de materiais estranhos" }
    ]
  },
  {
    type: "cozinha-copa",
    title: "Cozinha e Copa",
    items: [
      { description: "Bancadas limpas e organizadas" },
      { description: "Utensílios higienizados" },
      { description: "Pia limpa" },
      { description: "Lixeira com tampa e acionamento por pedal" },
      { description: "Geladeira limpa e organizada" },
      { description: "Freezer limpo e organizado" },
      { description: "Chão limpo e seco" }
    ]
  },
  {
    type: "banheiros",
    title: "Banheiros",
    items: [
      { description: "Vaso sanitário limpo" },
      { description: "Sabonete líquido disponível" },
      { description: "Papel higiênico disponível" },
      { description: "Papel toalha disponível" },
      { description: "Lixeira com tampa" },
      { description: "Chão limpo e seco" },
      { description: "Ausência de odores" }
    ]
  },
  {
    type: "area-producao",
    title: "Área de Produção",
    items: [
      { description: "Equipamentos limpos" },
      { description: "Superfícies sanitizadas" },
      { description: "Colaboradores com uniformes completos" },
      { description: "Colaboradores utilizando toucas" },
      { description: "Lixeiras com tampa e pedal" },
      { description: "Pia para lavagem de mãos abastecida" },
      { description: "Produtos separados por categorias" }
    ]
  },
  {
    type: "area-externa",
    title: "Área Externa",
    items: [
      { description: "Calçada limpa" },
      { description: "Lixeiras externas vazias" },
      { description: "Vidros da fachada limpos" },
      { description: "Iluminação funcionando corretamente" },
      { description: "Ausência de insetos" },
      { description: "Entrada da loja desobstruída" },
      { description: "Ausência de odores" }
    ]
  }
];
