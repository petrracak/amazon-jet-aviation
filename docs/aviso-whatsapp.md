# Aviso de cotação no WhatsApp

Quando chega uma cotação marcada como **AOG**, o site manda uma mensagem
para o WhatsApp de quem atende. O disparo acontece depois que a resposta
já foi para o visitante: se o aviso falhar, a cotação continua gravada e
aparece no painel do mesmo jeito.

Enquanto não estiver configurado, o site funciona normal e o envio é
apenas registrado no log. Nada quebra.

## Escolha o caminho

São dois, e a escolha é de quem opera o número.

| | API oficial da Meta | Gateway por webhook |
|---|---|---|
| Risco de bloqueio do número | nenhum | existe |
| Precisa aprovar modelo de mensagem | sim | não |
| Tempo para ligar | horas | minutos |
| Custo | por conversa | mensalidade do gateway |

Para um número que é o canal comercial da empresa, o caminho oficial é o
que vale a pena. O webhook serve quando a pressa é maior que o risco, ou
quando o aviso vai para um número interno, de equipe.

## Caminho 1: API oficial da Meta

1. Em **business.facebook.com**, crie um app do tipo *Business* e adicione
   o produto **WhatsApp**.
2. Anote o **Phone number ID** e gere um **token permanente** (usuário de
   sistema com a permissão `whatsapp_business_messaging`).
3. Em **WhatsApp → Modelos de mensagem**, crie um modelo:

   - Nome: `nova_cotacao`
   - Categoria: **Utilidade**
   - Idioma: **Português (BR)**
   - Corpo, exatamente com estas seis variáveis:

     ```
     {{1}}
     Ref. {{2}}
     De: {{3}}
     Aeronave: {{4}}
     Peças: {{5}}
     Contato: {{6}}
     ```

   A ordem importa: o site preenche nessa sequência. A variável 1 chega
   como `AOG - AERONAVE NO SOLO` ou `Nova cotacao`.

4. Configure as variáveis (passo *Onde colocar*, abaixo):

   ```
   WHATSAPP_DRIVER=meta
   WHATSAPP_TOKEN=o-token-permanente
   WHATSAPP_PHONE_ID=o-phone-number-id
   WHATSAPP_DESTINOS=5511999999999,5511888888888
   ```

   `WHATSAPP_TEMPLATE` e `WHATSAPP_TEMPLATE_IDIOMA` só são necessários se
   você der outro nome ou idioma ao modelo.

## Caminho 2: gateway por webhook

Serve para Z-API, Make, n8n e qualquer serviço que aceite um POST. O site
manda, para cada destino:

```json
{ "phone": "5511999999999", "message": "texto da mensagem" }
```

```
WHATSAPP_DRIVER=webhook
WHATSAPP_WEBHOOK_URL=https://api.z-api.io/instances/SUA/token/SEU/send-text
WHATSAPP_WEBHOOK_TOKEN=seu-client-token
WHATSAPP_DESTINOS=5511999999999
```

`WHATSAPP_WEBHOOK_TOKEN` vai no cabeçalho `Client-Token`, que é o do
Z-API. Outro gateway que peça outro nome de cabeçalho: use
`WHATSAPP_WEBHOOK_HEADER` para dizer qual.

## Todas as variáveis

| Variável | Para que serve |
|---|---|
| `WHATSAPP_DESTINOS` | Números que recebem, só dígitos com DDI, separados por vírgula |
| `WHATSAPP_NOTIFICAR` | `aog` (padrão) avisa só o que é urgente; `todas` avisa toda cotação |
| `WHATSAPP_DRIVER` | `meta` ou `webhook`. Sem isso, o site deduz pelo que estiver preenchido |
| `WHATSAPP_TOKEN` | Meta: token permanente |
| `WHATSAPP_PHONE_ID` | Meta: id do número remetente |
| `WHATSAPP_TEMPLATE` | Meta: nome do modelo (padrão `nova_cotacao`) |
| `WHATSAPP_TEMPLATE_IDIOMA` | Meta: idioma do modelo (padrão `pt_BR`) |
| `WHATSAPP_WEBHOOK_URL` | Webhook: para onde vai o POST |
| `WHATSAPP_WEBHOOK_TOKEN` | Webhook: token, se o gateway pedir |
| `WHATSAPP_WEBHOOK_HEADER` | Webhook: nome do cabeçalho do token (padrão `Client-Token`) |

## Onde colocar

No `.env.local`, que já fica fora do Git, e na Vercel em **Settings →
Environment Variables**, no ambiente de produção. Depois de salvar na
Vercel, publique de novo para as variáveis valerem.

Token de WhatsApp é segredo como qualquer outro: nunca em conversa,
mensagem ou arquivo versionado.

## Como saber se está funcionando

Mande uma cotação de teste pelo site com a caixa de AOG marcada. Se o
aviso não chegar, o motivo está nos logs da função na Vercel, em
**Deployments → o deploy → Functions** — cada falha é registrada com a
resposta que a Meta ou o gateway devolveu.
