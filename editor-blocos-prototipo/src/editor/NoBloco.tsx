import { memo, type CSSProperties } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ANGULOS, BLOCOS_POR_ID, CATEGORIAS } from './blocos';
import { useEditor, type NoDoEditor } from './store';

const topoDoPino = (i: number, total: number) => `${((i + 1) / (total + 1)) * 100}%`;

function NoBlocoBase({ id, data, selected }: NodeProps<NoDoEditor>) {
  const def = BLOCOS_POR_ID[data.blocoId];
  const ehQubit = def?.id === 'qubit.create';

  // posição do qubit entre os qubits do circuito: q0, q1, ...
  const numero = useEditor((s) =>
    ehQubit
      ? s.nodes.filter((n) => n.data.blocoId === 'qubit.create').findIndex((n) => n.id === id)
      : -1,
  );
  const definirAngulo = useEditor((s) => s.definirAngulo);

  if (!def) return null;

  const cat = CATEGORIAS[def.categoria];
  const totalPinos = Math.max(def.entradas.length, def.saidas.length);
  const temRotulos = def.entradas.some((p) => p.rotulo);

  const estilo = {
    '--cor': cat.cor,
    '--sombra': cat.sombra,
    width: def.largura,
    minHeight: Math.max(64, totalPinos * 32 + 16),
  } as CSSProperties;

  return (
    <div className="chip" data-selecionado={selected} style={estilo}>
      {def.entradas.map((p, i) => (
        <Handle
          key={p.id}
          id={p.id}
          type="target"
          position={Position.Left}
          className={`pino pino-${p.tipo}`}
          style={{ top: topoDoPino(i, def.entradas.length) }}
        />
      ))}

      {def.entradas.map(
        (p, i) =>
          p.rotulo && (
            <span
              key={`r-${p.id}`}
              className="chip-rotulo"
              style={{ top: topoDoPino(i, def.entradas.length) }}
            >
              {p.rotulo}
            </span>
          ),
      )}

      <div className="chip-miolo" style={{ paddingLeft: temRotulos ? 56 : 0 }}>
        <span className={`chip-nome${def.nome.length > 5 ? ' longo' : ''}`}>{def.nome}</span>

        {ehQubit && <span className="chip-sub">q{numero}</span>}

        {def.parametro === 'angulo' && (
          <label className="chip-angulo nodrag nopan">
            <span aria-hidden="true">θ</span>
            <select
              aria-label="Ângulo θ"
              value={data.angulo ?? 'pi/2'}
              onChange={(e) => definirAngulo(id, e.target.value)}
            >
              {ANGULOS.map((a) => (
                <option key={a.valor} value={a.valor}>
                  {a.rotulo}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {def.saidas.map((p, i) => (
        <Handle
          key={p.id}
          id={p.id}
          type="source"
          position={Position.Right}
          className={`pino pino-${p.tipo}`}
          style={{ top: topoDoPino(i, def.saidas.length) }}
        />
      ))}
    </div>
  );
}

export const NoBloco = memo(NoBlocoBase);
