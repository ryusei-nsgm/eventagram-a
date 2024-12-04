import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, doc, getDoc, addDoc, query, orderBy, getDocs } from "firebase/firestore";

const EventDetailPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [name, setName] = useState(""); // コメントを入力した人の名前

  // イベント一覧の日付を受け取り開催日の初期値に設定
  const location = useLocation();
  const passedDate = location.state?.date ? new Date(location.state.date) : null;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "events", eventId));
        if (eventDoc.exists()) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() });
        } else {
          console.error("イベントが見つかりません");
        }
      } catch (error) {
        console.error("イベントの取得中にエラー:", error);
      }
    };

    const fetchComments = async () => {
      try {
        const commentsQuery = query(
          collection(db, `events/${eventId}/comments`),
          orderBy("createdAt", "asc")
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        const commentsData = commentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(commentsData);
      } catch (error) {
        console.error("コメントの取得中にエラー:", error);
      }
    };

    fetchEvent();
    fetchComments();
  }, [eventId]);

  const handleCommentSubmit = async () => {
    if (newComment.trim() === "") return;
    try {
      const commentName = name.trim() === "" ? "匿名" : name;
      await addDoc(collection(db, `events/${eventId}/comments`), {
        name: commentName,
        text: newComment.trim(),
        createdAt: new Date(),
      });

      setNewComment(""); // 入力値をリセット
      setName(""); // 名前をリセット
      const commentsQuery = query(
        collection(db, `events/${eventId}/comments`),
        orderBy("createdAt", "asc")
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      const commentsData = commentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setComments(commentsData); // コメントを再取得
    } catch (error) {
      console.error("コメントの送信中にエラー:", error);
    }
  };

  // イベント一覧画面の戻り先URL
  const backUrl = passedDate
    ? `/events/${passedDate.toISOString().split("T")[0].slice(0, 10)}` : `/`;

  return (
    <div className="min-h-screen p-4 bg-gray-100 text-gray-900">
      <Link to={backUrl} className="text-gray-800 hover:text-blue-700 text-lg">
        <span className="mr-2">&lt;</span>
      </Link>

      {event ? (
        <div className="p-6 bg-white rounded-lg shadow-md mt-4">
          {/* イベント名とリンクアイコン */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold">{event.eventName}</h1>
            {event.link && (
              <a
                href={event.link}
                target="_blank"
                  rel="noopener noreferrer"
                className=" text-blue-500 hover:text-blue-700 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                  />
                </svg>
              </a>
            )}
          </div>

          {/* 場所と開催日程 */}
          <div className="flex justify-between space-x-2 text-sm text-gray-600">
            <div className="flex justify-end">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <p>{event.venue}</p>
            </div>
            <div className="flex flex-col items-end">
              <span>{event.startDate?.toDate().toLocaleDateString("ja-JP")}</span>
              {event.startDate.toDate().toLocaleDateString("ja-JP") !== event.endDate.toDate().toLocaleDateString("ja-JP") && (
                <>
                  <span>~{event.endDate.toDate().toLocaleDateString("ja-JP")}</span>
                </>
              )}
            </div>
          </div>

          {/* 詳細 */}
          <div className="mt-3 mb-2 p-4 border-l-4 border-green-500 bg-gray-50">
            <div className="flex items-start space-x-2 text-sm">
              <p className="text-gray-700">{event.description}</p>
            </div>
          </div>
        </div>
      ) : (
        <p>読み込み中...</p>
      )}

      <div className="mt-8">  
        <h2 className="text-l font-bold mb-2">コメント</h2>
        <div className="p-2 max-h-80 overflow-y-auto ">
          <ul className="space-y-2">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <li key={comment.id} className="relative bg-white border p-4 rounded-md shadow-md">
                  <p className="text-gray-800 text-sm">{comment.text}</p>
                  <p className="font-bold text-right text-xs">{comment.name}</p>
                  <div className="absolute right-2 bottom-[-8px] w-0 h-0 border-t-[12px] border-t-white border-l-[12px] border-l-transparent"></div>
                </li>
              ))
            ) : (
              <li className="p-4 bg-gray-100">まだコメントがありません。</li>
            )}
          </ul>
        </div>
      </div>

      {/* コメント入力フォーム */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="コメントを入力... ※140字以内"
          className="flex-1 border rounded-lg p-2 focus:outline-none sm:max-w-xs resize-none overflow-auto"
          rows={1}
          maxLength="140"
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`}}
          required
        />
        <div className="flex items-center">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="名前を入力..."
            className="flex-1 border rounded-lg p-2 focus:outline-none"
            maxLength="10"
            required
          />
          <button
            onClick={handleCommentSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
