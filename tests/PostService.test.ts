import { PostService } from '../src/services/PostService';
import { PostModel } from '../src/models/Post';

jest.mock('../src/models/Post');

describe('PostService Tests', () => {
  let postService: PostService;

  beforeEach(() => {
    postService = new PostService();
    jest.clearAllMocks();
  });

  describe('criar', () => {
    it('deve criar um post com sucesso se todos os dados forem enviados', async () => {
      const dadosPost = { titulo: 'Aula 1', conteudo: 'Conteudo', autor: 'Rodrigo' };
      const saveMock = jest.fn().mockResolvedValue({ id: '123', ...dadosPost });
      (PostModel as unknown as jest.Mock).mockImplementation(() => ({
        save: saveMock
      }));

      const resultado = await postService.criar(dadosPost);
      expect(resultado).toBeDefined();
      expect(saveMock).toHaveBeenCalledTimes(1);
    });

    it('deve lançar um erro se faltar algum campo obrigatório', async () => {
      const dadosIncompletos = { titulo: '', conteudo: 'Conteudo', autor: 'Rodrigo' };
      await expect(postService.criar(dadosIncompletos)).rejects.toThrow(
        'Todos os campos (titulo, conteudo, autor) são obrigatórios.'
      );
    });
  });

  describe('listarTodos', () => {
    it('deve retornar a lista de posts ordenada por data decrescente', async () => {
      const postsMock = [{ titulo: 'Post 1' }, { titulo: 'Post 2' }];
      const sortMock = jest.fn().mockResolvedValue(postsMock);
      PostModel.find = jest.fn().mockReturnValue({ sort: sortMock });

      const resultado = await postService.listarTodos();
      expect(resultado).toEqual(postsMock);
      expect(PostModel.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('buscarPorTermo', () => {
    it('deve buscar posts por termo com regex case-insensitive', async () => {
      const postsMock = [{ titulo: 'Node.js' }];
      const sortMock = jest.fn().mockResolvedValue(postsMock);
      PostModel.find = jest.fn().mockReturnValue({ sort: sortMock });

      const resultado = await postService.buscarPorTermo('node');
      expect(resultado).toEqual(postsMock);
      expect(PostModel.find).toHaveBeenCalledWith({
        $or: [
          { titulo: { $regex: 'node', $options: 'i' } },
          { conteudo: { $regex: 'node', $options: 'i' } }
        ]
      });
    });
  });

  describe('buscarPorId', () => {
    it('deve retornar um post específico buscando pelo ID', async () => {
      const postMock = { titulo: 'Post ID' };
      PostModel.findById = jest.fn().mockResolvedValue(postMock);

      const resultado = await postService.buscarPorId('123');
      expect(resultado).toEqual(postMock);
      expect(PostModel.findById).toHaveBeenCalledWith('123');
    });
  });

  describe('editar', () => {
    it('deve atualizar os dados de um post existente', async () => {
      const postAtualizadoMock = { titulo: 'Novo Titulo' };
      PostModel.findByIdAndUpdate = jest.fn().mockResolvedValue(postAtualizadoMock);

      const resultado = await postService.editar('123', { titulo: 'Novo Titulo' });
      expect(resultado).toEqual(postAtualizadoMock);
      expect(PostModel.findByIdAndUpdate).toHaveBeenCalledWith('123', { titulo: 'Novo Titulo' }, { new: true, runValidators: true });
    });
  });

  describe('excluir', () => {
    it('deve deletar um post do banco de dados pelo ID', async () => {
      const postExcluidoMock = { titulo: 'Excluido' };
      PostModel.findByIdAndDelete = jest.fn().mockResolvedValue(postExcluidoMock);

      const resultado = await postService.excluir('123');
      expect(resultado).toEqual(postExcluidoMock);
      expect(PostModel.findByIdAndDelete).toHaveBeenCalledWith('123');
    });
  });
});