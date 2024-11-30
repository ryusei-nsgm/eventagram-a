import React from "react";
import { useParams, Link } from "react-router-dom";

const EventListPage = () => {
  const { date } = useParams(); // URLパラメータから日付を取得
  const formattedDate = new Date(date).toLocaleDateString('ja-JP', {
    weekday: 'short',
    month: 'numeric',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen p-4 bg-gray-100 text-gray-900">
      <Link to="/" className="text-gray-800 hover:text-blue-700 text-lg">
        <span className="mr-2">&lt;</span>
      </Link>
      <h1 className="text-3xl font-bold text-center mb-8">{formattedDate}</h1>

      <Link to="/form" className="fixed top-8 right-8 bg-green-400 text-white w-12 h-12 flex items-center justify-center rounded-full shadow-md">
        <span className="text-3xl">+</span>
      </Link>

      {/* TODO: Firebaseから該当の日付のイベントを取得して表示する */}
      <div className="p-4 bg-white rounded-lg shadow">
        <p>該当するイベントがありません。</p>
      </div>
    </div>
  );
};

export default EventListPage;
