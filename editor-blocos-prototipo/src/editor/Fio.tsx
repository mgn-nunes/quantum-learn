import {
  BaseEdge,
  getBezierPath,
  type ConnectionLineComponentProps,
  type EdgeProps,
} from '@xyflow/react';
import { COR_FIO, tipoDoPino, type TipoFio } from './blocos';

/** Qubit: linha contínua. Bit clássico: linha pontilhada (não depende só da cor). */
const estiloDoFio = (tipo: TipoFio) => ({
  stroke: COR_FIO[tipo],
  strokeWidth: 4,
  strokeLinecap: 'round' as const,
  strokeDasharray: tipo === 'bit' ? '1 9' : undefined,
});

export function Fio({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  sourceHandleId,
  selected,
}: EdgeProps) {
  const [caminho] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const tipo = tipoDoPino(sourceHandleId ?? '');

  return (
    <>
      {selected && (
        <BaseEdge
          id={`${id}-destaque`}
          path={caminho}
          interactionWidth={0}
          style={{ stroke: '#ffffff', strokeWidth: 9, strokeLinecap: 'round', opacity: 0.85 }}
        />
      )}
      <BaseEdge id={id} path={caminho} interactionWidth={24} style={estiloDoFio(tipo)} />
    </>
  );
}

export function FioEmConstrucao({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
  fromHandle,
}: ConnectionLineComponentProps) {
  const [caminho] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  });
  const tipo = tipoDoPino(fromHandle?.id ?? '');

  return <path d={caminho} fill="none" style={{ ...estiloDoFio(tipo), opacity: 0.8 }} />;
}
