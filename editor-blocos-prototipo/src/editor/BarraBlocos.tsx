import type { CSSProperties, KeyboardEvent } from 'react';
import { BLOCOS, CATEGORIAS, ORDEM_CATEGORIAS } from './blocos';

export const TIPO_ARRASTE = 'application/x-bloco-quantico';

interface Props {
  /** ids liberados pela lição; sem valor, todos os blocos aparecem */
  toolbox?: string[];
  aoAdicionar: (blocoId: string) => void;
}

export function BarraBlocos({ toolbox, aoAdicionar }: Props) {
  const grupos = ORDEM_CATEGORIAS.map((categoria) => ({
    categoria,
    blocos: BLOCOS.filter(
      (b) => b.categoria === categoria && (!toolbox || toolbox.includes(b.id)),
    ),
  })).filter((g) => g.blocos.length > 0);

  const aoTeclar = (e: KeyboardEvent, blocoId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      aoAdicionar(blocoId);
    }
  };

  return (
    <nav className="dock" aria-label="Blocos disponíveis">
      {grupos.map(({ categoria, blocos }) => {
        const cat = CATEGORIAS[categoria];
        return (
          <div className="dock-grupo" key={categoria}>
            <div className="dock-fichas">
              {blocos.map((b) => (
                // div com role="button": o Firefox não inicia arraste em <button>
                <div
                  key={b.id}
                  role="button"
                  tabIndex={0}
                  draggable
                  className="ficha"
                  title={b.titulo}
                  style={{ '--cor': cat.cor, '--sombra': cat.sombra } as CSSProperties}
                  onDragStart={(e) => {
                    e.dataTransfer.setData(TIPO_ARRASTE, b.id);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => aoAdicionar(b.id)}
                  onKeyDown={(e) => aoTeclar(e, b.id)}
                >
                  {b.nome}
                </div>
              ))}
            </div>
            <span className="dock-legenda">{cat.nome}</span>
          </div>
        );
      })}
    </nav>
  );
}
