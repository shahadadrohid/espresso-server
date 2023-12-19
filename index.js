const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER)
// console.log(process.env.DB_PASS)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ldnwcmu.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const coffeesData = client.db('coffees');
        const coffeesCollection = coffeesData.collection('coffee');
        const userCollection = client.db('coffees').collection('user');


        app.get('/coffee', async (req, res) => {
            const cursor = coffeesCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeesCollection.findOne(query);
            res.send(result);
        })

        app.put('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const coffee = req.body;
            console.log(id, coffee);

            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedCoffee = {
                $set: {
                    name: coffee.name,
                    supplier: coffee.supplier,
                    quantity: coffee.quantity,
                    taste: coffee.taste,
                    category: coffee.category,
                    details: coffee.details,
                    photo: coffee.photo
                }
            }

            const result = await coffeesCollection.updateOne(filter, updatedCoffee, options);
            res.send(result);
        })

        app.delete('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: new ObjectId(id) };
            const result = await coffeesCollection.deleteOne(query);
            res.send(result);
        })

        app.post('/coffee', async (req, res) => {
            const newCoffee = req.body;
            console.log(newCoffee);
            const result = await coffeesCollection.insertOne(newCoffee);
            res.send(result);
        })


        //User related apis:---------------

        app.get('/user', async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.patch('/user', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updatedDoc = {
                $set: {
                    lastLoggedAt: user.lastLoggedAt
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })

        app.delete('/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })

        app.post('/user', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Server is running Successfully');
})

app.listen(port, () => {
    console.log(`Server is running: ${port}`);
})