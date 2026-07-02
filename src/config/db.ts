import mongoose from 'mongoose';

export const conectarBanco = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/tech_challenge_blog';
    await mongoose.connect(uri);
    console.log('🍃 Conectado ao MongoDB com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};