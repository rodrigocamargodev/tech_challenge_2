# 🚀 Tech Challenge - Plataforma Dinâmica de Blogging (Back-end)

### 🎓 FIAP - Full Stack Development
**Pós Tech** | **Turma:** 9FSDT | **Grupo:** 39

---

## 👥 Integrantes do Grupo 39

*   **Rodrigo Nose de Camargo**  
    📧 [rodrigocamargo.dev@gmail.com](mailto:rodrigocamargo.dev@gmail.com)  
    🔗 [GitHub Profile](https://github.com)

*   **Felipe de Oliveira de Souza**  
    🔗 [GitHub Profile](https://github.com)

---

## 📝 Descrição do Projeto

Plataforma de blogging de alta performance desenvolvida para centralizar, gerenciar e transmitir conteúdo de docentes para alunos da rede pública de ensino. Esta aplicação representa a evolução e refatoração em larga escala de uma solução anterior construída em OutSystems, agora reestruturada em ambiente Node.js com TypeScript e arquitetura em camadas para suportar um panorama de distribuição a nível nacional.

---

## 🏗️ Arquitetura do Sistema

A aplicação adota as melhores práticas de mercado através do desacoplamento de responsabilidades em camadas bem definidas e injeção de dependências:

*   **`src/app.ts`**: Configuração do servidor Express e injeção de middlewares globais.
*   **`src/server.ts`**: Inicialização do servidor HTTP e acoplamento do banco de dados.
*   **`src/routes/`**: Camada isolada de roteamento HTTP, mapeando os caminhos de acesso da API.
*   **`src/middlewares/`**: Camada de interceptação e segurança. Responsável por validar os cabeçalhos de autenticação e injetar os papéis (*roles*) antes que a requisição chegue ao controlador.
*   **`src/controllers/`**: Interceptadores de transporte HTTP. Recebem requisições, validam entradas primitivas e invocam as regras de negócio.
*   **`src/services/`**: Concentrador absoluto das **Regras de Negócio**. Isola funções complexas (validações, tratativas e automações de campos como Autores Anônimos) das dependências de rede.
*   **`src/models/`**: Definição de Schemas e Modelagem de dados baseada em interfaces tipadas do Mongoose.
*   **`src/config/`**: Controladores de conexões externas e persistência de dados.

---

## 🛠️ Tecnologias Utilizadas

*   **Runtime:** Node.js (v20+) com TypeScript (Módulos Node16).
*   **Framework HTTP:** Express.
*   **Persistência de Dados:** MongoDB (NoSQL) via Mongoose ODM.
*   **Ambiente Isolado:** Docker e Docker Compose para orquestração de microserviços.
*   **Suíte de Testes:** Jest e Supertest para testes unitários e de integração HTTP.
*   **Automação e CI/CD:** GitHub Actions.

---

## 🚦 Guia de Execução

### Pré-requisitos
*   Docker Desktop instalado e ativo em segundo plano.

### 🔌 Inicialização via Docker Compose
Para compilar o código TypeScript automaticamente em um estágio de compilação otimizado (*Multi-stage Build*) e subir os serviços integrados (Banco + API) com apenas um comando, execute na raiz do projeto:

```bash
docker compose up --build
```

A API estará disponível para receber requisições no endereço: **`http://localhost:3000`**

---

## 🛡️ Sistema de Autenticação e Controle de Acesso

Atendendo às diretrizes de segurança, a aplicação valida o acesso por meio de tokens transmitidos no cabeçalho HTTP (`Authorization Header`). Foram definidos dois níveis de privilégio estáticos:

*   **Token de Professor:** `professor123` (Permissão total: Criar, Ler, Editar e Excluir)
*   **Token de Aluno:** `aluno123` (Permissão restrita: Leitura de posts e Busca por termo)

### 🧠 Regra de Negócio Inteligente de Autoria
Caso um docente envie uma requisição de criação de postagem (`POST /posts`) omitindo o campo `autor` no corpo do JSON, o sistema utiliza o contexto da requisição autenticada pelo middleware para assinar a postagem automaticamente como `"Professor Autenticado"`. Para requisições gerais sem papéis definidos que alcancem o fluxo, o sistema assina como `"Autor Anônimo"`.

---

## 🛣️ Guia de Uso das APIs (Endpoints REST)

Todas as requisições devem incluir a chave `Authorization` no cabeçalho (*Headers*).

### 📌 1. Criar Nova Postagem (Exclusivo Docentes)
*   **Rota:** `POST /posts`
*   **Header:** `Authorization: professor123`
*   **Corpo da Requisição (JSON):**
    ```json
    {
      "titulo": "Introdução ao Node.js com TypeScript",
      "conteudo": "Nesta aula compreenderemos os pilares fundamentais do back-end...",
      "autor": "Prof. Rodrigo"
    }
    ```
*   **Resposta de Sucesso:** Status `201 Created` contendo o objeto persistido.

### 📌 2. Listar Todas as Postagens (Alunos e Professores)
*   **Rota:** `GET /posts`
*   **Header:** `Authorization: aluno123` ou `professor123`
*   **Resposta de Sucesso:** Status `200 OK` retornando um Array de postagens ordenadas de forma decrescente por data.

### 📌 3. Buscar Postagens por Palavra-Chave (Geral)
*   **Rota:** `GET /posts/search?termo={palavra}`
*   **Header:** `Authorization: aluno123`
*   **Exemplo:** `GET /posts/search?termo=TypeScript`
*   **Resposta de Sucesso:** Status `200 OK` contendo postagens correspondentes (case-insensitive).

### 📌 4. Leitura de Postagem Específica (Alunos e Professores)
*   **Rota:** `GET /posts/:id`
*   **Header:** `Authorization: aluno123`
*   **Resposta de Sucesso:** Status `200 OK` retornando a publicação associada ao ID informado.

### 📌 5. Edição de Postagem Existente (Exclusivo Professores)
*   **Rota:** `PUT /posts/:id`
*   **Header:** `Authorization: professor123`
*   **Corpo da Requisição (JSON):** Campos para atualização (Ex: `{"titulo": "Título Atualizado"}`).
*   **Resposta de Sucesso:** Status `200 OK` com os novos dados modificados.

### 📌 6. Exclusão de Postagem (Exclusivo Docentes)
*   **Rota:** `DELETE /posts/:id`
*   **Header:** `Authorization: professor123`
*   **Resposta de Sucesso:** Status `200 OK` confirmando a deleção del registro.

---

## 🧪 Suíte de Testes e Cobertura de Código

Buscando a máxima stabileza, a aplicação foi blindada com **100% de Cobertura de Testes Unitários e de Integração** (Statements, Branches, Functions e Lines), superando amplamente os 20% mínimos estipulados no briefing do desafio.

Para executar os testes e verificar os indicadores de cobertura localmente:
```bash
npm run test
```

---

## 🤖 Automação e Integração Contínua (CI)

O repositório possui um workflow ativo do **GitHub Actions** (`.github/workflows/ci.yml`). Toda modificação enviada para o repositório passa por uma esteira de checagem automatizada na nuvem que valida a instalação limpa (`npm ci`), a compilação rigorosa do TypeScript (`npm run build`) e bloqueia a integração caso a cobertura de testes caia abaixo da meta de 100%.

---

## 👥 Relato de Experiências e Desafios da Equipe

### 🔄 1. A Transição da Baixa Plataforma (OutSystems) para Código Puro
O primeiro grande choque técnico da equipe foi abandonar o ambiente visual e automatizado do OutSystems para assumir o controle total do Back-end escrevendo código do zero em Node.js. A flexibilidade adquirida foi incomparável, e o uso do **TypeScript** provou-se essencial para essa transição, mitigando erros de escrita de código em tempo de desenvolvimento.

### 🏗️ 2. O Desafio do Desacoplamento e Arquitetura em Camadas
A decisão de estruturar a aplicação com a camada de **Services** foi o grande divisor de águas do projeto. Separar o transporte HTTP (Controllers), as travas de segurança (Middlewares) e a real inteligência dos dados (Services) impediu a criação de controladores inchados e permitiu o isolamento completo do código para testes.

### 🧪 3. A Escalada Rumo aos 100% de Cobertura com Jest
Alcançar os 100% de cobertura exigiu soluções avançadas de engenharia de testes. Enfrentamos bloqueios complexos ao mockar métodos encadeados do Mongoose e ao testar as condicionais lógicas de atribuição de Autores do Controller. A resolução veio através de um mock cirúrgico do Middleware de autenticação na suíte de testes do controlador, permitindo isolar os fluxos HTTP com precisão.

### 🐳 4. Consistência de Ambiente com Docker e Docker Compose
O Docker eliminou ruídos de compatibilidade entre as máquinas dos integrantes da equipe. O principal desafio superado foi orquestrar as dependências de build com módulos `Node16` dentro do container Alpine, solucionado por meio de estratégias de limpeza de caches globais de compilação (`docker builder prune`) e do arquivo de exclusão `.dockerignore`.
