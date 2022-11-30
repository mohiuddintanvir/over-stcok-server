const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();

require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const jwt=require('jsonwebtoken')
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mongodb section

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.oczpomj.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// JWT verify function


async function run() {
  try {
    const productsCollection = client
      .db("overstockportal")
      .collection("products");

      const categoriesCollection = client
      .db("overstockportal")
      .collection("categories");
      
    const bookingscollection = client
      .db("overstockportal")
      .collection("bookings");


    const userscollection = client
      .db("overstockportal")
      .collection("users");


// catagory get
    app.get("/products", async (req, res) => {
      const query = {};
      const catagry = await productsCollection.find(query).toArray();
      res.send(catagry);
    });

    app.get("/products/:id", async (req, res) =>{
      const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const product = await productsCollection.findOne(query);
            res.send(product)
    });
    // for spacific catagory
    app.get('/categories/:name', async (req, res) => {
      const name = req.params.name;
      const query = { catagory_name: (name) };
      const category = await categoriesCollection.find(query).toArray();
      res.send(category);

  });
// add products code
app.post('/categories',async(req,res)=>{
  const booking=req.body;
  console.log(booking);
  const result=await categoriesCollection.insertOne(booking);
  res.send(result);
  });

// modal order post
app.post('/bookings',async(req,res)=>{
const booking=req.body;
console.log(booking);
const result=await bookingscollection.insertOne(booking);
res.send(result);
});
// modal information get
app.get('/bookings',async(req,res)=>{
const email=req.query.email;

const query={email:email};
const bookings=await bookingscollection.find(query).toArray();
res.send(bookings);
})

app.get('/bookings/:id',async(req,res)=>{
const id=req.params.id;
const query={_id:ObjectId(id)}
const booking=await bookingscollection.findOne(query)
res.send(booking);
  })


  // payment method data

  app.post('/create-payment-intent',async(req,res)=>{
const booking=req.body;
const price=booking.price;
const amount =price*100;
const paymentIntent = await stripe.paymentIntents.create({
  currency:'usd',
  amount:amount,
  "payment_method_types": [
    "card"
  ],
})
res.send({
  clientSecret: paymentIntent.client_secret,
});

  })



// all user 

app.post('/users',async(req,res)=>{
const user=req.body;
const result=await userscollection.insertOne(user);
res.send(result);
});
app.get("/users", async (req, res) => {
  const query = {};
  const catagry = await userscollection.find(query).toArray();
  res.send(catagry);
});
app.delete('/users/:id',async(req,res)=>{
const id=req.params.id;
const filter={_id:ObjectId(id)}
const result=await userscollection.deleteOne(filter);
res.send(result);
})




// product collection get by id


// admin set
app.get('/users/admin/:email',async(req,res)=>{
const email=req.params.email;
  const query={email};
  const user=await userscollection.findOne(query);
  res.send({isAdmin: user?.role==='admin'});
})




app.put('/users/admin/:id',async(req,res)=>{
const id=req.params.id;
const filter={_id:ObjectId(id)};
const option={upsert:true};
const updateDoc={
  $set:{
    role:'admin'
  }
}
const result=await userscollection.updateOne(filter,updateDoc,option)
res.send(result);
})


app.get('/addprice',async(req,res)=>{
  const filter={}
  const options={upsert:true}
  const updateDoc={
    $set:{
      price:99
    }
  }
const result=await bookingscollection.updateMany(filter,updateDoc,options);
res.send(result)
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
