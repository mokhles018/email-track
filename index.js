const express = require("express");
const cors = require("cors");
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();
const PORT = process.env.PORT || 5000;



// middleware
app.use(cors());
app.use(express.json());

const url = process.env.DATABASE_URL;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    // collection declaration
    const collection = client.db('uprankly_dev').collection('mailTracks');
    // const collection = client.db('uprankly_dev').collection('campaigns');

    app.get('/track/:mailTrackId', async (req, res) => {

      try {
        const { mailTrackId } = req.params;

        // const mailTrack = await collection.find().toArray();
        // console.log(mailTrack.length)
        const query = {
          _id: new ObjectId(mailTrackId),
          status: 'SENT'
        }
        const updateDoc = {
          $set: {
            status: 'OPENED'
          }
        }
        await collection.updateOne(query, updateDoc)

        // Set image
        const imgPath = path.join(__dirname, './logo.jpg');

        fs.readFile(imgPath, (err, data) => {
          if (err) {
            res.status(500).send('Error loading pixel image');
            return;
          }
          res.writeHead(200, {
            'Content-Type': 'image/jpeg',
            'Content-Length': data.length,
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store'
          });
          res.end(data);
        });

        // Data base operation
        // await prisma.mailTrack.update({
        //     where: { id: mailTrackId },
        //     data: {
        //         status: 'OPEN'
        //     }
        // })

      }
      catch (error) {
        res.send({ message: 'Something went wrong' })
      }


    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Sever is running')
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});