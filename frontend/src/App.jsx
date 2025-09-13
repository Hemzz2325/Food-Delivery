// src/App.jsx
import { Route, Routes, Navigate } from "react-router-dom";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Forgotpassword from "./pages/Forgotpassword";
import Home from "./pages/Home";
import useGetCurrUser from "./Hooks/useGetCurrUser";   // ✅ fixed path
import { useSelector } from "react-redux";
import useGetCity from "./Hooks/useGetCity";           // ✅ fixed path
import useGetMyShop from "./Hooks/useGetMyShop";       // ✅ fixed path
import Createeditshop from "./pages/Createeditshop";
import AddItem from "./pages/AddItems";
import EditItem from "./pages/EditItem";
import useGetItemsInMyCity from "./Hooks/useGetItemByCity"; // ✅ fixed path

function App() {
  // 🔹 Run hooks on app load
  useGetCurrUser();
  useGetCity();
  useGetMyShop();
  useGetItemsInMyCity();

  const { userData } = useSelector((state) => state.user);

  return (
    <Routes>
      {/* Auth routes — only accessible if NOT logged in */}
      <Route
        path="/signup"
        element={!userData ? <Signup /> : <Navigate to="/" />}
      />
      <Route
        path="/signin"
        element={!userData ? <Signin /> : <Navigate to="/" />}
      />
      <Route
        path="/forgot-password"
        element={!userData ? <Forgotpassword /> : <Navigate to="/" />}
      />

      {/* Home route — only accessible if logged in */}
      <Route
        path="/"
        element={userData ? <Home /> : <Navigate to="/signin" />}
      />

      {/* Shop management */}
      <Route
        path="/create-edit-shop"
        element={userData ? <Createeditshop /> : <Navigate to="/signin" />}
      />
      <Route
        path="/add-item"
        element={userData ? <AddItem /> : <Navigate to="/signin" />}
      />

      {/* ✅ Dynamic edit item route */}
      <Route
        path="/edit-item/:itemId"
        element={userData ? <EditItem /> : <Navigate to="/signin" />}
      />

      {/* Catch-all fallback */}
      <Route
        path="*"
        element={userData ? <Home /> : <Navigate to="/signin" />}
      />
    </Routes>
  );
}

export default App;
