import { useState } from "react";
import { useActions } from "store/actions";
import { useSelectors } from "store/selectors";
import SedesTemplate from "./Sedes.template";

const SedesView = () => {
  // const records = [
  //   {
  //     id: 1,
  //     name: "La Rotonda",
  //     points: 250,
  //     phone: "11-1234-5678",
  //     address: "calle falsa"
  //   },    {
  //     id: 2,
  //     name: "Solanas",
  //     points: 500,
  //     phone: "11-1234-5678",
  //     address: "calle falsa"
  //   },
  //   {
  //     id: 3,
  //     name: "Castelar",
  //     points: 250,
  //     phone: "11-1234-5678",
  //     address: "calle falsa"
  //   },
  //   {
  //     id: 4,
  //     name: "Hidden Court",
  //     points: 250,
  //     phone: "11-1234-5678",
  //     address: "calle falsa"
  //   },
  //   {
  //     id: 5,
  //     name: "Ramos Mejia",
  //     points: 250,
  //     phone: "11-1234-5678",
  //     address: "calle falsa"
  //   },
  //   {
  //     id: 6,
  //     name: "Kauri Club",
  //     points: 500,
  //     phone: "11-1234-5678",
  //     address: "calle falsa"
  //   },
  //   {
  //     id: 7,
  //     name: "Hindu Club",
  //     points: 1000,
  //     phone: "11-1234-5678",
  //     address: "calle falsa"
  //   },
  // ];

  const { venues } = useSelectors()
  
  return (
    <SedesTemplate venues={venues}></SedesTemplate>
  );



};

export default SedesView;
