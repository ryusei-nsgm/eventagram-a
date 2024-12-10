import React, { useState } from "react";
import { auth, createUserWithEmailAndPassword } from "../firebase";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false); // モーダルの表示状態

  // パスワードのバリデーション
  const validatePassword = (password) => {
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return regex.test(password); // 6文字以上、英字と数字を含む
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    // パスワードの一致確認
    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    // パスワードのバリデーション
    if (!validatePassword(password)) {
      setError("パスワードは6文字以上で、英字と数字を含める必要があります");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setShowModal(true); // サインアップ成功後にモーダルを表示
    } catch (error) {
      console.error("サインアップエラー:", error);
      setError("サインアップに失敗しました。");
    }
  };

  // モーダルを閉じてログイン
  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/login"); // モーダルを閉じた後、ログインページに遷移
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h1 className="text-3xl text-center mt-4 mb-8">サインアップ</h1>

        <form onSubmit={handleSignup}>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <div className="mb-4">
            <input
              type="email"
              placeholder="メールアドレス"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="パスワード"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="パスワード（確認）"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition"
          >
            サインアップ
          </button>
        </form>

        <p className="text-xs text-center mt-4 text-gray-500">
          パスワードは6文字以上で、英字と数字を含める必要があります。
        </p>
      </div>

      {/* モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-md w-96">
            <h2 className="text-xl text-center mb-4">登録完了</h2>
            <p className="text-center mb-4">アカウントの作成が成功しました。</p>
            <button
              onClick={handleCloseModal}
              className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition"
            >
              ログイン
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;
