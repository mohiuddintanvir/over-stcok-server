const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mongodb section

const uri = `mongodb+srv://proportal:nQKLRP1KcvgmytNm@cluster0.oczpomj.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const productsCollection = client
      .db("overstockportal")
      .collection("products");
    const bookingscollection = client
      .db("overstockportal")
      .collection("bookings");



    app.get("/products", async (req, res) => {
      const query = {};
      const catagry = await productsCollection.find(query).toArray();
      res.send(catagry);
    });
// api convension
app.post('/bookings',async(req,res)=>{
const booking=req.body;
console.log(booking);
const result=await bookingscollection.insertOne(booking);
res.send(result);
})


  } 
  finally {
  }
}
run().catch(console.log);

app.get("/", async (req, res) => {
  res.send("Overstock portal server is running");
});
app.listen(port, () => console.log(`Overstock portal running${port}`));
