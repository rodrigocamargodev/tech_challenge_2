import { Schema, model, Document } from 'mongoose';

// Interface TypeScript para tipagem do Post
export interface IPost extends Document {
  titulo: string;
  conteudo: string;
  autor: string;
  criadoEm: Date;
}

// Esquema do Mongoose (validações do banco)
const PostSchema = new Schema<IPost>({
  titulo: { type: String, required: true },
  conteudo: { type: String, required: true },
  autor: { type: String, required: true },
  criadoEm: { type: Date, default: Date.now }
});

export const PostModel = model<IPost>('Post', PostSchema);