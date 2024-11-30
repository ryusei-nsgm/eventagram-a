import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { registerLocale } from "react-datepicker";
import ja from "date-fns/locale/ja";
import Modal from './Modal';

registerLocale("ja", ja);

const EventFormPage = () => {
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [useEndDate, setUseEndDate] = useState(false);

  const [link, setLink] = useState("");
  const [organizer, setOrganizer] = useState("");

  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const createdAt = new Date();
  const updatedAt = new Date();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eventData = {
      eventName,
      description,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: useEndDate && endDate ? endDate.toISOString() : null,
      link,
      organizer: organizer || "匿名",
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };

    try {
      const docRef = await addDoc(collection(db, "events"), eventData);
      setModalMessage('イベントの登録が完了しました！');
      setShowModal(true);

      // フォームのリセット
      setEventName("");
      setDescription("");
      setStartDate(null);
      setEndDate(null);
      setUseEndDate(false);
      setLink("");
      setOrganizer("");
    } catch (error) {
      console.error("Error adding document: ", error);
      setModalMessage('イベントの登録に失敗しました');
      setShowModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-lg w-full max-w-lg"
      >
        <h2 className="text-xl font-bold mb-4">イベントを登録</h2>

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

        {/* 詳細 */}
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-gray-700 font-medium"
          >
            詳細
          </label>
          <textarea
            id="description"
            className="border rounded w-full p-2 mt-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={140}
          />
        </div>

        {/* 開催日と終了日 */}
        <div className="flex items-center space-x-4 mb-4">
          {/* 開催日 */}
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

          {/* 終了日 */}
          <div className="flex-1">
            <div className="flex items-center mb-2">
              {/* トグルボタン */}
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
              disabled={!useEndDate}
              popperPlacement="bottom-start"
            />
          </div>
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
