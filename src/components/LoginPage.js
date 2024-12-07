import React from "react";
import { auth, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await setPersistence(auth, browserLocalPersistence); // 永続性の設定
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/"); // ログイン成功後トップページに移動
    } catch (error) {
      console.error("ログインエラー:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h1 className="text-3xl text-center mt-4 mb-8">いべんたぐらむ</h1>
        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center w-full py-2 px-4 mb-4 bg-white text-gray-700 font-semibold rounded-md shadow border border-gray-300 hover:bg-gray-100 transition"
        >
          <FaGoogle className="mr-2 text-red-500" />
          <span>Googleでログイン</span>
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
