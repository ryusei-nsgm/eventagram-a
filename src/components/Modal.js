import React from "react";

const Modal = ({ message, onClose, title = "通知" }) => {
  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-1/3">
        <h2 className="text-xl font-bold mb-4 text-center">{title}</h2>
        <p className="text-center">{message}</p>
        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
