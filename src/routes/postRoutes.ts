import { Router } from 'express';
import { PostController } from '../controllers/PostController';
import { autenticarUnico } from '../middlewares/authMiddleware';

const router = Router();
const postController = new PostController();

// Rotas protegidas para Professores/Docentes (Criação, Edição e Exclusão)
router.post('/posts', autenticarUnico('professor'), postController.criar);
router.put('/posts/:id', autenticarUnico('professor'), postController.atualizar);
router.delete('/posts/:id', autenticarUnico('professor'), postController.remover);

// Rotas protegidas para Alunos (Leitura e Busca) - Professores também acessam
router.get('/posts', autenticarUnico('aluno'), postController.listar);
router.get('/posts/search', autenticarUnico('aluno'), postController.buscar);
router.get('/posts/:id', autenticarUnico('aluno'), postController.obterPorId);

export default router;