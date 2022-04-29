const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// use middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ckg3p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const productCollection = client.db("emajohn").collection("products");
    console.log(`db is conncted`);
    // get all products
    app.get("/product", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const query = {};
      const cursor = productCollection.find(query);
      let products;
      if (page || size) {
        products = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        products = await cursor.toArray();
      }
      res.send(products);
    });
    // count products
    app.get("/productCount", async (req, res) => {
      const count = await productCollection.estimatedDocumentCount();
      res.send({ count });
    });
    // POST
    app.post("/productByKeys", async (req, res) => {
      const keys = req.body;
      const ids = keys.map((id) => ObjectId(id));
      const query = { _id: { $in: ids } };
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("ema-john is running");
});
app.listen(port, () => {
  console.log(`listening from ${port}`);
});
