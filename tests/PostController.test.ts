import request from 'supertest';
import app from '../src/app';
import { PostService } from '../src/services/PostService';

// Mock estratégico do middleware de autenticação para isolar e testar o Controller.
// Ele injeta o req.usuarioRole baseado no token enviado, permitindo testar as ramificações de autor.
jest.mock('../src/middlewares/authMiddleware', () => ({
  autenticarUnico: (roleObrigatoria: string) => (req: any, res: any, next: any) => {
    const token = req.headers.authorization;
    if (token === 'professor123') {
      req.usuarioRole = 'professor';
    } else if (token === 'aluno123') {
      req.usuarioRole = 'aluno';
    } else {
      req.usuarioRole = undefined; // Força o cenário onde não há role definida para testar o Autor Anônimo
    }
    return next(); // Sempre libera a requisição para o Controller avançar nos testes de cobertura
  }
}));

describe('PostController REST Endpoints (Autenticados)', () => {
  const tokenProf = 'professor123';
  const tokenAluno = 'aluno123';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TOKEN_PROFESSOR = tokenProf;
    process.env.TOKEN_ALUNO = tokenAluno;
  });

  describe('POST /posts', () => {
    it('deve retornar status 201 ao criar um post com sucesso se for professor', async () => {
      const mockPost = { id: '1', titulo: 'Teste', conteudo: 'Conteudo', autor: 'Autor' };
      jest.spyOn(PostService.prototype, 'criar').mockResolvedValue(mockPost as any);

      const resposta = await request(app)
        .post('/posts')
        .set('Authorization', tokenProf) // Autenticação injetada
        .send(mockPost);

      expect(resposta.status).toBe(201);
      expect(resposta.body).toEqual(mockPost);
    });

    it('deve retornar status 400 se a service disparar um erro', async () => {
      jest.spyOn(PostService.prototype, 'criar').mockRejectedValue(new Error('Erro de validação'));

      const resposta = await request(app)
        .post('/posts')
        .set('Authorization', tokenProf) // Autenticação injetada
        .send({});

      expect(resposta.status).toBe(400);
      expect(resposta.body).toEqual({ error: 'Erro de validação' });
    });

    it('deve usar "Professor Autenticado" se o autor não for enviado no corpo e o usuário for professor', async () => {
      const postSemAutor = { titulo: 'Teste', conteudo: 'Conteudo' };
      const mockRetorno = { id: '1', ...postSemAutor, autor: 'Professor Autenticado' };
      jest.spyOn(PostService.prototype, 'criar').mockResolvedValue(mockRetorno as any);

      const resposta = await request(app)
        .post('/posts')
        .set('Authorization', tokenProf)
        .send(postSemAutor);

      expect(resposta.status).toBe(201);
      expect(resposta.body.autor).toBe('Professor Autenticado');
    });

    it('deve usar "Autor Anônimo" se o autor não for enviado no corpo e o papel não for professor', async () => {
      const postSemAutor = { titulo: 'Teste', conteudo: 'Conteudo' };
      const mockRetorno = { id: '1', ...postSemAutor, autor: 'Autor Anônimo' };
      jest.spyOn(PostService.prototype, 'criar').mockResolvedValue(mockRetorno as any);

      // O mock do middleware aceitará o token e injetará req.usuarioRole como undefined,
      // fazendo o controller adotar a ramificação condicional de "Autor Anônimo".
      const resposta = await request(app)
        .post('/posts')
        .set('Authorization', 'forcar_role_undefined') 
        .send(postSemAutor);

      expect(resposta.status).toBe(201);
      expect(resposta.body.autor).toBe('Autor Anônimo');
    });
  });

  describe('GET /posts', () => {
    it('deve retornar lista de posts e status 200 para aluno ou professor', async () => {
      jest.spyOn(PostService.prototype, 'listarTodos').mockResolvedValue([]);

      const resposta = await request(app)
        .get('/posts')
        .set('Authorization', tokenAluno); // Autenticação injetada

      expect(resposta.status).toBe(200);
      expect(resposta.body).toEqual([]);
    });

    it('deve retornar status 500 se houver falha interna', async () => {
      jest.spyOn(PostService.prototype, 'listarTodos').mockRejectedValue(new Error('Falha no banco'));

      const resposta = await request(app)
        .get('/posts')
        .set('Authorization', tokenAluno); // Autenticação injetada

      expect(resposta.status).toBe(500);
      expect(resposta.body).toEqual({ error: 'Falha no banco' });
    });
  });

  describe('GET /posts/search', () => {
    it('deve buscar posts informando o termo de busca', async () => {
      jest.spyOn(PostService.prototype, 'buscarPorTermo').mockResolvedValue([]);

      const resposta = await request(app)
        .get('/posts/search?termo=Node')
        .set('Authorization', tokenAluno); // Autenticação injetada

      expect(resposta.status).toBe(200);
      expect(resposta.body).toEqual([]);
    });

    it('deve retornar status 400 se o termo de busca não for enviado', async () => {
      const resposta = await request(app)
        .get('/posts/search')
        .set('Authorization', tokenAluno); // Autenticação injetada

      expect(resposta.status).toBe(400);
      expect(resposta.body).toEqual({ error: "O parâmetro de busca 'termo' é obrigatório." });
    });

    it('deve retornar status 500 se houver falha na busca', async () => {
      jest.spyOn(PostService.prototype, 'buscarPorTermo').mockRejectedValue(new Error('Erro busca'));
      
      const resposta = await request(app)
        .get('/posts/search?termo=Node')
        .set('Authorization', tokenAluno); // Autenticação injetada

      expect(resposta.status).toBe(500);
      expect(resposta.body).toEqual({ error: 'Erro busca' });
    });
  });

  describe('GET /posts/:id', () => {
    it('deve retornar 200 se o post for localizado', async () => {
      const mockPost = { titulo: 'Achou' };
      jest.spyOn(PostService.prototype, 'buscarPorId').mockResolvedValue(mockPost as any);

      const resposta = await request(app)
        .get('/posts/123')
        .set('Authorization', tokenAluno); // Autenticação injetada

      expect(resposta.status).toBe(200);
      expect(resposta.body).toEqual(mockPost);
    });

    it('deve retornar 404 se o post não existir', async () => {
      jest.spyOn(PostService.prototype, 'buscarPorId').mockResolvedValue(null);

      const resposta = await request(app)
        .get('/posts/999')
        .set('Authorization', tokenAluno); // Autenticação injetada

      expect(resposta.status).toBe(404);
      expect(resposta.body).toEqual({ error: 'Postagem não encontrada.' });
    });

    it('deve retornar status 500 se falhar a busca por ID', async () => {
      jest.spyOn(PostService.prototype, 'buscarPorId').mockRejectedValue(new Error('Erro ID'));
      
      const resposta = await request(app)
        .get('/posts/123')
        .set('Authorization', tokenAluno); // Autenticação injetada

      expect(resposta.status).toBe(500);
      expect(resposta.body).toEqual({ error: 'Erro ID' });
    });
  });

  describe('PUT /posts/:id', () => {
    it('deve retornar 200 se atualizar com sucesso por um professor', async () => {
      const mockPost = { titulo: 'Editado' };
      jest.spyOn(PostService.prototype, 'editar').mockResolvedValue(mockPost as any);

      const resposta = await request(app)
        .put('/posts/123')
        .set('Authorization', tokenProf) // Autenticação injetada
        .send({ titulo: 'Novo' });

      expect(resposta.status).toBe(200);
      expect(resposta.body).toEqual(mockPost);
    });

    it('deve retornar 404 se tentar editar um post inexistente', async () => {
      jest.spyOn(PostService.prototype, 'editar').mockResolvedValue(null);

      const resposta = await request(app)
        .put('/posts/999')
        .set('Authorization', tokenProf) // Autenticação injetada
        .send({ titulo: 'Novo' });

      expect(resposta.status).toBe(404);
      expect(resposta.body).toEqual({ error: 'Postagem não encontrada para edição.' });
    });

    it('deve retornar status 400 se a edição falhar por validação', async () => {
      jest.spyOn(PostService.prototype, 'editar').mockRejectedValue(new Error('Erro validação PUT'));
      
      const resposta = await request(app)
        .put('/posts/123')
        .set('Authorization', tokenProf) // Autenticação injetada
        .send({ titulo: 'Novo' });

      expect(resposta.status).toBe(400);
      expect(resposta.body).toEqual({ error: 'Erro validação PUT' });
    });
  });

  describe('DELETE /posts/:id', () => {
    it('deve deletar e retornar status 200 se executado por professor', async () => {
      jest.spyOn(PostService.prototype, 'excluir').mockResolvedValue({ id: '123' } as any);

      const resposta = await request(app)
        .delete('/posts/123')
        .set('Authorization', tokenProf); // Autenticação injetada

      expect(resposta.status).toBe(200);
      expect(resposta.body).toEqual({ message: 'Postagem excluída com sucesso!' });
    });

    it('deve retornar 404 se tentar excluir um post que não existe', async () => {
      jest.spyOn(PostService.prototype, 'excluir').mockResolvedValue(null);

      const resposta = await request(app)
        .delete('/posts/999')
        .set('Authorization', tokenProf); // Autenticação injetada

      expect(resposta.status).toBe(404);
      expect(resposta.body).toEqual({ error: 'Postagem não encontrada para exclusão.' });
    });

    it('deve retornar status 500 se a exclusão falhar internamente', async () => {
      jest.spyOn(PostService.prototype, 'excluir').mockRejectedValue(new Error('Erro DELETE'));
      
      const resposta = await request(app)
        .delete('/posts/123')
        .set('Authorization', tokenProf); // Autenticação injetada

      expect(resposta.status).toBe(500);
      expect(resposta.body).toEqual({ error: 'Erro DELETE' });
    });
  });
});