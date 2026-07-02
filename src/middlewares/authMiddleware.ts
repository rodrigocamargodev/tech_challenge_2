import { Request, Response, NextFunction } from 'express';

// Estende a tipagem do Express para salvar o tipo de usuário na requisição, se necessário futuramente
declare global {
  namespace Express {
    interface Request {
      usuarioRole?: 'professor' | 'aluno';
    }
  }
}

export const autenticarUnico = (roleObrigatoria: 'professor' | 'aluno') => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Busca o token enviado no cabeçalho "Authorization" da requisição
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
    }

    const tokenProfessor = process.env.TOKEN_PROFESSOR || 'professor123';
    const tokenAluno = process.env.TOKEN_ALUNO || 'aluno123';

    // Valida se o token corresponde ao nível de acesso exigido pela rota
    if (roleObrigatoria === 'professor' && token === tokenProfessor) {
      req.usuarioRole = 'professor';
      return next(); // Autorizado! Segue para o Controller
    }

    if (roleObrigatoria === 'aluno' && (token === tokenAluno || token === tokenProfessor)) {
      req.usuarioRole = token === tokenProfessor ? 'professor' : 'aluno';
      return next(); // Autorizado! (Professores também podem ler posts de aluno)
    }

    return res.status(403).json({ error: 'Acesso negado. Você não tem permissão para esta ação.' });
  };
};