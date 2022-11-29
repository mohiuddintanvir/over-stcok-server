const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
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
function verifyJWT(req,res,next){
  console.log('token inside verify jwt',req.headers.authorization);
  const authHeader=req.headers.authorization;
  if(!authHeader){
    return res.status(401).send('unauthorized access')
   
  } 
  const token=authHeader.split('')[1];
  jwt.verify(token,process.env.ACCESS_TOKEN,function(err,decoded){
    if(err){
      return res.status(403).send({massage:'forbidden access'})
    }
    req.decoded=decoded;
    next()
  })
}

async function run() {
  try {
    const productsCollection = client
      .db("overstockportal")
      .collection("products");
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
    })

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
// const decodedEmail=req.decoded.email;
// if(email!==decodedEmail){
//   return res.status(403).send({massage:'forbiden access'})
// }
const query={email:email};
const bookings=await bookingscollection.find(query).toArray();
res.send(bookings);
// jwt token
app.get('/jwt',async(req,res)=>{
  const email=req.query.email;
  const query={email:email};
  const user=await userscollection.findOne(query);
  if(user){
    const token=jwt.sign({email},process.env.ACCESS_TOKEN,{expiresIn:'1h'})
    return res.send({accessToken:token});
  }
  console.log(user);
  res.status(403).send({accessToken:''})
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
