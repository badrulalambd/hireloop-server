import 'dotenv/config'
import express from 'express';
import cors from 'cors'
import { MongoClient, ObjectId } from 'mongodb';

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

//Job-Related API
//API for the add-job page
app.post('/jobs', async (req, res) => {
  const jobsData = req.body;
  const result = await jobCollection.insertOne(jobsData);
  res.send(result);
  console.log(result);
})
//API for manage-jobs page for recruiter
app.get('/jobs', async (req, res) => {
  const cursor = jobCollection.find();
  const result = await cursor.toArray();
  res.send(result);
  console.log("Get Jobs Data from mongoDB: ", result);
})
//API for browse-jobs page to find the jobs on the public page
app.get('/browse-jobs', async (req, res) => {
  const query = {};
  console.log("Request Query: ", req.query);
  if (req.query) {
    if (req.query.jobType) {
      query.jobType = req.query.jobType;
    }
    if (req.query.isRemote) {
      query.isRemote = req.query.isRemote === 'true';
    }
    if (req.query.jobCategory) {
      query.jobCategory = req.query.jobCategory;
    }
    if (req.query.location) {
      query.location = req.query.location;
    }
    // Search condition
    if (req.query.search) {
      const searchRegex = {
        $regex: req.query.search,
        $options: "i"
      };

      query.$or = [
        { jobTitle: searchRegex },
        { responsibilities: searchRegex },
        { companyName: searchRegex },
        { jobType: searchRegex },
        { qualifications: searchRegex }
      ];
    }
  }
  const cursor = jobCollection.find(query);
  const result = await cursor.toArray();
  res.send(result);
})
//API for deleting a specific job from manage-jobs page.
app.delete('/jobs/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await jobCollection.deleteOne(query);
  res.send(result);
  console.log("Deleted Job: ", result);
})

app.listen(port, () => {
  console.log(`HireLoop server listening on port ${port}`);
});