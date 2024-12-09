import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignUpPage";
import Top from "./components/Top";
import EventListPage from "./components/EventListPage";
import EventFormPage from "./components/EventFormPage";
import EventDetailPage from "./components/EventDetailPage";
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Top />
            </PrivateRoute>
          }
        />
        <Route
          path="/events/:date"
          element={
            <PrivateRoute>
              <EventListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/form"
          element={
            <PrivateRoute>
              <EventFormPage />
            </PrivateRoute>
          }
        />

        <Route 
          path="/event/edit/:eventId"
          element={
            <PrivateRoute>
              <EventFormPage />
            </PrivateRoute>
          } 
        />

        <Route
          path="/event/:eventId"
          element={
            <PrivateRoute>
              <EventDetailPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
