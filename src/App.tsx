import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import MerchantList from "@/pages/MerchantList";
import MerchantDetail from "@/pages/MerchantDetail";
import MerchantForm from "@/pages/MerchantForm";
import LicenseManagement from "@/pages/LicenseManagement";
import PriceManagement from "@/pages/PriceManagement";
import InspectionManagement from "@/pages/InspectionManagement";
import ReviewManagement from "@/pages/ReviewManagement";
import RectificationManagement from "@/pages/RectificationManagement";
import Reports from "@/pages/Reports";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/merchants" element={<MerchantList />} />
          <Route path="/merchants/new" element={<MerchantForm />} />
          <Route path="/merchants/:id" element={<MerchantDetail />} />
          <Route path="/merchants/:id/edit" element={<MerchantForm />} />
          <Route path="/licenses" element={<LicenseManagement />} />
          <Route path="/prices" element={<PriceManagement />} />
          <Route path="/inspections" element={<InspectionManagement />} />
          <Route path="/reviews" element={<ReviewManagement />} />
          <Route path="/rectifications" element={<RectificationManagement />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </Router>
  );
}