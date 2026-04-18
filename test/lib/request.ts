import supertest from 'supertest';
import 'dotenv/config';

const port = process.env.PORT || 4000;
const host = `http://localhost:${port}`;

const request = supertest(host);

export default request;
