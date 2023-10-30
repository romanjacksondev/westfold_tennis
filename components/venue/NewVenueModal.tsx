import React, { useEffect, useRef, useState } from "react";
import NewVenueForm from "./NewVenueForm";
import ButtonAddNew from "../ButtonAddNew";

const NewVenueModal = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const trigger = useRef(null);
  const modal = useRef(null);
  const [data, setData] = useState();

  const handleNewVenue = async () => {
    const res = await fetch("/api/new_venue", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.status === 200) {
      setModalOpen(false);
    }
  };

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!modal.current) return;
      if (
        !modalOpen ||
        modal.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setModalOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!modalOpen || keyCode !== 27) return;
      setModalOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <>
      <div className="container mx-auto">
        <ButtonAddNew
          trigger={trigger}
          text="Agregar nuevo"
          setter={setModalOpen}
        />
        <div
          className={`fixed top-0 left-0 flex h-full min-h-screen w-full items-center justify-center bg-black bg-opacity-90 px-4 py-5 ${
            modalOpen ? "block" : "hidden"
          }`}
        >
          <div
            ref={modal}
            onFocus={() => setModalOpen(true)}
            className="w-full max-w-[570px] rounded-[20px] bg-white py-12 px-8 text-center md:py-[60px] md:px-[70px]"
          >
            <h3 className="pb-2 text-xl font-bold text-dark sm:text-2xl">
              Agregar Jugador
            </h3>
            <span
              className={`mx-auto mb-6 inline-block h-1 w-[90px] rounded bg-primary`}
            ></span>
            <NewVenueForm setter={setData} />

            <div className="flex flex-wrap -mx-3">
              <div className="w-1/2 px-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="block w-full rounded-lg border border-[#E9EDF9] p-3 text-center text-base font-medium text-dark transition hover:border-red-600 hover:bg-red-600 hover:text-white"
                >
                  Cancelar
                </button>
              </div>
              <div className="w-1/2 px-3">
                <button
                  onClick={() => handleNewVenue()}
                  className={`block w-full p-3 text-base font-medium text-center text-black hover:bg-green-600 transition border rounded-lg border-primary bg-primary hover:bg-opacity-90`}
                >
                  <a href={`/venues`}> Agregar </a>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewVenueModal;
