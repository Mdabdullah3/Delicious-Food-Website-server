const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();
app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://AbiAbdullah:iZUupYxfphEeM2kG@cluster0.lmtdwnm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// function verifyJWT(req, res, next) {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).send({ message: "UnAuthorized access" });
//   }
//   const token = authHeader.split(" ")[1];
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
//     if (err) {
//       return res.status(403).send({ message: "Forbidden access" });
//     }
//     req.decoded = decoded;
//     next();
//   });
// }
async function run() {
  try {
    await client.connect();
    const foodCollections = client.db("Delicious").collection("foodItems");
    const foodReviewCollections = client
      .db("Delicious")
      .collection("foodReview");
    const OrdersCollection = client.db("Delicious").collection("orders");
    const userCollection = client.db("Delicious").collection("users");
    // Get All Food
    app.get("/foods", async (req, res) => {
      const query = req.body;
      const foods = await foodCollections.find(query).toArray();
      res.send(foods);
    });
    // Find Single Food
    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const foodid = await foodCollections.findOne(query);
      res.send(foodid);
    });
    // update stock  quantity
    app.put("/foods/:id", async (req, res) => {
      const id = req.params.id;
      const newQuantity = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          stock: newQuantity.quantity,
        },
      };
      const updateStock = await foodCollections.updateOne(
        filter,
        updatedDoc,
        options
      );

      res.send(updateStock);
    });
    // Submit Order From Orders Collection
    app.post("/orders", async (req, res) => {
      const query = req.body;
      const orders = await OrdersCollection.insertOne(query);
      res.send(orders);
    });
    // Get All Reviews  from food review collection
    app.get("/reviews", async (req, res) => {
      const query = req.body;
      const reviews = await foodReviewCollections.find(query).toArray();
      res.send(reviews);
    });
    // Post a reviews from food review collection
    app.post("/reviews", async (req, res) => {
      const query = req.body;
      const review = await foodReviewCollections.insertOne(query);
      res.send(review);
    });

    // userCollection 
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    
    app.get("/myitems", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = OrdersCollection.find(query);
      const result = await cursor.toArray();
      return res.send(result);
    });

    app.get("/user", async (req, res) => {
      const query = req.body
      const users = await userCollection.find(query).toArray();
      res.send(users);
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const users = await userCollection.findOne(query);
      res.send(users);
    });


    app.put("/user/update/:email", async (req, res) => {
      const email = req.params.email;
      const userInfo = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateUser = {
        $set: userInfo,
      };
      const result = await userCollection.updateOne(
        filter,
        updateUser,
        options
      );
      res.send(result);
    });
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const deletProduct = await OrdersCollection.deleteOne(query);
      res.send(deletProduct);
    });

    // Get All ORders
    app.get("/myOrders", async (req, res) => {
      const query = req.body;
      const orders = await OrdersCollection.find(query).toArray();
      res.send(orders);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("This Website is runnig");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
