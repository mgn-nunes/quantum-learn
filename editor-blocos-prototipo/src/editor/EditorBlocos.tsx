import { useCallback, useRef, type DragEvent } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type FinalConnectionState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './editor.css';

import { BarraBlocos, TIPO_ARRASTE } from './BarraBlocos';
import { Fio, FioEmConstrucao } from './Fio';
import { NoBloco } from './NoBloco';
import { validarConexao } from './conexoes';
import { useEditor } from './store';

const tiposDeNo = { bloco: NoBloco };
const tiposDeFio = { fio: Fio };

interface Props {
  /** ids dos blocos liberados pela lição (ex.: ['qubit.create', 'gate.h']) */
  toolbox?: string[];
}

function Quadro({ toolbox }: Props) {
  const nodes = useEditor((s) => s.nodes);
  const edges = useEditor((s) => s.edges);
  const aviso = useEditor((s) => s.aviso);
  const aoMudarNos = useEditor((s) => s.aoMudarNos);
  const aoMudarFios = useEditor((s) => s.aoMudarFios);
  const aoConectar = useEditor((s) => s.aoConectar);
  const adicionarBloco = useEditor((s) => s.adicionarBloco);
  const mostrarAviso = useEditor((s) => s.mostrarAviso);
  const limpar = useEditor((s) => s.limpar);

  const { screenToFlowPosition } = useReactFlow();
  const envoltorio = useRef<HTMLDivElement>(null);
  const cliques = useRef(0);

  const aoArrastarSobre = useCallback((e: DragEvent) => {
    if (!e.dataTransfer.types.includes(TIPO_ARRASTE)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const aoSoltar = useCallback(
    (e: DragEvent) => {
      const blocoId = e.dataTransfer.getData(TIPO_ARRASTE);
      if (!blocoId) return;
      e.preventDefault();
      const p = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      adicionarBloco(blocoId, { x: p.x - 48, y: p.y - 32 });
    },
    [screenToFlowPosition, adicionarBloco],
  );

  // clique (ou Enter) na barra: coloca o bloco perto do centro da tela
  const aoAdicionarPorClique = useCallback(
    (blocoId: string) => {
      const caixa = envoltorio.current?.getBoundingClientRect();
      if (!caixa) return;
      const centro = screenToFlowPosition({
        x: caixa.left + caixa.width / 2,
        y: caixa.top + caixa.height / 2 - 40,
      });
      const deslocamento = (cliques.current++ % 6) * 20;
      adicionarBloco(blocoId, {
        x: centro.x - 48 + deslocamento,
        y: centro.y - 32 + deslocamento,
      });
    },
    [screenToFlowPosition, adicionarBloco],
  );

  const ehValida = useCallback(
    (c: Parameters<typeof validarConexao>[0]) =>
      validarConexao(c, useEditor.getState().edges).ok,
    [],
  );

  // soltou o fio em cima de um pino que não aceita: explica o motivo
  const aoTerminarLigacao = useCallback(
    (_: MouseEvent | TouchEvent, estado: FinalConnectionState) => {
      const { fromHandle, toHandle } = estado;
      if (estado.isValid || !fromHandle || !toHandle) return;

      if (fromHandle.type === toHandle.type) {
        mostrarAviso('Ligue uma saída (à direita) a uma entrada (à esquerda).');
        return;
      }
      const [origem, destino] =
        fromHandle.type === 'source' ? [fromHandle, toHandle] : [toHandle, fromHandle];
      const r = validarConexao(
        {
          source: origem.nodeId,
          sourceHandle: origem.id ?? null,
          target: destino.nodeId,
          targetHandle: destino.id ?? null,
        },
        useEditor.getState().edges,
      );
      if (!r.ok) mostrarAviso(r.motivo);
    },
    [mostrarAviso],
  );

  const confirmarLimpar = () => {
    if (nodes.length === 0) return;
    if (window.confirm('Remover todos os blocos e fios?')) limpar();
  };

  return (
    <div className="editor-raiz" ref={envoltorio} onDragOver={aoArrastarSobre} onDrop={aoSoltar}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={tiposDeNo}
        edgeTypes={tiposDeFio}
        onNodesChange={aoMudarNos}
        onEdgesChange={aoMudarFios}
        onConnect={aoConectar}
        onConnectEnd={aoTerminarLigacao}
        isValidConnection={ehValida}
        connectionLineComponent={FioEmConstrucao}
        edgesReconnectable={false}
        snapToGrid
        snapGrid={[20, 20]}
        selectionOnDrag
        panOnDrag={[1, 2]}
        panActivationKeyCode="Space"
        deleteKeyCode={['Backspace', 'Delete']}
        onPaneContextMenu={(e) => e.preventDefault()}
        minZoom={0.3}
        maxZoom={2}
        colorMode="dark"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={2} color="#323649" />
        <Controls showInteractive={false} position="bottom-left" />
      </ReactFlow>

      <header className="barra-topo">
        <h1>Circuito quântico</h1>
        <div className="barra-topo-direita">
          <ul className="legenda-fios" aria-label="Tipos de fio">
            <li>
              <svg width="30" height="8" aria-hidden="true">
                <line x1="3" y1="4" x2="27" y2="4" stroke="#6ec1ff" strokeWidth="4" strokeLinecap="round" />
              </svg>
              Qubit
            </li>
            <li>
              <svg width="30" height="8" aria-hidden="true">
                <line x1="3" y1="4" x2="27" y2="4" stroke="#ffc857" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 9" />
              </svg>
              Bit clássico
            </li>
          </ul>
          <button type="button" className="botao-limpar" onClick={confirmarLimpar} disabled={nodes.length === 0}>
            Limpar tudo
          </button>
        </div>
      </header>

      {nodes.length === 0 && (
        <div className="estado-vazio">
          <p className="estado-vazio-titulo">Arraste um qubit para começar</p>
          <p>
            Pegue um bloco na barra de baixo e solte aqui. Depois puxe um fio da bolinha à direita de
            um bloco até a bolinha à esquerda de outro.
          </p>
          <p>Delete remove o que estiver selecionado.</p>
        </div>
      )}

      {aviso && (
        <div className="aviso" role="status" key={aviso.id}>
          {aviso.texto}
        </div>
      )}

      <div className="area-barra">
        <BarraBlocos toolbox={toolbox} aoAdicionar={aoAdicionarPorClique} />
      </div>
    </div>
  );
}

export function EditorBlocos(props: Props) {
  return (
    <ReactFlowProvider>
      <Quadro {...props} />
    </ReactFlowProvider>
  );
}
