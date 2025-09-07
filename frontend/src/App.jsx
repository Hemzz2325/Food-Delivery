import { Route, Routes, Navigate } from "react-router-dom";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Forgotpassword from "./pages/Forgotpassword";
import Home from "./pages/Home"; // ✅ Import Home
import useGetCurrUser from "./Hooka/useGetCurrUser";
import { useSelector } from "react-redux";
import useGetCity from "./Hooka/useGetCity";
import useGetMyshop from "./Hooka/useGetMyShop";
import Createeditshop from "./pages/Createeditshop";




function App() {
  useGetCurrUser();
  useGetCity();
  useGetMyshop();
  const { userData } = useSelector((state) => state.user); // ✅ Access user data

  return (
    <Routes>
      {/* Auth routes — only accessible if not logged in */}
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
      <Route path="/" element={userData ? <Home /> : <Navigate to="/signin" />} />

       <Route path="/create-edit-shop" element={userData ? <Createeditshop /> : <Navigate to="/signin" />} />


      {/* Catch-all */}
      <Route
        path="*"
        element={userData ? <Home /> : <Navigate to="/signin" />}
      />
    </Routes>
  );
}

export default App;
