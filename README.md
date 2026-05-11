# Knowledge Hub

## Prerequisites

- Git - [Download & Install Git](https://git-scm.com/downloads).
- Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.

## Downloading

```
git clone {repository URL}
```

## Installing NPM modules

```
npm install
```

## Running application

```
npm start
```

After starting the app on port (4000 as default) you can open
in your browser OpenAPI documentation by typing http://localhost:4000/doc/.
For more information about OpenAPI/Swagger please visit https://swagger.io/.

## Testing

After application running open new terminal and enter:

To run all tests without authorization

```
npm run test
```

To run only one of all test suites

```
npm run test -- <path to suite>
```

To run all test with authorization

```
npm run test:auth
```

To run only specific test suite with authorization

```
npm run test:auth -- <path to suite>
```

To run refresh token tests

```
npm run test:refresh
```

To run RBAC (role-based access control) tests

```
npm run test:rbac
```

### Auto-fix and format

```
npm run lint
```

```
npm run format
```

### Debugging in VSCode

Press <kbd>F5</kbd> to debug.

For more information, visit: https://code.visualstudio.com/docs/editor/debugging

### Link to Application image

https://hub.docker.com/r/ryhus/knowledge-hub

### AI integration information

#### Gemini API key obtaining:

- Create google account if don't have it yet
- Go to https://aistudio.google.com/api-keys and create the API key
- Now you have your key and can call Gemini models with trial limits

#### Gemini Models

By default the `gemini-2.5-flash-lite` model is used.

#### Setup the model after cloning the repo

In the .env file add next variables:

- `GEMINI_API_KEY`=your-gemini-api-key
- `GEMINI_API_BASE_URL`=https://generativelanguage.googleapis.com
- `GEMINI_MODEL`=gemini-2.5-flash-lite
- `AI_RATE_LIMIT_RPM`=20
- `AI_CACHE_TTL_SEC`=300

You can find all env variables in .env.example

To run the simply type `npm run start:dev` in the terminal

#### Gemini API limitations

1. There are different limits of usage for Gemini models and quotas. But with the free tier you can use `gemini-2.5-flash-lite` with requests per day. You can find detailed info here https://aistudio.google.com/rate-limit.
2. Latency depends on the model and the task you perform.
3. Is some countries under the sunctions gemini models are unavailable.

### RAG

!!! For now application has the separate model for Sparse encodding and it will be downloaded on apllication startup, you will see the process of downloading in console logs. Because of these model fetching, application will be restarting when trying to use docker compose. Pls, do the next steps to run it:

1. Run your dev qdrant docker container with:

```
docker run -p 6333:6333 -p 6334:6334 \
    -v "$(pwd)/qdrant_storage:/qdrant/storage:z" \
    qdrant/qdrant
```

2. Run your dev Postgres Database using .env.example variables
3. Start the application npm run start:dev
4. Wait until the Sparse encodding model will be downloaded. In the root you will see `local_cache` foleder with the model and tokenizer.Then you can make requests. Qdrant Collection will be created automatically on app startup.
5. All variables for configured qdrant are presented in .env.example:

```
GEMINI_EMBEDDING_MODEL - external LLM for creating embeddings
RAG_VECTOR_DB_PROVIDER=qdrant - vector DB provider
RAG_VECTOR_DB_URL - url of your vector db server
RAG_VECTOR_COLLECTION - name of the collection of vetros in yor vector db
RAG_CHUNK_SIZE - maximum chunk size of your text data
RAG_CHUNK_OVERLAP - chank overlaps
RAG_CONVERSATION_MAX_MESSAGES - maximum number of messages to maintain in memory, having conversation with the LLM
```

The collection will be created on startup. To index your data use this endpoint:

```
POST /ai/rag/index
interface ReindexRequest {
  onlyPublished?: boolean; // default true
  articleIds?: string[];   // optional selective reindex
}
```

The free embedding model supports 1000 requests a day. The more base to index the more time it takes. For Sparse encodding separate internal model is used.
About generation model and how to obtain keys read `Gemini Models` section above.

`! Pls run the app separetely from docker compose. It must download the Sparse embedding model`
