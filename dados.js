/*
  DADOS DA CLÍNICA
  ----------------
  Tudo o que muda com o tempo fica aqui: telefone, WhatsApp, endereço,
  horários, nota do Google, responsável técnico e depoimentos.
  Troque o valor entre aspas, salve o arquivo e recarregue o site.
  O site inteiro (cabeçalho, botões, mapa, horários, rodapé e dados para o
  Google) se atualiza sozinho a partir deste arquivo.
*/
window.CLINICA = {
  nome: 'Clínica Odontológica',
  local: 'Samambaia Norte',

  // Telefone como aparece na tela, e o mesmo número só com dígitos (com 55 do Brasil) para o WhatsApp.
  // CONFIRMAR: se este número tem WhatsApp Business. Se não tiver, troque "whatsapp" pelo celular da recepção.
  telefone: '(61) 3458-5444',
  whatsapp: '556134585444',
  mensagemWhatsApp: 'Olá! Encontrei a clínica pelo site e gostaria de obter informações sobre os tratamentos e agendar um atendimento.',

  endereco: {
    rua: 'QS 412, Conjunto F, Lote 1/2, Sala 101',
    bairro: 'Samambaia Norte',
    cidade: 'Brasília',
    uf: 'DF',
    cep: '72320-556'
  },

  // Identificador do perfil no Google Maps (usado na rota e no link das avaliações).
  googlePlaceId: 'ChIJWzWRcHHTW5MRiDaJ0o7rvU4',
  // Ponto exato da clínica no mapa (tirado do perfil do Google Maps).
  coordenadas: { lat: -15.8606404, lng: -48.0736242 },
  // Link do botão "Consultar avaliações no Google". Pode trocar pelo link curto do perfil, se preferir.
  linkAvaliacoes: 'https://www.google.com/maps/place/?q=place_id:ChIJWzWRcHHTW5MRiDaJ0o7rvU4',

  // Nota e número de avaliações no Google (coletados em 24/11/2026). Atualize de vez em quando.
  nota: 4.7,
  totalAvaliacoes: 463,
  temaPrincipal: { texto: 'Educação e cordialidade da equipe', mencoes: 23 },
  temasAvaliacoes: ['Recepção atenciosa', 'Atendimento ágil', 'Ambiente agradável', 'Tratamento ortodôntico'],

  // Horários (24h). Dia sem atendimento: fechado: true.
  horarios: [
    { dia: 'Domingo', curto: 'Dom', fechado: true },
    { dia: 'Segunda-feira', curto: 'Seg', abre: '09:00', fecha: '18:00' },
    { dia: 'Terça-feira', curto: 'Ter', abre: '09:00', fecha: '18:00' },
    { dia: 'Quarta-feira', curto: 'Qua', abre: '09:00', fecha: '18:00' },
    { dia: 'Quinta-feira', curto: 'Qui', abre: '09:00', fecha: '18:00' },
    { dia: 'Sexta-feira', curto: 'Sex', abre: '09:00', fecha: '18:00' },
    { dia: 'Sábado', curto: 'Sáb', abre: '08:30', fecha: '12:00' }
  ],
  avisoHorario: 'O horário pode variar em feriados.',

  // CONFIRMAR antes de publicar (exigência do CFO para clínicas).
  responsavelTecnico: {
    nome: 'Nome do responsável técnico',
    cro: 'CRO-DF 0000'
  },

  // Depoimentos REAIS, só com autorização do paciente. Exemplo de formato:
  // { texto: 'O que o paciente escreveu.', nome: 'Primeiro nome e inicial', origem: 'Google' }
  // Enquanto a lista estiver vazia, o site mostra espaços reservados.
  depoimentos: [],

  instagram: '' // ex.: 'https://instagram.com/perfil' (deixe vazio para não mostrar)
};
