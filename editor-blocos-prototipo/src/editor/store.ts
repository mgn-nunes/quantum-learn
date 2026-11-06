import { create } from 'zustand';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type XYPosition,
} from '@xyflow/react';
import { BLOCOS_POR_ID } from './blocos';
import { validarConexao } from './conexoes';

export type DadosNo = { blocoId: string; angulo?: string };
export type NoDoEditor = Node<DadosNo, 'bloco'>;

interface Estado {
  nodes: NoDoEditor[];
  edges: Edge[];
  aviso: { id: number; texto: string } | null;

  aoMudarNos: (mudancas: NodeChange<NoDoEditor>[]) => void;
  aoMudarFios: (mudancas: EdgeChange[]) => void;
  aoConectar: (conexao: Connection) => void;
  adicionarBloco: (blocoId: string, posicao: XYPosition) => void;
  definirAngulo: (idNo: string, angulo: string) => void;
  limpar: () => void;
  mostrarAviso: (texto: string) => void;
}

const GRADE = 20;
const aGrade = (n: number) => Math.round(n / GRADE) * GRADE;

let sequencia = 0;
let temporizadorAviso: ReturnType<typeof setTimeout> | undefined;

export const useEditor = create<Estado>()((set, get) => ({
  nodes: [],
  edges: [],
  aviso: null,

  aoMudarNos: (mudancas) => set({ nodes: applyNodeChanges(mudancas, get().nodes) }),

  aoMudarFios: (mudancas) => set({ edges: applyEdgeChanges(mudancas, get().edges) }),

  aoConectar: (conexao) => {
    const r = validarConexao(conexao, get().edges);
    if (!r.ok) return get().mostrarAviso(r.motivo);
    set({ edges: addEdge({ ...conexao, type: 'fio' }, get().edges) });
  },

  adicionarBloco: (blocoId, posicao) => {
    const def = BLOCOS_POR_ID[blocoId];
    if (!def) return;
    const no: NoDoEditor = {
      id: `no-${++sequencia}`,
      type: 'bloco',
      position: { x: aGrade(posicao.x), y: aGrade(posicao.y) },
      data: { blocoId, ...(def.parametro === 'angulo' ? { angulo: 'pi/2' } : {}) },
    };
    set({ nodes: [...get().nodes.map((n) => ({ ...n, selected: false })), { ...no, selected: true }] });
  },

  definirAngulo: (idNo, angulo) =>
    set({
      nodes: get().nodes.map((n) => (n.id === idNo ? { ...n, data: { ...n.data, angulo } } : n)),
    }),

  limpar: () => set({ nodes: [], edges: [] }),

  mostrarAviso: (texto) => {
    clearTimeout(temporizadorAviso);
    set({ aviso: { id: Date.now(), texto } });
    temporizadorAviso = setTimeout(() => set({ aviso: null }), 4000);
  },
}));
