import React, { useState } from "react";
import Modal from "react-modal";

const AddEntityModal = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const customStyles = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
    },
  };
  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Agregar nuevo
      </button>
      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        style={customStyles}
        ariaHideApp={false}
      >
        {/* <h1>Agregar</h1> */}
        {children}
        {/* <button onClick={() => setIsOpen(false)}>Cerrar</button> */}
        <button
          //  disabled={isLoading}
          className="bg-blue-400 w-fit px-7 py-2 rounded-lg disabled:bg-gray-700"
          onClick={() => setIsOpen(false)}
        >
          Cerrar
        </button>
      </Modal>
    </div>
  );
};
export default AddEntityModal;
