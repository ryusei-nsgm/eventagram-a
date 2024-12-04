import React from "react";
import { useNavigate, Link } from "react-router-dom";
import FullCalendar from "@fullcalendar/react"; // FullCalendarのインポート
import dayGridPlugin from "@fullcalendar/daygrid"; // 日付表示のためのプラグイン
import interactionPlugin from '@fullcalendar/interaction';
import { format } from "date-fns"; // 日付フォーマット用

const Top = () => {
  const navigate = useNavigate();

  // 日付をクリックしたときにその日付のイベント一覧ページに遷移する処理
  const handleDateClick = (info) => {
    const formattedDate = format(info.date, "yyyy-MM-dd"); // yyyy-MM-dd形式で日付をフォーマット
    navigate(`/events/${formattedDate}`); // 選択した日付のイベント一覧ページに遷移
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100 text-gray-900">
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
        plugins={[dayGridPlugin, interactionPlugin]} // 日付グリッド表示プラグイン
        initialView="dayGridMonth"
        initialDate={new Date()}
        businessHours={{ daysOfWeek: [1, 2, 3, 4, 5] }}
        headerToolbar={{
          left: "prev",
          center: "title",
          right: "next",
        }}
        events={[]}
        dateClick={handleDateClick}
        locale="ja"
        height="auto"
      />
    </div>
  );
};

export default Top;
