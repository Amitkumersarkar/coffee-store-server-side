const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5500;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xqgbxlh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        // Collections
        const coffeeCollection = client.db('coffeeDB').collection('coffee');
        const userCollection = client.db('coffeeDB').collection('users');

        // Coffee Routes
        app.get('/coffee', async (req, res) => {
            const coffees = await coffeeCollection.find().toArray();
            res.send(coffees);
        });

        app.get('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const coffee = await coffeeCollection.findOne({ _id: new ObjectId(id) });
            res.send(coffee);
        });

        app.post('/coffee', async (req, res) => {
            const newCoffee = req.body;
            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result);
        });

        app.put('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const updatedCoffee = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updatedCoffee.name,
                    quantity: updatedCoffee.quantity,
                    photo: updatedCoffee.photo,
                    category: updatedCoffee.category,
                    details: updatedCoffee.details,
                    chef: updatedCoffee.chef,
                    taste: updatedCoffee.taste,
                    supplier: updatedCoffee.supplier,
                }
            };
            const result = await coffeeCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        app.delete('/coffee/:id', async (req, res) => {
            const id = req.params.id;
            const result = await coffeeCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        });
        // users relate apis
        app.get('/users', async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // Users Route
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            console.log('Creating new user:', newUser);
            const result = await userCollection.insertOne(newUser);
            res.send(result);
        });

        // delete users operation
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })
        // Test MongoDB connection
        await client.db("admin").command({ ping: 1 });
        console.log("Successfully connected to MongoDB!");

    } finally {
        // Uncomment if you want to close connection after running
        // await client.close();
    }
}

run().catch(console.dir);

// Root route
app.get('/', (req, res) => {
    res.send('Coffee making server is running');
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
