import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { registerLocale } from "react-datepicker";
import ja from "date-fns/locale/ja";
import Modal from './Modal';
import { useNavigate, useLocation, Link } from "react-router-dom";

registerLocale("ja", ja);

const EventFormPage = () => {
  const [eventName, setEventName] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState(null);
  const [useEndDate, setUseEndDate] = useState(false);
  const [link, setLink] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  // イベント一覧の日付を受け取り開催日の初期値に設定
  const location = useLocation();
  const passedDate = location.state?.date ? new Date(location.state.date) : null;
  const [startDate, setStartDate] = useState(passedDate || null);

  const createdAt = new Date();
  const updatedAt = new Date();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eventData = {
      eventName,
      venue,
      description,
      startDate: Timestamp.fromDate(new Date(startDate)),
      endDate: endDate ? Timestamp.fromDate(new Date(endDate)) : Timestamp.fromDate(new Date(startDate)),
      link,
      organizer: organizer || "匿名",
      createdAt,
      updatedAt,
    };

    try {
      const docRef = await addDoc(collection(db, "events"), eventData);
      setModalMessage('イベントの登録が完了しました！');
      setShowModal(true);
      navigate(`/event/${docRef.id}`);
    } catch (error) {
      console.error("Error adding document: ", error);
      setModalMessage('イベントの登録に失敗しました');
      setShowModal(true);
    }
  };

  // イベント一覧画面の戻り先URL
  const backUrl = startDate
    ? `/events/${startDate.toISOString().split("T")[0].slice(0, 10)}`
    : `/`;

  return (
    <div className="min-h-screen p-4 bg-gray-100 text-gray-900">
      <Link
        to={backUrl}
        className="text-gray-800 hover:text-blue-700 text-lg"
      >
        &lt;
      </Link>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-lg w-full max-w-lg mt-4"
      >
        {/* <h2 className="text-xl font-bold mb-4">イベントを登録</h2> */}

        {/* イベント名 */}
        <div className="mb-4">
          <label htmlFor="eventName" className="block text-gray-700 font-medium">
            イベント名
          </label>
          <input
            id="eventName"
            type="text"
            className="border rounded w-full p-2 mt-2"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
          />
        </div>

        {/* 場所 */}
        <div className="mb-4">
          <label htmlFor="venue" className="block text-gray-700 font-medium">
            場所
          </label>
          <input
            id="venue"
            type="text"
            className="border rounded w-full p-2 mt-2"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            required
          />
        </div>

        {/* 開催日と終了日 */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <label htmlFor="startDate" className="block text-gray-700 font-medium mb-2">
              開催日
            </label>
            <DatePicker
              id="startDate"
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              locale="ja"
              dateFormat="yyyy/MM/dd"
              className="p-2 border rounded w-full"
              popperPlacement="bottom-start"
              required
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center mb-2">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={useEndDate}
                  onChange={() => setUseEndDate(!useEndDate)}
                  id="toggleEndDate"
                />
                <label
                  htmlFor="toggleEndDate"
                  className={`block w-12 h-6 rounded-full cursor-pointer relative transition-colors ${
                    useEndDate ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform ${
                      useEndDate ? "transform translate-x-6" : ""
                    }`}
                  ></span>
                </label>
              </div>
              <label
                htmlFor="toggleEndDate"
                className="ml-2 text-gray-700 font-medium"
              >
                終了日
              </label>
            </div>
            <DatePicker
              id="endDate"
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              locale="ja"
              dateFormat="yyyy/MM/dd"
              className="p-2 border rounded w-full"
              popperPlacement="bottom-start"
              disabled={!useEndDate}
            />
          </div>
        </div>

        {/* 詳細 */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-medium">
            詳細
          </label>
          <textarea
            id="description"
            className="border rounded w-full p-2 mt-2 h-40"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={140}
          />
        </div>

        {/* リンク */}
        <div className="mb-4">
          <label htmlFor="link" className="block text-gray-700 font-medium">
            リンク
          </label>
          <input
            id="link"
            type="url"
            className="border rounded w-full p-2 mt-2"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </div>

        {/* 投稿者 */}
        <div className="mb-4">
          <label htmlFor="organizer" className="block text-gray-700 font-medium">
            投稿者
          </label>
          <input
            id="organizer"
            type="text"
            className="border rounded w-full p-2 mt-2"
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          登録
        </button>
      </form>
      {showModal && (
        <Modal message={modalMessage} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default EventFormPage;
