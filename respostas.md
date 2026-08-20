# Respostas da Atividade

## Parte 1 - Revisão Técnica
### Status Codes Usados no Servidor Antigo
- Na versão anterior, o servidor usava predominantemente `200 OK` e `404 Not Found`. Faltavam tratamentos adequados para `201 Created` no POST e a separação de `400 Bad Request` vs `500 Internal Server Error`.

### Content-Type
- O cabeçalho `Content-Type` indica ao cliente o formato dos dados retornados na resposta.
- Ao usar `res.send("<h1>...</h1>")`, o Express define automaticamente `Content-Type: text/html`.
- Diferença prática: `res.json()` define `Content-Type: application/json` e serializa o objeto. `res.send()` analisa o tipo do dado e envia como HTML/Texto/Buffer conforme o caso.

---

## Parte 5 - Questões Teóricas

1. **Status Codes HTTP mais comuns:**
   - `200 OK`: Requisição processada com sucesso (ex: buscar lista de itens).
   - `201 Created`: Novo recurso criado com sucesso (ex: cadastrar nova música via POST).
   - `400 Bad Request`: Dados enviados pelo cliente são inválidos ou incompletos (ex: faltam campos obrigatórios no JSON).
   - `404 Not Found`: Recurso não foi encontrado no servidor (ex: ID inexistente na URL).
   - `500 Internal Server Error`: Erro inesperado no código do servidor.

2. **Content-Type: application/json vs text/html:**
   - `application/json` informa que o corpo da resposta é uma estrutura JSON tratável programmaticamente.
   - `text/html` indica que o corpo contém código HTML a ser renderizado na tela.
   - O cliente precisa disso para saber como interpretar/renderizar a resposta.

3. **DAO e Persistência:**
   - O padrão DAO (Data Access Object) isola a regra de negócio/rotas da forma como os dados são salvos/buscados.
   - Resolve o acoplamento entre rotas e estruturas de armazenamento.
   - Ao reiniciar o servidor, os dados em memória desaparecem. Para sobreviverem, alteraríamos a implementação dos métodos do DAO para salvar em um banco de dados sem alterar as rotas.

4. **Singleton:**
   - Exportando uma instância (`new MusicaDAO()`), garantimos uma única fonte de dados compartilhada na aplicação toda.
   - Se exportássemos a classe e cada arquivo criasse um `new MusicaDAO()`, teríamos listas de músicas separadas e dessincronizadas em cada arquivo.

5. **PUT vs POST:**
   - `POST` é usado para criar novos recursos. `PUT` é usado para substituir totalmente um recurso existente.
   - Para alterar apenas um campo específico (ex: apenas artista), o verbo HTTP semanticamente mais adequado é o `PATCH`.

6. **Erro do cliente vs erro do servidor:**
   - JSON mal-formado é responsabilidade do cliente (família 4xx - 400 Bad Request).
   - A família 5xx indica falha interna na lógica do servidor. O middleware verifica `err.status === 400` atribuído pelo parser do Express para responder 400 em vez de 500.

7. **Front e API:**
   - Quando o usuário escolheu a música, o GET `/api/musicas/:id` já retornou a música completa com todas as suas partes. Portanto, os dados já estavam guardados em memória no navegador (na variável `musicaAtual`).