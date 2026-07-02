import express from 'express';
import postRoutes from './routes/postRoutes';

const app = express();

app.use(express.json());
app.use(postRoutes);

app.get('/', (req, res) => {
  res.json({ message: "Back-end do Tech Challenge rodando perfeitamente!" });
});

export default app; // IMPORTANTE: Certifique-se de que esta linha está escrita exatamente assim
