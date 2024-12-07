import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs, Timestamp, orderBy } from "firebase/firestore";

const EventListPage = () => {
  const { date } = useParams(); // URLパラメータから日付を取得
  const selectedDate = new Date(date);
  const [events, setEvents] = useState([]); // イベントデータを管理するためのstate
  const [loading, setLoading] = useState(true); // データが読み込まれるまでのローディング状態を管理

  const formattedDate = selectedDate.toLocaleDateString("ja-JP", {
    weekday: "short",
    month: "numeric",
    day: "numeric",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true); // データ取得前にローディング開始

      const startOfDay = Timestamp.fromDate(new Date(selectedDate.setHours(0, 0, 0, 0)));
      const endOfDay = Timestamp.fromDate(new Date(selectedDate.setHours(23, 59, 59, 999)));

      const q = query(
        collection(db, "events"),
        where("startDate", "<=", endOfDay),
        where("endDate", ">=", startOfDay),
        orderBy("endDate", "asc")
      );
      const querySnapshot = await getDocs(q);
      const eventList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEvents(eventList); // イベントデータをセット
      setLoading(false); // データ取得後にローディング終了
    };

    fetchEvents();
  }, [date]);

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`, { state: { date: selectedDate } }); // イベント詳細画面へ遷移
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100 text-gray-900">
      <Link to="/" className="text-gray-800 hover:text-blue-700 text-lg">
        <span className="mr-2">&lt;</span>
      </Link>
      <h1 className="text-3xl font-bold text-center mb-8">{formattedDate}</h1>

      <Link
        to="/form"
        state={{ date: selectedDate }}
        className="fixed top-8 right-6 bg-green-400 text-white w-12 h-12 flex items-center justify-center rounded-full shadow-md"
      >
        <span className="text-2xl">+</span>
      </Link>

      {/* ローディング中の場合 */}
      {loading ? (
        <div className="p-4 bg-white rounded-lg shadow text-center">ロード中...</div>
      ) : (
        // イベントがある場合
        <>
          {events.length > 0 ? (
            <ul className="space-y-4">
              {events.map((event) => (
                <li 
                  key={event.id} 
                  className="border p-4 rounded-md shadow-md bg-white" 
                  onClick={() => handleEventClick(event.id)}
                >
                  <div className="flex justify-between space-x-2 mb-2">
                    <h2 className="text-xl font-semibold">{event.eventName}</h2>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{event.description}</p>
                  <div className="flex justify-end mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" class="size-3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    <p className="text-xs text-gray-500">{event.venue}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center">該当するイベントがありません。</p>
          )}
        </>
      )}
    </div>
  );
};

export default EventListPage;
