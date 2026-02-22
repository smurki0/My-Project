let cart = [];

// عرض المنتجات من السيرفر
async function loadProducts() {
  const res = await fetch("http://localhost:3000/api/products");
  const products = await res.json();

  const container = document.getElementById("products");
  container.innerHTML = "";

  products.forEach(p => {
    const div = document.createElement("div");
    div.innerHTML = `
      <img src="${p.image}" width="80"><br>
      ${p.name} - ${p.price} جنيه
      <button onclick="addToCart(${p.id},'${p.name}',${p.price})">اضف للسلة</button>
    `;
    container.appendChild(div);
  });
}

// إضافة منتج للسلة
function addToCart(id, name, price) {
  cart.push({ id, name, price, quantity: 1 });
  renderCart();
}

// عرض السلة
function renderCart() {
  const container = document.getElementById("cart");
  container.innerHTML = "";
  cart.forEach((item, index) => {
    container.innerHTML += `
      ${item.name} - ${item.price} جنيه
      <button onclick="removeFromCart(${index})">حذف</button><br>
    `;
  });
}

// حذف عنصر
function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

// الدفع / إرسال الطلب للسيرفر
async function checkout() {
  if(cart.length===0){ alert("السلة فارغة"); return; }

  const orderData = { items: cart, date: new Date() };

  const res = await fetch("http://localhost:3000/api/orders",{
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(orderData)
  });

  alert("تمت العملية بنجاح!");
  cart = [];
  renderCart();
}
