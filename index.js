const express = require('express');
const cors = require('cors');
require('dotenv').config(); 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:5173/' }));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.bade1fx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
app.get('/raihan', (req, res) => {
  res.send('Gardening Server is running!'); 
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();  
    
    const tipsCollection = client.db("gardeningDB").collection("tips");


    // Get all tips at /tips 
    app.get('/tips', async (req, res) => {
      const query = {};
      const result = await tipsCollection.find(query).toArray();
      res.send(result);
    });


    // Get a single tip by ID
    app.get('/tips/:id', async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
    return res.status(400).send({ error: 'Invalid tip ID format' });
  }const query = { _id: new ObjectId(id) };
      const tip = await tipsCollection.findOne(query);
      res.send(tip);
    });


// Get tips by user email
    app.get('/my-tips', async (req, res) => {
  const userEmail = req.query.email;
  if (!userEmail) return res.status(400).send({ message: 'Email is required' });
  try {
    const result = await tipsCollection.find({ email: userEmail }).toArray();
    res.send(result);
  } catch (error) {
    console.error('Error fetching tips:', error);
    res.status(500).send({ message: 'Server error' });
  }
});


    // Express
app.post('/tips', async (req, res) => {
  const newTip = req.body;
  const result = await tipsCollection.insertOne(newTip);
  res.send(result);
});


// Update a tip
  app.put('/tips/:id', async (req, res) => {
  const id = req.params.id;
  const updatedTip = { ...req.body };
  try {
    delete updatedTip._id;
    const result = await tipsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedTip }
    );
    if (result.matchedCount === 0) {
      return res.status(404).send({ message: 'Tip not found' });
    }
    res.send({ message: 'Tip updated successfully' });
  } catch (error) {
    console.error('Error updating tip:', error);
    res.status(500).send({ message: 'Failed to update tip' });
  }
});


// Delete a tip
app.delete('/tips/:id', async (req, res) => {
  const id = req.params.id; 
  try {
    const result = await tipsCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).send({ message: 'Tip not found' });
    }
    res.send({ message: 'Tip deleted successfully' });
  } catch (error) {
    console.error('Error deleting tip:', error);
    res.status(500).send({ message: 'Failed to delete tip' });
  }
});


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Gardening Server is running!');
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
