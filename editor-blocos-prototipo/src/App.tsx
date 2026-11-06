import { EditorBlocos } from './editor/EditorBlocos';

export default function App() {
  // Para limitar os blocos de uma lição, passe a toolbox:
  // <EditorBlocos toolbox={['qubit.create', 'gate.h', 'measure']} />
  return (
    <main className="h-full">
      <EditorBlocos />
    </main>
  );
}
