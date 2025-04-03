import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { format, addDays } from "date-fns";
import { auth, signOut, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const Top = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  // ログイン状態を監視
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user); // ユーザーのログイン状態をセット
    });
    return () => unsubscribe();
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
      setShowLogoutModal(true);
      
      setTimeout(() => {
        setShowLogoutModal(false); // 2秒後に非表示
        navigate("/");
      }, 1100);
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  return (
    <div className="min-h-svh p-4 bg-gray-100 text-gray-900 relative">
      {/* ログアウトモーダル */}
      {showLogoutModal && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg text-center">ログアウトしました</p>
          </div>
        </div>
      )}

      {/* ログイン中のみログアウトボタンを表示 */}
      {user && (
        <button
          onClick={handleLogout}
          className="absolute top-4 left-1 flex items-center py-2 px-4"
        >
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
      )}

      <h1 className="text-3xl text-center mt-4 mb-4">いべんたぐらむ</h1>

      <p className="text-xs text-center mb-2">日付からイベントを検索</p>
      <p className="text-xs text-center mb-4">まずは暇な日をタップ</p>

      {/* FullCalendar コンポーネント */}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={new Date()}
        headerToolbar={{
          left: "prev",
          center: "title",
          right: "next",
        }}
        events={events}
        dateClick={handleDateClick}
        locale="ja"
        height="auto"
        dayCellContent={(args) => args.date.getDate()}
        fixedWeekCount={false}
      />

      {/* ログインしているユーザーのみイベント登録ボタンを表示 */}
      {user ? (
        <Link
          to="/form"
          className="fixed top-8 right-4 bg-green-400 text-white w-12 h-12 flex items-center justify-center rounded-full shadow-md"
        >
          <span className="text-2xl">+</span>
        </Link>
      ) : (
        <p className="text-sm text-center mt-4 text-red-800">
          ※イベントの登録・コメントは
          <Link to="/login" className="text-blue-500">ログイン</Link>が必要です
        </p>
      )}
    </div>

    
  );
};

export default Top;