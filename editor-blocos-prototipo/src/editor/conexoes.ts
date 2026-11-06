import type { Connection, Edge } from '@xyflow/react';
import { tipoDoPino } from './blocos';

export type Resultado = { ok: true } | { ok: false; motivo: string };

/** O circuito corre da esquerda para a direita: ligar de volta criaria um ciclo. */
function criaCiclo(origem: string, destino: string, fios: Edge[]): boolean {
  const visitados = new Set<string>();
  const pilha = [destino];
  while (pilha.length) {
    const atual = pilha.pop()!;
    if (atual === origem) return true;
    if (visitados.has(atual)) continue;
    visitados.add(atual);
    for (const f of fios) if (f.source === atual) pilha.push(f.target);
  }
  return false;
}

export function validarConexao(c: Connection | Edge, fios: Edge[]): Resultado {
  if (!c.sourceHandle || !c.targetHandle) {
    return { ok: false, motivo: 'Ligue uma saída (à direita) a uma entrada (à esquerda).' };
  }
  if (c.source === c.target) {
    return { ok: false, motivo: 'Um bloco não pode ser ligado a ele mesmo.' };
  }

  const tipo = tipoDoPino(c.sourceHandle);
  if (tipo !== tipoDoPino(c.targetHandle)) {
    return { ok: false, motivo: 'Fios de qubit só ligam em qubits, e fios de bit só em bits.' };
  }

  if (fios.some((f) => f.target === c.target && f.targetHandle === c.targetHandle)) {
    return { ok: false, motivo: 'Esta entrada já tem um fio. Remova-o antes de ligar outro.' };
  }

  if (
    tipo === 'qubit' &&
    fios.some((f) => f.source === c.source && f.sourceHandle === c.sourceHandle)
  ) {
    return {
      ok: false,
      motivo: 'Um qubit não pode ser copiado: cada saída liga a uma única entrada.',
    };
  }

  if (criaCiclo(c.source, c.target, fios)) {
    return { ok: false, motivo: 'Isso criaria um ciclo. O circuito corre da esquerda para a direita.' };
  }

  return { ok: true };
}
