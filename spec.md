# Spec: Landing Page Clínicas Premium

## 1. Contexto
Landing page de página única para tráfego pago direto (Meta Ads e Google Ads). Objetivo: converter visitante em lead qualificado, levando a agendar um diagnóstico gratuito. A página precisa filtrar curiosos, não só captar volume.

Cliente: Clínicas Premium, agência que cuida do comercial, posicionamento e anúncios de médicos e clínicas particulares. Empresa do Grupo X Performance.

Público: donos de clínica e médicos com consultório próprio, hoje reféns de convênio, indicação ou boca a boca, buscando previsibilidade de faturamento com pacientes particulares. Público cético com agência de marketing tradicional, já ouviu promessa vazia antes.

Sensação que a página precisa passar: clínica premium, exclusiva, confiável, comunicação segura e sem gritaria. Evitar aparência de template genérico: composições com intenção, hierarquia clara, nada decorativo sem propósito.

A protagonista da página é a Clínicas Premium. O Sistema C.A.V.A é apenas o método que ela usa, então visualmente ele é um elemento de apoio, não a estrela.

## 2. Fonte da copy
A copy final aprovada está em `copy-lp-clinicas-premium.md`, na raiz do projeto. É a fonte de verdade para todo texto da página. Use exatamente como está, sem resumir, reescrever ou acrescentar texto.

Como ler o arquivo:
- O emoji 🔘 marca onde entra um botão. Renderize como botão, nunca como emoji.
- Linhas `[PLACEHOLDER: ...]` são instruções, nunca renderize esse texto literalmente na página.
- A linha "A infraestrutura invisível que sustenta a sua agenda." aparece com `>` no arquivo, mas na página é texto comum (ver seção 6).
- Nomes de etapas com parênteses, como "O Ímã (Atração)", são apresentados sem parênteses na página (ver seção 6).

Únicas exceções para texto fora da copy: rótulos curtos do menu de navegação (nomes das seções), textos de interface como aria-labels, e o conteúdo temporário do bloco do consultor. Sem selos, sem microcopy embaixo dos botões, sem P.S., sem preços ou planos.

## 3. Estrutura (ordem fixa)
Cabeçalho, e depois os blocos:
1. Hero
2. Depoimento em vídeo do case
3. Exploração da dor
4. Solução
5. Como funciona
6. Com x sem Clínicas Premium
7. Conheça o consultor
8. CTA objetiva
9. Quebra de objeções / FAQ
10. Resumo + CTA final
11. Rodapé

A ordem é fixa. Layout e composição dentro de cada bloco são livres, exceto onde as seções 5 e 6 dão uma direção específica.

## 4. Identidade visual
- Fundo: `#043034`
- Destaque: `#CEC293`
- Tipografia: fonte nativa do sistema, sem carregar web font: `font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;`
- Peso máximo: semi-bold (600). Nada de bold, extra-bold ou black em nenhum texto, inclusive títulos grandes. Atenção aos pesos padrão do navegador em `strong`, `b`, `th` e títulos, que precisam ser sobrescritos. O público é médico e a comunicação não pode parecer agressiva.
- Paleta de apoio (tons derivados do fundo e do destaque, neutros claros para texto) livre, desde que o contraste seja bom.
- Movimento: o hero não tem nenhuma animação nem elemento decorativo em movimento. No restante da página, se houver movimento, que seja sutil, e respeitando `prefers-reduced-motion`.

## 5. Padrões fixos de UI
**Cabeçalho:** nav flutuante com bordas totalmente arredondadas (pill), com espaço em volta, no estilo de referência: logo à esquerda e links de âncora para as seções da própria página. Não tem nenhum botão no cabeçalho. Sem botão à direita, o equilíbrio visual da barra fica a seu critério. Precisa funcionar bem no mobile.

**Hero:** título e subtítulo centralizados, com o botão logo abaixo, também centralizado.

**Botão:** existe um único estilo de botão na página inteira, em formato pill (bordas totalmente arredondadas), preenchido na cor de destaque, com ícone de seta. Como só existe um CTA, não há variação secundária.

**CTAs:** toda seção principal termina com o mesmo botão, mesmo texto ("Agendar diagnóstico gratuito") e mesmo estilo, exatamente nos pontos marcados com 🔘 na copy. Sem botão no cabeçalho e sem botão no rodapé.

**Listas com divisórias:** quando uma lista usa linhas divisórias entre itens, as linhas ficam só entre um item e o seguinte. Nenhuma linha antes do primeiro item nem depois do último. Vale para toda a página.

## 6. Direção de layout de blocos específicos
- **Depoimento em vídeo:** player de vídeo real, pronto para receber o arquivo depois, com estado vazio elegante enquanto o arquivo não existe. Abaixo, só o nome e a especialidade como legenda. Sem citação escrita.
- **Exploração da dor:** a lista de dores segue a regra de divisórias da seção 5. O trecho "Esforço máximo, retorno mínimo." com o texto de apoio é um momento de destaque: dê a ele um layout marcante, podendo virar uma seção própria. Evitar o padrão simples de título grande de um lado, parágrafo pequeno do outro e uma linha fina em cima.
- **Solução:** os 4 itens do C.A.V.A precisam de um layout distintivo e memorável que aproveite as letras da sigla. Evitar 4 colunas iguais com letra grande e divisórias verticais. Lembrar que é elemento de apoio, não protagonista.
- **Como funciona:** as 4 etapas formam um funil de verdade, visualmente afunilando conforme descem, e não uma timeline vertical com círculos. Cada etapa mostra número, nome e descrição. O rótulo que na copy está entre parênteses (Atração, SDR, Qualificação, Agendamento) aparece como um elemento separado, sem parênteses em nenhum lugar. A frase "A infraestrutura invisível que sustenta a sua agenda." é texto comum de apoio ao título, sem destaque de citação e sem barra lateral.
- **Com x sem Clínicas Premium:** duas listas simples, "Sem o Clínicas Premium" e "Com o Clínicas Premium". Sem tabela e sem layout complexo. Pode ficar lado a lado no desktop e empilhado no mobile, com contraste visual claro entre as duas.
- **Conheça o consultor:** estrutura com foto, nome, cargo, texto curto de autoridade e um recado em primeira pessoa, com conteúdo temporário fácil de trocar e comentários no código indicando o que substituir.
- **CTA objetiva:** garantia de liberdade e escassez real em destaque, antes do botão.
- **FAQ:** todas as perguntas da copy, acessíveis pelo teclado. Formato expansível ou lista aberta, a seu critério.
- **Rodapé:** simples, apenas a linha da copy.

## 7. Logo
O arquivo da logo em PNG está na raiz do projeto.
- Converter para WebP com qualidade alta, mantendo nitidez e transparência.
- Guardar o WebP na pasta de assets e usar no cabeçalho, com largura e altura definidas para evitar salto de layout.
- Depois de confirmar que o WebP foi gerado e carrega na página, excluir o PNG original da raiz.
- Se faltar alguma ferramenta para a conversão, instalar o que for necessário.

## 8. Requisitos funcionais
- Página única, sem roteamento, com `lang="pt-BR"`.
- Todos os botões apontam para um único ponto de configuração do destino do CTA. Destino ainda não definido (Calendly, formulário, WhatsApp ou outro). Deixar tudo pronto e perguntar ao final.
- Espaço preparado para Meta Pixel e Google Ads/GA4, placeholder de ID é suficiente.
- Open Graph e Twitter Card configurados, para o link ter preview correto quando usado em anúncio.

## 9. Requisitos não-funcionais
- Mobile-first. A maior parte do tráfego pago vem de celular.
- Performance: mirar Core Web Vitals no verde (LCP, CLS, INP). Página lenta prejudica Quality Score de anúncio e conversão.
- Acessibilidade AA, incluindo contraste entre `#043034` e `#CEC293` e nas demais combinações de texto, foco de teclado visível, headings semânticos.
- Sem CMS e sem backend além do necessário para captura do lead.

## 10. Stack e arquivos
HTML, CSS e JS puro, sem framework pesado.

Arquivos: `index.html`, `style.css` e `script.js`, mais a pasta de assets (logo em WebP e, depois, vídeo e imagens). Outros arquivos apenas se houver necessidade real.

Regra obrigatória: nada de CSS ou JS inline dentro do HTML. Sem tags `<style>`, sem atributo `style=""`, sem `<script>` com código embutido, só a tag apontando para o arquivo externo.

## 11. Fora de escopo
Blog, área de membros, múltiplas páginas, internacionalização, dashboard administrativo, planos e preços.
