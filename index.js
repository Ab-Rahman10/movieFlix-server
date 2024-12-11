require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.euk0j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const moviesCollection = client.db("MovieFlixDB").collection("movies");
    const fakeMoviesCollection = client
      .db("MovieFlixDB")
      .collection("fakeMovies");
    const favoriteCollection = client
      .db("MovieFlixDB")
      .collection("favoriteData");

    // for movies
    app.get("/movies", async (req, res) => {
      const search = req.query.search || "";
      let option = {};
      if (search) {
        option = { title: { $regex: search, $options: "i" } };
      }
      const result = await moviesCollection.find(option).toArray();
      res.send(result);
    });

    app.get("/movies/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await moviesCollection.findOne(query);
      res.send(result);
    });

    app.get("/movieDetails/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await moviesCollection.findOne(query);
      res.send(result);
    });

    app.post("/movies", async (req, res) => {
      const newMovie = req.body;
      const result = await moviesCollection.insertOne(newMovie);
      res.send(result);
    });

    app.put("/movies/:id", async (req, res) => {
      const id = req.params.id;
      const updateMovie = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          poster: updateMovie.poster,
          title: updateMovie.title,
          genre: updateMovie.genre,
          duration: updateMovie.duration,
          releaseYear: updateMovie.releaseYear,
          movieRating: updateMovie.movieRating,
          summary: updateMovie.summary,
        },
      };
      const result = await moviesCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.delete("/movies/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await moviesCollection.deleteOne(query);
      res.send(result);
    });

    // it's favorite related
    app.get("/favorites", async (req, res) => {
      const result = await favoriteCollection.find().toArray();
      res.send(result);
    });

    app.post("/favorites", async (req, res) => {
      const favMovData = req.body;
      const result = await favoriteCollection.insertOne(favMovData);
      res.send(result);
    });

    app.delete("/favorites/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await favoriteCollection.deleteOne(query);
      res.send(result);
    });

    // fake data
    app.get("/fakeMovies", async (req, res) => {
      const result = await fakeMoviesCollection.find().toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Movie flix server is running..");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
