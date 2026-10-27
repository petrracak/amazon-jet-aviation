# Acesso ao painel

## Como alguém entra

O painel fica em `/admin`. Cada pessoa entra com e-mail e senha, e troca a
própria senha em **Minha conta**. Enquanto não trocar, um aviso aparece no
topo de todas as telas.

Quem esquecer a senha não depende de e-mail: um administrador abre
**Equipe**, clica em *Definir senha* na linha da pessoa e passa a nova.

## Como criar acesso para mais gente

Em **Equipe**, no formulário *Criar acesso*: nome, e-mail, nível e uma senha
provisória. A pessoa entra com ela e troca depois.

Níveis:

| Nível | O que pode |
|---|---|
| Editor | Cotações e blog |
| Administrador | Tudo, mais configurações e equipe |

A primeira conta criada no banco vira administradora automaticamente, por
um gatilho. Da segunda em diante todas nascem como editor, e promover é ato
explícito de um administrador.

## A chave de serviço

Criar conta de outra pessoa e definir a senha dela são as duas únicas coisas
que o Supabase não deixa fazer com a chave pública. Para elas o painel usa a
chave de serviço, que precisa ser configurada uma vez.

Sem ela, **Equipe** continua listando as pessoas, mudando nível e suspendendo
acesso; só o formulário de criar conta fica indisponível, com um aviso.

### Como configurar

1. No painel do Supabase, abra **Project Settings → API Keys**.
2. Copie a chave **`service_role`**. Ela é secreta: dá acesso total ao banco,
   ignorando todas as regras de segurança.
3. No projeto, acrescente a linha ao `.env.local`, que já fica fora do Git:

   ```
   SUPABASE_SERVICE_ROLE_KEY=cole-a-chave-aqui
   ```

4. Na Vercel, acrescente a mesma variável em **Settings → Environment
   Variables**, no ambiente de produção, e publique de novo.

Nunca cole essa chave em conversa, mensagem ou arquivo versionado. Ela só
existe no `.env.local` e na Vercel. O arquivo `src/lib/supabase/admin.ts`
tem `server-only` no topo justamente para o build quebrar se alguém tentar
usá-la no navegador.
