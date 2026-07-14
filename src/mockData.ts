export interface Funcionario {
  id: string;
  nome: string;
  especialidade: string;
}

export interface Agendamento {
  id: string;
  funcionarioId: string;
  clienteNome: string;
  servicoNome: string;
  horarioInicio: string; // Formato "HH:MM"
  horarioFim: string;    // Formato "HH:MM"
  status: 'confirmado' | 'pendente' | 'bloqueio';
  preco?: number;
}

export const FUNCIONARIOS_MOCK: Funcionario[] = [
  {
    id: 'f1',
    nome: 'Bruno Silva',
    especialidade: 'Cabelo & Barba Sênior',
  },
  {
    id: 'f2',
    nome: 'Lucas Nogueira',
    especialidade: 'Corte Moderno & Tintura',
  },
  {
    id: 'f3',
    nome: 'Ana Costa',
    especialidade: 'Barba Clássica & Visagismo',
  },
  {
    id: 'f4',
    nome: 'Mateus Santos',
    especialidade: 'Cortes Clássicos & Infantil',
  }
];

export const AGENDAMENTOS_MOCK: Agendamento[] = [
  // Bruno Silva
  {
    id: 'a1',
    funcionarioId: 'f1',
    clienteNome: 'Gustavo Santos',
    servicoNome: 'Corte Masculino + Barba',
    horarioInicio: '08:00',
    horarioFim: '09:30',
    status: 'confirmado',
    preco: 95.00
  },
  {
    id: 'a2',
    funcionarioId: 'f1',
    clienteNome: 'Carlos Almeida',
    servicoNome: 'Aparar Barba',
    horarioInicio: '10:00',
    horarioFim: '10:30',
    status: 'confirmado',
    preco: 40.00
  },
  {
    id: 'a3',
    funcionarioId: 'f1',
    clienteNome: 'Almoço',
    servicoNome: 'Intervalo',
    horarioInicio: '12:00',
    horarioFim: '13:00',
    status: 'bloqueio'
  },
  {
    id: 'a4',
    funcionarioId: 'f1',
    clienteNome: 'Rodrigo Lima',
    servicoNome: 'Corte degradê',
    horarioInicio: '14:30',
    horarioFim: '15:30',
    status: 'pendente',
    preco: 60.00
  },
  {
    id: 'a5',
    funcionarioId: 'f1',
    clienteNome: 'Felipe Melo',
    servicoNome: 'Design de Barba',
    horarioInicio: '16:00',
    horarioFim: '16:30',
    status: 'confirmado',
    preco: 45.00
  },

  // Lucas Nogueira
  {
    id: 'a6',
    funcionarioId: 'f2',
    clienteNome: 'Roberto Souza',
    servicoNome: 'Corte Moderno',
    horarioInicio: '08:30',
    horarioFim: '09:30',
    status: 'confirmado',
    preco: 70.00
  },
  {
    id: 'a7',
    funcionarioId: 'f2',
    clienteNome: 'Almoço',
    servicoNome: 'Intervalo',
    horarioInicio: '13:00',
    horarioFim: '14:00',
    status: 'bloqueio'
  },
  {
    id: 'a8',
    funcionarioId: 'f2',
    clienteNome: 'Thiago Oliveira',
    servicoNome: 'Pintura de Cabelo',
    horarioInicio: '14:30',
    horarioFim: '16:00',
    status: 'confirmado',
    preco: 120.00
  },
  {
    id: 'a9',
    funcionarioId: 'f2',
    clienteNome: 'Gabriel Diniz',
    servicoNome: 'Corte Tesoura',
    horarioInicio: '17:00',
    horarioFim: '17:30',
    status: 'pendente',
    preco: 75.00
  },

  // Ana Costa
  {
    id: 'a10',
    funcionarioId: 'f3',
    clienteNome: 'Pedro Henrique',
    servicoNome: 'Barboterapia',
    horarioInicio: '09:00',
    horarioFim: '10:00',
    status: 'confirmado',
    preco: 80.00
  },
  {
    id: 'a11',
    funcionarioId: 'f3',
    clienteNome: 'Ricardo Gomes',
    servicoNome: 'Visagismo Completo',
    horarioInicio: '10:30',
    horarioFim: '12:00',
    status: 'confirmado',
    preco: 150.00
  },
  {
    id: 'a12',
    funcionarioId: 'f3',
    clienteNome: 'Almoço',
    servicoNome: 'Intervalo',
    horarioInicio: '12:30',
    horarioFim: '13:30',
    status: 'bloqueio'
  },
  {
    id: 'a13',
    funcionarioId: 'f3',
    clienteNome: 'Henrique F.',
    servicoNome: 'Corte Masculino',
    horarioInicio: '15:00',
    horarioFim: '15:30',
    status: 'pendente',
    preco: 65.00
  },
  {
    id: 'a14',
    funcionarioId: 'f3',
    clienteNome: 'Júlio Cesar',
    servicoNome: 'Alinhamento Barba',
    horarioInicio: '18:00',
    horarioFim: '18:30',
    status: 'confirmado',
    preco: 50.00
  },

  // Mateus Santos
  {
    id: 'a15',
    funcionarioId: 'f4',
    clienteNome: 'Almoço',
    servicoNome: 'Intervalo',
    horarioInicio: '12:00',
    horarioFim: '13:00',
    status: 'bloqueio'
  },
  {
    id: 'a16',
    funcionarioId: 'f4',
    clienteNome: 'Enzo Rodrigues',
    servicoNome: 'Corte Infantil',
    horarioInicio: '14:00',
    horarioFim: '14:30',
    status: 'confirmado',
    preco: 50.00
  },
  {
    id: 'a17',
    funcionarioId: 'f4',
    clienteNome: 'Diego Marques',
    servicoNome: 'Corte Clássico',
    horarioInicio: '16:30',
    horarioFim: '17:30',
    status: 'confirmado',
    preco: 60.00
  }
];
