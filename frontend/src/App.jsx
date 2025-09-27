import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/homePage.jsx";
import MenuPage from "./pages/menuPage.jsx";
import Register from "./pages/register.jsx";
import Login from "./pages/Login.jsx";
import Book from "./pages/book.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/booking" element={<Book />} />
    </Routes>
  );
}

export default App;
