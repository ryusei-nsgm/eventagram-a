import React from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="min-h-screen p-4 bg-gray-20 text-gray-900">
      <h1 className="text-3xl font-bold text-center mb-8">いべんたぐらむ</h1>
      
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
        events={[]} // TODO: Firebaseに登録されているイベントを格納
        dateClick={handleDateClick}
        locale="ja"
        height="auto"
      />
    </div>
  );
};

export default Top;
