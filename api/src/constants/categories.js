export const CATEGORY_GROUPS = [
  {
    group: '🏠 Gastos com a Casa (Habitação)',
    options: [
      'Aluguel/Financiamento',
      'Condominio',
      'Luz (Energia)',
      'Agua',
      'Internet/TV a cabo',
      'Gas',
    ],
  },
  {
    group: '🛒 Alimentação',
    options: [
      'Supermercado (Compra do mes)',
      'Restaurantes e Bares',
      'Delivery (iFood/Ze Delivery)',
      'Padaria e Cafes',
    ],
  },
  {
    group: '🚗 Transporte',
    options: [
      'Combustivel',
      'Uber / 99 / Taxi',
      'Transporte Publico (Onibus/Metro)',
      'Manutencao e Seguro (Gastos fixos com carro)',
    ],
  },
  {
    group: '🏥 Saúde e Bem-estar',
    options: [
      'Farmacia',
      'Plano de Saude / Medicos',
      'Academia',
      'Higiene e Cosmeticos',
    ],
  },
  {
    group: '🍿 Lazer e Estilo de Vida',
    options: [
      'Assinaturas (Netflix, Spotify, Games)',
      'Roupas e Acessorios',
      'Hobbies / Cinema / Shows',
      'Presentes',
    ],
  },
  {
    group: '🎓 Educação',
    options: [
      'Mensalidades (Escola/Faculdade)',
      'Cursos e Livros',
    ],
  },
  {
    group: '💳 Financeiro e Outros',
    options: [
      'Fatura do Cartao',
      'Emprestimos / Juros',
      'Investimentos / Poupanca',
      'Impostos (IPTU, IPVA)',
      'Outros',
    ],
  },
];

export const ALLOWED_CATEGORIES = CATEGORY_GROUPS.flatMap((group) => group.options);
