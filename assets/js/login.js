document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorDiv = document.getElementById("loginError");

  function parseJwt(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Error al decodificar el token:", e);
      return null;
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      errorDiv.textContent = "Por favor, llena todos los campos.";
      return;
    }

    try {
      const res = await fetch(
        "https://shop-api-2eu6.onrender.com/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        errorDiv.textContent = data.message || "Error al iniciar sesión.";
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);

        const decoded = parseJwt(data.token);
        const rol = decoded?.rol;

        if (rol) {
          localStorage.setItem("rol", rol);

          if (rol === "admin") {
            window.location.href = "../pages/admin-dashboard.html";
          } else {
            window.location.href = "../index.html";
          }
        } else {
          errorDiv.textContent = "No se pudo determinar el rol del usuario.";
        }
      } else {
        errorDiv.textContent = "Error: El servidor no devolvió un token.";
      }
    } catch (err) {
      console.error("Error al conectar con el servidor:", err);
      errorDiv.textContent = "Error de conexión. Inténtalo más tarde.";
    }
  });
});
