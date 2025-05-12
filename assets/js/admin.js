const apiUrlProducts = "https://shop-api-2eu6.onrender.com/products";
const apiUrlOrders = "https://shop-api-2eu6.onrender.com/orders";

const token = localStorage.getItem("token");

function isAuthenticated() {
  return token !== null;
}

if (!isAuthenticated()) {
  window.location.href = "/login.html"; 
}

// Mostrar la sección activa
function showSection(sectionId) {
  const sections = document.querySelectorAll(".content-section");
  sections.forEach((section) => {
    section.style.display = section.id === sectionId ? "block" : "none";
  });

  if (sectionId === "products" && !document.getElementById("product-list").children.length) {
    loadProducts();
  }
  if (sectionId === "orders" && !document.getElementById("order-list").children.length) {
    loadOrders();
  }
}


// Cargar los productos
function loadProducts() {
  axios
    .get(apiUrlProducts, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log(response.data);
      const products = response.data.products;
      const productList = document.getElementById("product-list");

      productList.innerHTML = `
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="product-table-body">
          </tbody>
        </table>
      `;

      const tableBody = document.getElementById("product-table-body");

      products.forEach((product) => {
        const row = `
          <tr>
            <td>${product.name}</td>
            <td>$${product.price}</td>
            <td>${product.stock}</td>
            <td>
              <button class="btn btn-warning btn-sm me-2" onclick="editProduct('${product._id}')">Editar</button>
              <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product._id}')">Eliminar</button>
            </td>
          </tr>
        `;
        tableBody.innerHTML += row;
      });
    })
    .catch((error) => {
      console.error("Error cargando los productos:", error);
      alert("Hubo un error al cargar los productos.");
    });
}


// Eliminar producto (funciona)
function deleteProduct(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
    axios
      .delete(`${apiUrlProducts}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        alert("Producto eliminado con éxito");
        loadProducts();
      })
      .catch((error) => {
        console.error("Error eliminando el producto:", error);
        alert("Error al eliminar el producto.");
      });
  }
}

//Agregar producto (no funciona)
document.getElementById("product-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("product-name").value.trim();
  const price = parseFloat(document.getElementById("product-price").value);
  const stock = parseInt(document.getElementById("product-stock").value);
  const reorderPoint = parseInt(document.getElementById("product-reorder").value);

  axios
    .post(apiUrlProducts, {
      name,
      price,
      stock,
      reorderPoint
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(() => {
      alert("Producto agregado con éxito.");
      document.getElementById("product-form").reset();
      showSection("products"); // Vuelve a la sección de productos
      loadProducts(); // Refresca la lista
    })
    .catch((error) => {
      console.error("Error agregando el producto:", error);
      alert("Error al agregar el producto.");
    });
});




//ORDENES

function loadOrders() {
  axios
    .get(apiUrlOrders, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log(response.data); // Verifica la respuesta
      const orders = response.data.order || [];
      const orderList = document.getElementById("order-list");

      orderList.innerHTML = `
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Producto</th>
              <th>Precio Unitario</th>
              <th>Cantidad</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody id="order-table-body">
          </tbody>
        </table>
      `;

      const tableBody = document.getElementById("order-table-body");

      if (orders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center">No hay órdenes registradas.</td></tr>`;
        return;
      }

      orders.forEach((order) => {
        const productName = order.product
          ? order.product.name
          : "Producto no disponible";
        const productPrice = order.product ? order.product.price : 0;
        const totalPrice = productPrice * order.quantity;

        const row = `
          <tr>
            <td>${order.customer || "Desconocido"}</td>
            <td>${productName}</td>
            <td>$${productPrice}</td>
            <td>${order.quantity}</td>
            <td>$${totalPrice}</td>
            <td>
              <button class="btn btn-danger btn-sm" onclick="deleteOrder('${
                order._id
              }')">Eliminar</button>
            </td>
          </tr>
        `;
        tableBody.innerHTML += row;
      });
    })
    .catch((error) => {
      console.error("Error cargando las órdenes:", error);
      alert("Hubo un error al cargar las órdenes.");
    });
}

//Agregar orden (no funciona)
document.getElementById("order-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const productId = document.getElementById("order-product").value.trim();
  const quantity = parseInt(document.getElementById("order-quantity").value);

  axios
    .post(apiUrlOrders, {
      productId,
      quantity
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(() => {
      alert("Orden agregada con éxito.");
      document.getElementById("order-form").reset();
      showSection("orders");
      loadOrders(); 
    })
    .catch((error) => {
      console.error("Error agregando la orden:", error);
      alert("Error al agregar la orden.");
    });
});



