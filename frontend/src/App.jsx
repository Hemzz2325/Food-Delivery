// src/App.jsx
import { Route, Routes, Navigate } from "react-router-dom";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Forgotpassword from "./pages/Forgotpassword";
import Home from "./pages/Home";
import useGetCurrUser from "./Hooks/useGetCurrUser";
import { useSelector } from "react-redux";
import useGetCity from "./Hooks/useGetCity";
import useGetMyShop from "./Hooks/useGetMyShop";
import useGetShopByCity from "./Hooks/useGetShopByCity";
import Createeditshop from "./pages/Createeditshop";
import AddItem from "./pages/AddItems";
import EditItem from "./pages/EditItem";
import useGetItemsInMyCity from "./Hooks/useGetItemByCity";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import TrackOrder from "./pages/TrackOrder";
import OwnerOrders from "./pages/OwnerOrders";
import Delivery from "./pages/Delivery";           // keep only this one
import RoleGuard from "./components/RoleGuard";
import ErrorBoundary from "./components/ErrorBoundary";
import OwnerDashboard from "./components/OwnerDashboard";

function App() {
  useGetCurrUser();
  useGetCity();
  useGetMyShop();
  useGetShopByCity();
  useGetItemsInMyCity();

  const { userData } = useSelector((state) => state.user);

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/signup" element={!userData ? <Signup /> : <Navigate to="/" />} />
        <Route path="/signin" element={!userData ? <Signin /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!userData ? <Forgotpassword /> : <Navigate to="/" />} />

        <Route path="/" element={userData ? <Home /> : <Navigate to="/signin" />} />

        <Route path="/create-edit-shop" element={userData ? <Createeditshop /> : <Navigate to="/signin" />} />
        <Route path="/add-item" element={userData ? <AddItem /> : <Navigate to="/signin" />} />
        <Route path="/edit-item/:itemId" element={userData ? <EditItem /> : <Navigate to="/signin" />} />

        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />

        <Route path="/orders" element={<MyOrders />} />
        <Route path="/track/:orderId" element={<TrackOrder />} />

        <Route
          path="/owner/orders"
          element={
            <RoleGuard allow={["owner"]}>
              <OwnerOrders />  {/* was <OwnerOrders /> */}
            </RoleGuard>
          }
        />

        <Route
          path="/delivery"
          element={
            <RoleGuard allow={["delivery boy"]}>
              <Delivery />
            </RoleGuard>
          }
        />

        <Route path="*" element={userData ? <Home /> : <Navigate to="/signin" />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
