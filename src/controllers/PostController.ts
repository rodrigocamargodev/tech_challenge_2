import { Request, Response } from 'express';
import { PostService } from '../services/PostService';

export class PostController {
  // Recebe a instância do serviço dinamicamente (Injeção de Dependência)
  constructor(private postService = new PostService()) {}

  // POST /posts
  criar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { titulo, conteudo, autor } = req.body;
      
      // ALTERAÇÃO INTELIGENTE: Se o middleware injetou o papel do usuário,
      // podemos usar isso para validar ou complementar a regra de negócio do autor.
      const autorFinal = autor || (req.usuarioRole === 'professor' ? 'Professor Autenticado' : 'Autor Anônimo');

      const novoPost = await this.postService.criar({ titulo, conteudo, autor: autorFinal });
      return res.status(201).json(novoPost);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  // GET /posts
  listar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const posts = await this.postService.listarTodos();
      return res.status(200).json(posts);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // GET /posts/search
  buscar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { termo } = req.query;
      if (!termo) {
        return res.status(400).json({ error: "O parâmetro de busca 'termo' é obrigatório." });
      }
      const posts = await this.postService.buscarPorTermo(termo as string);
      return res.status(200).json(posts);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // GET /posts/:id
  obterPorId = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = req.params.id as string;
      const post = await this.postService.buscarPorId(id);
      if (!post) {
        return res.status(404).json({ error: 'Postagem não encontrada.' });
      }
      return res.status(200).json(post);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  // PUT /posts/:id
  atualizar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = req.params.id as string;
      const postAtualizado = await this.postService.editar(id, req.body);
      if (!postAtualizado) {
        return res.status(404).json({ error: 'Postagem não encontrada para edição.' });
      }
      return res.status(200).json(postAtualizado);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  // DELETE /posts/:id
  remover = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = req.params.id as string;
      const postExcluido = await this.postService.excluir(id);
      if (!postExcluido) {
        return res.status(404).json({ error: 'Postagem não encontrada para exclusão.' });
      }
      return res.status(200).json({ message: 'Postagem excluída com sucesso!' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
