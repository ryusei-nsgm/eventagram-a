import React, { useEffect, useState, useContext } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, doc, getDoc, addDoc, deleteDoc, query, orderBy, getDocs } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";

const EventDetailPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [name, setName] = useState(""); // コメントを入力した人の名前
  const { currentUser } = useContext(AuthContext);
  const uid = currentUser?.uid; 
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState(null);

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
        uid,
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

  const handleDeleteEvent = async () => {
    try {
      // イベントに関連するすべてのコメントを取得
      const commentsQuery = query(collection(db, `events/${eventId}/comments`));
      const commentsSnapshot = await getDocs(commentsQuery);
  
      // すべてのコメントを削除
      const deleteCommentPromises = commentsSnapshot.docs.map((commentDoc) =>
        deleteDoc(commentDoc.ref)
      );
      await Promise.all(deleteCommentPromises);
  
      // イベントを削除
      await deleteDoc(doc(db, "events", eventId));
      setShowModal(false);
      navigate(backUrl);
    } catch (error) {
      console.error("イベントの削除中にエラー:", error);
      alert("イベントの削除に失敗しました。");
    }
  };

  const handleDeleteCommentClick = (commentId) => {
    setDeleteCommentId(commentId);
    setShowDeleteCommentModal(true);
  };

  const handleDeleteComment = async (commentId) => {
    if (!deleteCommentId) return;
    try {
      await deleteDoc(doc(db, `events/${eventId}/comments`, deleteCommentId));
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
      setShowDeleteCommentModal(false);
    } catch (error) {
      console.error("コメントの削除中にエラー:", error);
      alert("コメントの削除に失敗しました。");
    }
  };

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
                className="bg-blue-400 py-2 px-2 rounded-md flex items-center space-x-2 shadow-md"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="white"
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
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" class="size-5">
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
            <div className="flex items-start space-x-2 text-sm whitespace-pre-wrap">
              <p className="text-gray-700 ">{event.description}</p>
            </div>
          </div>

          <div className="flex justify-between mt-2">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <p className="text-sm">{event.organizer}</p>
            </div>

            {currentUser?.uid === event.uid && ( // ユーザーが投稿者の場合のみ削除ボタンを表示
              <div className="flex justify-end space-x-2">
                {/* 編集 */}
                <button onClick={() => navigate(`/event/edit/${eventId}`)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="blue" class="size-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </button>
                {/* 削除 */}
                <button onClick={() => setShowModal(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="red" class="size-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          </div>
      ) : (
        <p>読み込み中...</p>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">削除確認</h2>
            <p className="text-gray-700 mb-6">このイベントを削除しますか？</p>
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setShowModal(false)}
              >
                キャンセル
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => handleDeleteEvent()}
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 mb-28">  
        <h2 className="text-l font-bold mb-2">コメント</h2>
        <div className="p-2 max-h-80 overflow-y-auto whitespace-pre-wrap">
          <ul className="space-y-2">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <li key={comment.id} className="relative bg-white border p-4 rounded-md shadow-md">
                  <p className="text-gray-800 text-sm break-words">{comment.text}</p>
                  <div className="flex justify-end mt-2">
                    <p className="font-bold text-right text-xs">{comment.name}</p>
                    {comment.uid === uid && ( // ユーザーが投稿者の場合のみ削除ボタンを表示
                      <button
                        onClick={() => handleDeleteCommentClick(comment.id)}
                        className="ml-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="red" class="size-4">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="absolute right-2 bottom-[-8px] w-0 h-0 border-t-[12px] border-t-white border-l-[12px] border-l-transparent"></div>
                </li>
              ))
            ) : (
              <li className="p-4 bg-gray-100">まだコメントがありません。</li>
            )}
          </ul>
        </div>
      </div>

      {showDeleteCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">コメント削除確認</h2>
            <p className="text-gray-700 mb-6">このコメントを削除しますか？</p>
            <div className="flex justify-end space-x-4">
              <button onClick={() => setShowDeleteCommentModal(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                キャンセル
              </button>
              <button onClick={handleDeleteComment} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* コメント入力フォーム */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-2 border-t flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
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
