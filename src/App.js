import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Top from "./components/Top"; // Topコンポーネントをインポート
import EventListPage from "./components/EventListPage"; // イベント一覧ページコンポーネント
import EventFormPage from "./components/EventFormPage"; // イベント一覧ページコンポーネント

const App = () => {
  return (
    <Router>
      <Routes>
        {/* トップページ */}
        <Route path="/" element={<Top />} />
        {/* 特定の日付のイベント一覧ページ */}
        <Route path="/events/:date" element={<EventListPage />} />
        <Route path="/form" element={<EventFormPage />} />
      </Routes>
    </Router>
  );
};

export default App;
