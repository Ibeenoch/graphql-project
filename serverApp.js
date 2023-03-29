import express from 'express'
import cors from 'cors'
import { graphqlHTTP } from 'express-graphql'
import dotenv from 'dotenv'
import schemas from './model/schemagraphql.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(cors())

app.use('/graphql', graphqlHTTP({
  schema: schemas,
  graphiql: process.env.NODE_ENV === 'development'
}))

const PORT = process.env.PORT || 3030;
app.listen(PORT, ()=> { `Server running on port ${PORT}`})