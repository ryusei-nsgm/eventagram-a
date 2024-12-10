import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { format, addDays } from "date-fns";
import { auth, signOut, db } from "../firebase"; // Firestoreのインポート
import { collection, getDocs } from "firebase/firestore"; // Firestoreのデータ取得

const Top = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  // Firestoreからイベントを取得
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            start: format(data.startDate.toDate(), "yyyy-MM-dd"),
            end: format(addDays(data.endDate.toDate(), 1), "yyyy-MM-dd"),
            color: "#98fb98",
            display: 'background'
          };
        });
        setEvents(eventData);
      } catch (error) {
        console.error("イベント取得エラー:", error);
      }
    };
  
    fetchEvents();
  }, []);

  // 日付をクリックしたときの処理
  const handleDateClick = (info) => {
    const formattedDate = format(info.date, "yyyy-MM-dd");
    navigate(`/events/${formattedDate}`);
  };

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100 text-gray-900 relative">
      {/* ログアウトボタン */}
      <button
        onClick={handleLogout}
        className="absolute top-4 left-1 flex items-center py-2 px-4"
      >
        {/* ログアウトアイコン */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
          />
        </svg>
      </button>

      <h1 className="text-3xl text-center mt-4 mb-4">いべんたぐらむ</h1>

      <Link
        to="/form"
        className="fixed top-8 right-4 bg-green-400 text-white w-12 h-12 flex items-center justify-center rounded-full shadow-md"
      >
        <span className="text-2xl">+</span>
      </Link>

      <p className="text-xs text-center mb-2">日付からイベントを検索</p>
      <p className="text-xs text-center mb-4">まずは暇な日をタップ</p>

      {/* FullCalendar コンポーネント */}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={new Date()}
        businessHours={{ daysOfWeek: [1, 2, 3, 4, 5] }}
        headerToolbar={{
          left: "prev",
          center: "title",
          right: "next",
        }}
        events={events}
        dateClick={handleDateClick}
        locale="ja"
        height="auto"
      />
    </div>
  );
};

export default Top;
