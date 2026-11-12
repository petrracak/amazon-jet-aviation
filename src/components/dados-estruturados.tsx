/**
 * Injeta um bloco JSON-LD.
 *
 * Fica num componente só para o escape ser feito sempre do mesmo jeito: o
 * `<` precisa ser escapado dentro de `<script>`, senão um texto vindo do
 * banco com uma tag dentro encerraria o bloco e quebraria a página.
 */
export function DadosEstruturados({ dados }: { dados: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(dados).replace(/</g, '\\u003c'),
      }}
    />
  );
}
