import React, { useState } from "react";
import { auth, signInWithEmailAndPassword } from "../firebase";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // メールアドレスでのログイン
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/"); // ログイン成功後トップページに移動
    } catch (error) {
      console.error("ログインエラー:", error);
      setError("メールアドレスまたはパスワードが正しくありません。");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h1 className="text-3xl text-center mt-4 mb-8">いべんたぐらむ</h1>

        {/* メールアドレスログインフォーム */}
        <form onSubmit={handleEmailLogin}>
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
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition"
          >
            ログイン
          </button>
        </form>

        <p className="text-center mt-4">
          新規ユーザーですか？ <a href="/signup" className="text-blue-500">サインアップ</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
