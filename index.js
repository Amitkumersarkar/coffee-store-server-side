require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5500;

// app.use(cors({
//     origin: [
//         "http://localhost:5173",
//         "https://coffee-store-c409e.web.app"
//     ],
//     credentials: true,
// }));
app.use(cors({
    origin: "*", // temporary, allows all
    credentials: true
}));


app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xqgbxlh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();
        const db = client.db('coffeeDB');
        const coffeeCollection = db.collection('coffee');
        const userCollection = db.collection('users');

        // Coffee routes
        app.get('/coffee', async (req, res) => {
            try {
                const coffees = await coffeeCollection.find().toArray();
                res.status(200).json(coffees);
            } catch (error) {
                res.status(500).json({ error: 'Failed to fetch coffee data.' });
            }
        });

        app.get('/coffee/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const coffee = await coffeeCollection.findOne({ _id: new ObjectId(id) });
                if (!coffee) return res.status(404).json({ error: 'Coffee not found' });
                res.status(200).json(coffee);
            } catch {
                res.status(400).json({ error: 'Invalid coffee ID format.' });
            }
        });

        app.post('/coffee', async (req, res) => {
            try {
                const newCoffee = req.body;
                const result = await coffeeCollection.insertOne(newCoffee);
                res.status(201).json(result);
            } catch {
                res.status(500).json({ error: 'Failed to add coffee.' });
            }
        });

        app.put('/coffee/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const updatedCoffee = req.body;
                const filter = { _id: new ObjectId(id) };
                const options = { upsert: true };
                const updateDoc = { $set: updatedCoffee };
                const result = await coffeeCollection.updateOne(filter, updateDoc, options);
                res.status(200).json(result);
            } catch {
                res.status(400).json({ error: 'Failed to update coffee.' });
            }
        });

        app.delete('/coffee/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const result = await coffeeCollection.deleteOne({ _id: new ObjectId(id) });
                res.status(200).json(result);
            } catch {
                res.status(400).json({ error: 'Invalid coffee ID format.' });
            }
        });

        // User routes
        app.get('/users', async (req, res) => {
            try {
                const users = await userCollection.find().toArray();
                res.status(200).json(users);
            } catch {
                res.status(500).json({ error: 'Failed to fetch users.' });
            }
        });

        app.post('/users', async (req, res) => {
            try {
                const newUser = req.body;
                const result = await userCollection.insertOne(newUser);
                res.status(201).json(result);
            } catch {
                res.status(500).json({ error: 'Failed to create user.' });
            }
        });

        app.delete('/users/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const result = await userCollection.deleteOne({ _id: new ObjectId(id) });
                res.status(200).json(result);
            } catch {
                res.status(400).json({ error: 'Invalid user ID format.' });
            }
        });

    } catch (err) {
        console.error('Database connection error:', err);
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Coffee making server is running smoothly!');
});

app.listen(port, () => console.log(`Server running on port ${port}`));

module.exports = app;
