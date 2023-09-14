import React, { useState } from "react";
import Modal from "react-modal";
import ButtonAddNew from "./ButtonAddNew";

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
    <>
      {/* <ButtonAddNew text="Agregar nuevo" setter={setIsOpen}/> */}
      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        style={customStyles}
        ariaHideApp={false}
      >
        {children}
        <button
          className="bg-blue-400 w-fit px-7 py-2 rounded-lg disabled:bg-gray-700"
          onClick={() => setIsOpen(false)}
        >
          Cerrar
        </button>
      </Modal>
    </>
  );
};
export default AddEntityModal;
