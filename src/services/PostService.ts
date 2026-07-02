import { PostModel, IPost } from '../models/Post';

export class PostService {
  async criar(dados: { titulo: string; conteudo: string; autor: string }): Promise<IPost> {
    if (!dados.titulo || !dados.conteudo || !dados.autor) {
      throw new Error('Todos os campos (titulo, conteudo, autor) são obrigatórios.');
    }
    const novoPost = new PostModel(dados);
    return await novoPost.save();
  }

  async listarTodos(): Promise<IPost[]> {
    return await PostModel.find().sort({ criadoEm: -1 });
  }

  // NOVO: Busca por termo (case-insensitive) no título ou conteúdo
  async buscarPorTermo(termo: string): Promise<IPost[]> {
    return await PostModel.find({
      $or: [
        { titulo: { $regex: termo, $options: 'i' } },
        { conteudo: { $regex: termo, $options: 'i' } }
      ]
    }).sort({ criadoEm: -1 });
  }

  // NOVO: Buscar um post específico pelo ID
  async buscarPorId(id: string): Promise<IPost | null> {
    return await PostModel.findById(id);
  }

  // NOVO: Editar uma postagem existente
  async editar(id: string, dados: { titulo?: string; conteudo?: string; autor?: string }): Promise<IPost | null> {
    return await PostModel.findByIdAndUpdate(id, dados, { new: true, runValidators: true });
  }

  // NOVO: Excluir uma postagem
  async excluir(id: string): Promise<IPost | null> {
    return await PostModel.findByIdAndDelete(id);
  }
}