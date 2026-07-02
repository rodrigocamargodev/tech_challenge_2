import express from 'express';
import dotenv from 'dotenv';
import { conectarBanco } from './config/db';
import postRoutes from './routes/postRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

// Conexão com o Banco de Dados
conectarBanco();

// Rotas da Aplicação
app.use(postRoutes);

// Rota base para checagem rápida
app.get('/', (req, res) => {
  res.json({ message: "Back-end do Tech Challenge rodando perfeitamente!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Back-end rodando na porta ${PORT}`);
});