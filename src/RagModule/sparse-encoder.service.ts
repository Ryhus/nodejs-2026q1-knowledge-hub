import { Injectable, OnModuleInit } from '@nestjs/common';
import { SparseTextEmbedding, SparseEmbeddingModel } from 'fastembed';

@Injectable()
export class SparseEmbeddingService implements OnModuleInit {
  private model: SparseTextEmbedding;

  async onModuleInit() {
    this.model = await SparseTextEmbedding.init({
      model: SparseEmbeddingModel.SpladePPEnV1,
    });
  }

  encode(texts: string[]) {
    return this.model.embed(texts);
  }
}
