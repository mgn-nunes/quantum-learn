// Catálogo de blocos do editor.
// Os ids seguem o formato usado na `toolbox` das lições (ARCHITECTURE.md §4.4).

export type TipoFio = 'qubit' | 'bit';
export type Categoria = 'qubits' | 'porta1' | 'portaN' | 'medicao' | 'resultado';

export interface Pino {
  /** id do handle: `in|out-q|b-índice`, ex.: `in-q-0` */
  id: string;
  tipo: TipoFio;
  rotulo?: string;
}

export interface DefinicaoBloco {
  id: string;
  nome: string;
  titulo: string;
  categoria: Categoria;
  entradas: Pino[];
  saidas: Pino[];
  largura: number;
  parametro?: 'angulo';
}

export const CATEGORIAS: Record<Categoria, { nome: string; cor: string; sombra: string }> = {
  qubits: { nome: 'Qubits', cor: '#6ec1ff', sombra: '#3d8fcf' },
  porta1: { nome: 'Portas de 1 qubit', cor: '#b79cff', sombra: '#7d5fd6' },
  portaN: { nome: 'Portas de 2+ qubits', cor: '#ff8fa3', sombra: '#d65a73' },
  medicao: { nome: 'Medição', cor: '#ffc857', sombra: '#cc9a2a' },
  resultado: { nome: 'Resultado', cor: '#7ddc9a', sombra: '#44a866' },
};

export const ORDEM_CATEGORIAS: Categoria[] = ['qubits', 'porta1', 'portaN', 'medicao', 'resultado'];

export const COR_FIO: Record<TipoFio, string> = {
  qubit: CATEGORIAS.qubits.cor,
  bit: CATEGORIAS.medicao.cor,
};

export const ANGULOS = [
  { valor: 'pi/8', rotulo: 'π/8' },
  { valor: 'pi/4', rotulo: 'π/4' },
  { valor: 'pi/2', rotulo: 'π/2' },
  { valor: 'pi', rotulo: 'π' },
  { valor: '3pi/2', rotulo: '3π/2' },
];

const pino = (dir: 'in' | 'out', tipo: TipoFio, i: number, rotulo?: string): Pino => ({
  id: `${dir}-${tipo === 'qubit' ? 'q' : 'b'}-${i}`,
  tipo,
  rotulo,
});

/** Descobre o tipo do fio pelo id do handle. */
export const tipoDoPino = (idHandle: string): TipoFio =>
  idHandle.split('-')[1] === 'q' ? 'qubit' : 'bit';

const q = (dir: 'in' | 'out', i: number, rotulo?: string) => pino(dir, 'qubit', i, rotulo);

const porta1 = (
  sufixo: string,
  nome: string,
  titulo: string,
  parametro?: 'angulo',
): DefinicaoBloco => ({
  id: `gate.${sufixo}`,
  nome,
  titulo,
  categoria: 'porta1',
  entradas: [q('in', 0)],
  saidas: [q('out', 0)],
  largura: parametro ? 112 : 84,
  parametro,
});

export const BLOCOS: DefinicaoBloco[] = [
  {
    id: 'qubit.create',
    nome: '|0⟩',
    titulo: 'Qubit: começa no estado |0⟩',
    categoria: 'qubits',
    entradas: [],
    saidas: [q('out', 0)],
    largura: 96,
  },
  porta1('x', 'X', 'Porta X: troca |0⟩ por |1⟩ e vice-versa'),
  porta1('y', 'Y', 'Porta Y: gira o qubit em torno do eixo Y'),
  porta1('z', 'Z', 'Porta Z: inverte o sinal de |1⟩'),
  porta1('h', 'H', 'Porta Hadamard: coloca o qubit em superposição'),
  porta1('s', 'S', 'Porta S: gira a fase em 90°'),
  porta1('t', 'T', 'Porta T: gira a fase em 45°'),
  porta1('rx', 'Rx', 'Rotação em torno do eixo X, com ângulo θ', 'angulo'),
  porta1('ry', 'Ry', 'Rotação em torno do eixo Y, com ângulo θ', 'angulo'),
  porta1('rz', 'Rz', 'Rotação em torno do eixo Z, com ângulo θ', 'angulo'),
  {
    id: 'gate.cx',
    nome: 'CNOT',
    titulo: 'CNOT: inverte o alvo quando o controle é |1⟩',
    categoria: 'portaN',
    entradas: [q('in', 0, 'controle'), q('in', 1, 'alvo')],
    saidas: [q('out', 0), q('out', 1)],
    largura: 132,
  },
  {
    id: 'gate.cz',
    nome: 'CZ',
    titulo: 'CZ: aplica Z no alvo quando o controle é |1⟩',
    categoria: 'portaN',
    entradas: [q('in', 0, 'controle'), q('in', 1, 'alvo')],
    saidas: [q('out', 0), q('out', 1)],
    largura: 120,
  },
  {
    id: 'gate.swap',
    nome: 'SWAP',
    titulo: 'SWAP: troca os estados de dois qubits',
    categoria: 'portaN',
    entradas: [q('in', 0, 'a'), q('in', 1, 'b')],
    saidas: [q('out', 0), q('out', 1)],
    largura: 120,
  },
  {
    id: 'gate.ccx',
    nome: 'Toffoli',
    titulo: 'Toffoli: inverte o alvo quando os dois controles são |1⟩',
    categoria: 'portaN',
    entradas: [q('in', 0, 'controle'), q('in', 1, 'controle'), q('in', 2, 'alvo')],
    saidas: [q('out', 0), q('out', 1), q('out', 2)],
    largura: 150,
  },
  {
    id: 'measure',
    nome: 'Medir',
    titulo: 'Medir: transforma o qubit em um bit clássico (0 ou 1)',
    categoria: 'medicao',
    entradas: [q('in', 0)],
    saidas: [pino('out', 'bit', 0)],
    largura: 104,
  },
  {
    id: 'result.histogram',
    nome: 'Histograma',
    titulo: 'Histograma: mostra com que frequência cada resultado aparece',
    categoria: 'resultado',
    entradas: [0, 1, 2, 3].map((i) => pino('in', 'bit', i, `bit ${i}`)),
    saidas: [],
    largura: 172,
  },
];

export const BLOCOS_POR_ID: Record<string, DefinicaoBloco> = Object.fromEntries(
  BLOCOS.map((b) => [b.id, b]),
);
