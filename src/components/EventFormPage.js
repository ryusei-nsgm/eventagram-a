import React, { useState, useContext, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc, collection, addDoc, Timestamp } from "firebase/firestore";
import { registerLocale } from "react-datepicker";
import ja from "date-fns/locale/ja";
import Modal from './Modal';
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

registerLocale("ja", ja);

const EventFormPage = () => {
  const { eventId } = useParams(); // 編集時に使用するイベントID
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const uid = currentUser?.uid;

  const [eventName, setEventName] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState(null);
  const [useEndDate, setUseEndDate] = useState(false);
  const [link, setLink] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      if (eventId) {
        try {
          const docRef = doc(db, "events", eventId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setEventName(data.eventName || "");
            setVenue(data.venue || "");
            setDescription(data.description || "");
            setStartDate(data.startDate.toDate() || null);
            setEndDate(data.endDate?.toDate() || null);
            setUseEndDate(!!data.endDate);
            setLink(data.link || "");
            setOrganizer(data.organizer || "");
          }
        } catch (error) {
          console.error("Error fetching event data: ", error);
        }
      }
    };

    fetchEventData();
  }, [eventId]);

  useEffect(() => {
    const checkUser = () => {
      // 匿名ユーザーの場合、トップへリダイレクト
      if (auth.currentUser && auth.currentUser.isAnonymous) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  // イベント一覧の日付を受け取り開催日の初期値に設定
  const location = useLocation();
  const passedDate = location.state?.date ? new Date(location.state.date) : null;
  const [startDate, setStartDate] = useState(passedDate || null);

  const createdAt = new Date();
  const updatedAt = new Date();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!uid) {
      setModalMessage('ログインが必要です');
      setShowModal(true);
      return;
    }

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
      uid,
    };

    try {
      if (eventId) {
        // 編集モード：イベントを更新
        const docRef = doc(db, "events", eventId);
        await updateDoc(docRef, eventData);
        setModalMessage("イベントの更新が完了しました！");
        navigate(`/event/${docRef.id}`);
      } else {
        // 登録モード：新規イベントを作成
        eventData.createdAt = new Date();
        const docRef = await addDoc(collection(db, "events"), eventData);
        setModalMessage("イベントの登録が完了しました！");
        navigate(`/event/${docRef.id}`);
      }
      setShowModal(true);
    } catch (error) {
      console.error("Error saving event: ", error);
      setModalMessage("イベントの保存に失敗しました");
      setShowModal(true);
    }
  };

  // イベント一覧画面の戻り先URL
  const backUrl = startDate
    ? `/events/${startDate.toISOString().split("T")[0].slice(0, 10)}`
    : `/`;

  return (
    <div className="min-h-svh p-4 bg-gray-100 text-gray-900">
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
            maxLength={30}
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
            maxLength={20}
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
            required
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
            maxLength={2000}
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
            maxLength={10}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          {eventId ? "更新" : "登録"}
        </button>
      </form>
      {showModal && (
        <Modal message={modalMessage} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default EventFormPage;
