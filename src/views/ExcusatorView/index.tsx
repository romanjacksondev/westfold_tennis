/** @format */

"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const subjects = [
  "Capo",
  "Jefe",
  "Amigo",
  "Compadre",
  "Muchachos",
  "Mis panas",
  "Hombres del senado",
];
const actions = [
  "hoy no podre ganar",
  "mañana no iré",
  "esta semana estaré ausente",
  "necesito un favor",
  "no puedo asistir al proximo ATP",
  "no puedo jugar el torneo",
  "no puedo jugar el partido",
  "no puedo jugar la batalla",
  "esta noche no puedo",
  "no puedo ir a la fiesta del tenis",
  "se me complica ir a la fiesta del tenis",
];
const reasons = [
  "la nena tiene fiebre",
  "tengo una emergencia",
  "me voy de viaje",
  "estoy muy ocupado",
  "tengo que trabajar",
  "la jefa se plantó",
  "la jefa me necesita",
  "mi niña me necesita",
  "mi niño me necesita",
  "mi hijo me robo la raqueta",
];

export default function ExcusatorView() {
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [action, setAction] = useState("");
  const [reason, setReason] = useState("");

  const generatePhrase = () => {
    if (subject && action && reason) {
      return `${subject}, ${action} porque ${reason}`;
    }
    return "Por favor, selecciona una opción de cada menú desplegable.";
  };

  const sendToWhatsApp = () => {
    const phrase = generatePhrase();
    if (subject && action && reason) {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(phrase)}`;
      window.open(whatsappUrl, "_blank");
    } else {
      alert("Por favor, selecciona una opción de cada menú desplegable.");
    }
  };

  const handleGenerateRandom = () => {
    setIsLoading(true);
    setTimeout(() => {
      const randomSubject =
        subjects[Math.floor(Math.random() * subjects.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const randomReason = reasons[Math.floor(Math.random() * reasons.length)];

      setSubject(randomSubject);
      setAction(randomAction);
      setReason(randomReason);
      setIsLoading(false);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <Select onValueChange={setSubject}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Selecciona sujeto" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setAction}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Selecciona acción" />
          </SelectTrigger>
          <SelectContent>
            {actions.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p>porque</p>
        <Select onValueChange={setReason}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Selecciona razón" />
          </SelectTrigger>
          <SelectContent>
            {reasons.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-lg font-medium">{generatePhrase()}</div>

      <div className="flex gap-4">
        <button
          onClick={handleGenerateRandom}
          className="px-4 py-2 text-black rounded border bg-success hover:bg-green-600"
          disabled={isLoading}
        >
          {isLoading
            ? "Consuming server electricity for you..."
            : "Generate random SHIT right now!"}
        </button>
        <button
          onClick={sendToWhatsApp}
          className="px-4 py-2 text-black rounded border bg-success hover:bg-green-600"
          disabled={isLoading}
        >
          Enviar a WhatsApp
        </button>
      </div>
    </div>
  );
}
