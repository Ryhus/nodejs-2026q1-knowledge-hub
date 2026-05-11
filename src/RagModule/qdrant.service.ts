import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class QdrantService implements OnModuleInit {
  async onModuleInit() {
    await this.ensureCollection();
  }

  async ensureCollection() {
    const collection = process.env.RAG_VECTOR_COLLECTION;
    const url = `${process.env.RAG_VECTOR_DB_URL}/collections/${collection}`;

    const existsResponse = await fetch(url);

    if (existsResponse.ok) {
      console.log('Qdrant collection exists');
      return;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vectors: {
          dense: {
            size: 768,
            distance: 'Cosine',
          },
        },
        sparse_vectors: {
          sparse: {},
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create Qdrant collection');
    }
    console.log('Qdrant collection created');
  }
}
