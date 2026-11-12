import 'dotenv/config'
import express from 'express';
import cors from 'cors'
import { MongoClient } from 'mongodb';

const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(express.json());
app.use(cors());

const client = new MongoClient(`mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@ac-n9vqlya-shard-00-00.d1i0h77.mongodb.net:27017,ac-n9vqlya-shard-00-01.d1i0h77.mongodb.net:27017,ac-n9vqlya-shard-00-02.d1i0h77.mongodb.net:27017/?ssl=true&replicaSet=atlas-7upjpt-shard-0&authSource=admin`);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
// Call this only when your application terminates
export async function disconnectFromMongoDB() {
  await client.close();
}

const connection = await connectToMongoDB();
const database = connection.db("hireloopdb");
const userCollection = database.collection("user");
const jobCollection = database.collection("jobs");

app.get('/', (req, res) => {
  res.send('HireLoop server is running!');
  console.log(`Hireloop server is running on port: ${port}`)
});

//GET API
app.get('/users', async (req, res) => {
    const result = await userCollection.find({}).toArray();
    console.log(result);
    res.send(result);
})

//Job-related API
app.post('/jobs', async (req, res) => {
  const jobsData = req.body;
  const result = await jobCollection.insertOne(jobsData);
  res.send(result);
  console.log(result);
})

app.listen(port, () => {
  console.log(`HireLoop server listening on port ${port}`);
});