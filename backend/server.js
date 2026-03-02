const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// ================== DATABASE ==================
const db = new sqlite3.Database("/app/store.db");

// PRODUCTS TABLE
db.run(`
CREATE TABLE IF NOT EXISTS products(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  price REAL,
  image TEXT,
  description TEXT
)
`);

// ADMINS TABLE
db.run(`
CREATE TABLE IF NOT EXISTS admins(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  password TEXT
)
`);

// ORDERS TABLE
db.run(`
CREATE TABLE IF NOT EXISTS orders(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data TEXT
)
`);

// Create Default Admin
const hashed = bcrypt.hashSync("mohammed11112006",10);

db.run(`
INSERT OR IGNORE INTO admins (id,username,password)
VALUES (1,'admin','${hashed}')
`);


// ================== LOGIN ==================
app.post("/api/login",(req,res)=>{
  const {username,password}=req.body;

  db.get(
    "SELECT * FROM admins WHERE username=?",
    [username],
    (err,row)=>{
      if(!row) return res.json({success:false});

      const match = bcrypt.compareSync(password,row.password);

      if(match) res.json({success:true});
      else res.json({success:false});
    }
  );
});


// ================== PRODUCTS ==================
app.post("/api/products",(req,res)=>{
  const {name,price,image,description}=req.body;

  db.run(
    "INSERT INTO products(name,price,image,description) VALUES(?,?,?,?)",
    [name,price,image,description],
    ()=>res.send("added")
  );
});

app.get("/api/products",(req,res)=>{
  db.all("SELECT * FROM products",(err,rows)=>{
    res.json(rows);
  });
});

app.delete("/api/products/:id",(req,res)=>{
  db.run("DELETE FROM products WHERE id=?",[req.params.id]);
  res.send("deleted");
});

app.put("/api/products/:id",(req,res)=>{
  const {name,price,image,description}=req.body;

  db.run(
    "UPDATE products SET name=?,price=?,image=?,description=? WHERE id=?",
    [name,price,image,description,req.params.id]
  );

  res.send("updated");
});

// ================== ORDERS ==================
app.post("/api/orders",(req,res)=>{
  db.run("INSERT INTO orders(data) VALUES(?)",
  [JSON.stringify(req.body)]);
  res.send("saved");
});

app.get("/api/orders",(req,res)=>{
  db.all("SELECT * FROM orders",(err,rows)=>{
    res.json(rows);
  });
});

// ================== DELETE ORDER ==================
app.delete("/api/orders/:id", (req, res) => {
  const orderId = req.params.id;
  
  db.run("DELETE FROM orders WHERE id=?", [orderId], function(err){
    if(err){
      console.error(err);
      res.status(500).send("error");
    } else {
      res.send("deleted");
    }
  });
});

// ================== RUN ==================
app.use("/Asstar", express.static("Asstar"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});



