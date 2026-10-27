/**
 * Importa para o Supabase os textos que vieram do WordPress.
 *
 * Fala direto com a API REST, com fetch e nada mais: entra como uma conta
 * de equipe, então vale a mesma RLS do painel e nenhuma chave de serviço
 * precisa existir.
 *
 * Uso:
 *   AJA_EMAIL=... AJA_SENHA=... node scripts/importar-posts.mjs
 *
 * Sem as variáveis, lê as credenciais de ACESSO-PAINEL.local.md.
 */
import { readFileSync } from 'node:fs';

const RAIZ = process.argv[2] ?? process.cwd();

function doEnvLocal(nome) {
  const texto = readFileSync(`${RAIZ}/.env.local`, 'utf8');
  return texto.match(new RegExp(`^${nome}=(.*)$`, 'm'))?.[1]?.trim();
}

const URL_BASE = doEnvLocal('NEXT_PUBLIC_SUPABASE_URL');
const CHAVE = doEnvLocal('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');

let email = process.env.AJA_EMAIL;
let senha = process.env.AJA_SENHA;
if (!email || !senha) {
  const acesso = readFileSync(`${RAIZ}/ACESSO-PAINEL.local.md`, 'utf8');
  email = acesso.match(/E-mail:\s*(\S+)/)[1];
  senha = acesso.match(/Senha:\s*(\S+)/)[1];
}

async function api(caminho, opcoes = {}, token) {
  const r = await fetch(`${URL_BASE}${caminho}`, {
    ...opcoes,
    headers: {
      apikey: CHAVE,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opcoes.headers,
    },
  });
  const texto = await r.text();
  if (!r.ok) throw new Error(`${caminho} ${r.status}: ${texto.slice(0, 300)}`);
  return texto ? JSON.parse(texto) : null;
}

const sessao = await api('/auth/v1/token?grant_type=password', {
  method: 'POST',
  body: JSON.stringify({ email, password: senha }),
});
const token = sessao.access_token;

const categorias = await api('/rest/v1/categories?select=id,slug', {}, token);
const porSlug = new Map(categorias.map((c) => [c.slug, c.id]));

const posts = JSON.parse(
  readFileSync(`${RAIZ}/content/seed/posts-convertidos.json`, 'utf8'),
);

const corpo = posts.map((p) => ({
  slug: p.slug,
  locale: 'pt',
  title: p.title,
  excerpt: p.excerpt,
  content: p.content,
  cover_image_url: p.cover,
  category_id: porSlug.get(p.category) ?? null,
  status: 'published',
  published_at: p.published_at,
  legacy_path: p.legacy_path,
  seo_description: p.excerpt,
}));

await api(
  '/rest/v1/posts?on_conflict=locale,slug',
  {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(corpo),
  },
  token,
);

const conferencia = await api(
  '/rest/v1/posts?select=slug,title,status&order=published_at.desc',
  {},
  token,
);
for (const p of conferencia) console.log(`${p.status}  ${p.slug}`);
console.log(`\n${conferencia.length} textos no banco.`);
