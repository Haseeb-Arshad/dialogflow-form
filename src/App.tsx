import { Notification } from "@progress/kendo-react-notification";
import { Popup } from "@progress/kendo-react-popup";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Import Kendo Theme
import "@progress/kendo-theme-default/dist/all.css";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CreateForm from "./pages/CreateForm";
import EditForm from "./pages/EditForm";
import ViewForm from "./pages/ViewForm";
import FormResponses from "./pages/FormResponses";
import MyForms from "./pages/MyForms";
import FillForm from "./pages/FillForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create" element={<CreateForm />} />
          {/* <Route path="/edit/:formId" element={<EditForm />} /> */}
          <Route path="/view/:formId" element={<ViewForm />} />
          <Route path="/responses/:formId" element={<FormResponses />} />
          <Route path="/forms" element={<MyForms />} />
          <Route path="/fill/:formId" element={<FillForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
