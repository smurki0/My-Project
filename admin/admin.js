// ===== ELEMENTS =====
const user = document.getElementById("user");
const pass = document.getElementById("pass");
const loginBox = document.getElementById("loginBox");
const panel = document.getElementById("panel");
const products = document.getElementById("products");
const orders = document.getElementById("orders");
const name = document.getElementById("name");
const price = document.getElementById("price");
const image = document.getElementById("image");
const description = document.getElementById("description");

// ================= LOGIN =================
function login() {
  fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: user.value, password: pass.value })
  })
  .then(res => res.json())
  .then(data => {
    if(data.success){
      localStorage.setItem("admin","true");
      loginBox.style.display = "none";
      panel.style.display = "block";
      loadProducts();
      loadOrders();
    } else {
      alert("بيانات الدخول غير صحيحة");
    }
  });
}

// ================= PRODUCTS =================
let editId = null;
let allProducts = [];

function addProduct(e) {
  if(e) e.preventDefault();
  
  const data = {
    name: name.value.trim(),
    price: price.value.trim(),
    image: image.value.trim(),
    description: description.value.trim()
  };

  if(!data.name || !data.price){
    alert("ادخل اسم المنتج والسعر");
    return;
  }

  if(editId){
    fetch(`http://localhost:3000/api/products/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(()=> {
      resetProductForm();
      loadProducts();
    });
  } else {
    fetch("http://localhost:3000/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(()=> {
      resetProductForm();
      loadProducts();
    });
  }
}

function resetProductForm(){
  editId = null;
  name.value = "";
  price.value = "";
  image.value = "";
  description.value = "";
}

function loadProducts(){
  fetch("http://localhost:3000/api/products")
  .then(res => res.json())
  .then(data => {
    allProducts = data;
    drawProducts(data);
  });
}

function drawProducts(list){
  products.innerHTML = "";
  list.forEach(p => {
    products.innerHTML += `
      <div class="product-card">
        <img src="${p.image}" style="width:100px;height:100px;object-fit:cover;">
        <b>${p.name}</b>
        ${p.price} ج.م
        <button onclick="fillForm(${p.id})">تعديل</button>
        <button onclick="deleteProduct(${p.id})">حذف</button>
      </div>
    `;
  });
}

function deleteProduct(id){
  fetch(`http://localhost:3000/api/products/${id}`, { method: "DELETE" })
  .then(loadProducts);
}

function fillForm(id){
  const p = allProducts.find(x => x.id === id);
  if(!p) return;
  
  name.value = p.name;
  price.value = p.price;
  image.value = p.image;
  description.value = p.description;
  
  editId = id;
}

function searchProducts(){
  const q = document.getElementById("search").value.toLowerCase();
  const result = allProducts.filter(p => p.name.toLowerCase().includes(q));
  drawProducts(result);
}

// ================= ORDERS =================

function loadOrders(){
  fetch("http://localhost:3000/api/orders")
  .then(res => res.json())
  .then(data => {
    orders.innerHTML = "";

    let totalRevenue = 0;
    let totalSales = data.length;

    const deliveredOrders = JSON.parse(localStorage.getItem("deliveredOrders") || "[]");

    data.forEach(o => {
      const order = JSON.parse(o.data);
      totalRevenue += parseFloat(order.total || 0);

      let itemsHTML = "";
      order.items.forEach(i => {
        itemsHTML += `
          <div class="order-item">
            <img src="${i.image || ''}" style="width:40px;height:40px;object-fit:cover;">
            <span>${i.name} × ${i.quantity}</span>
          </div>
        `;
      });

      const isDelivered = deliveredOrders.includes(o.id);
      const orderClass = isDelivered ? "delivered" : "";

      orders.innerHTML += `
        <div class="order-card ${orderClass}" id="order-${o.id}">
          <p><b>الاسم:</b> ${order.customerName}</p>
          <p><b>الهاتف:</b> ${order.phone}</p>
          <p><b>المحافظة:</b> ${order.city}</p>
          <p><b>المنطقة:</b> ${order.area}</p>
          <p><b>العنوان:</b> ${order.address}</p>
          <hr>
          ${itemsHTML}
          <hr>
          <b>الإجمالي:</b> ${order.total} ج.م<br><br>
          <button onclick="markDelivered(${o.id})" class="deliver-btn">تم التسليم</button>
          <button onclick="deleteOrder(${o.id})" style="background:red;color:#fff">حذف الطلب</button>
        </div>
      `;
    });

    // عرض الأرباح والمبيعات
    document.getElementById("totalRevenue").innerText = totalRevenue.toFixed(2);
    document.getElementById("totalSales").innerText = totalSales;
  });
}

function deleteOrder(id){
  if(confirm("هل تريد حذف الطلب؟")){
    fetch(`http://localhost:3000/api/orders/${id}`, { method: "DELETE" })
    .then(loadOrders);
  }
}

function markDelivered(id){
  const orderEl = document.getElementById(`order-${id}`);
  if(orderEl.classList.contains("delivered")) return;

  if(confirm("هل تريد وضع الطلب كـ 'تم التسليم'؟")){
    orderEl.classList.add("delivered");

    // حفظ الحالة في LocalStorage
    let deliveredOrders = JSON.parse(localStorage.getItem("deliveredOrders") || "[]");
    if(!deliveredOrders.includes(id)) deliveredOrders.push(id);
    localStorage.setItem("deliveredOrders", JSON.stringify(deliveredOrders));
  }
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
  if(localStorage.getItem("admin") === "true"){
    loginBox.style.display = "none";
    panel.style.display = "block";
    loadProducts();
    loadOrders();
  }
});