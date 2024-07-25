import React from "react";
import Card from "./Card";

const HomeComponent = () => {
  return (
    <section>
      <div className="container grid sm:grid-cols-2 lg:grid-cols-3 gap-12 mt-12">
        <Card
          containerStyle="bg-gradient-to-r from-green-200 to-green-500"
          title="Torneos"
          titleHref="/tournaments"
          description=" Historial de torneos jugados"
        />
        <Card
          containerStyle="bg-gradient-to-r from-yellow-200 via-green-200 to-green-300"
          title="Jugadores"
          titleHref="/players"
          description=" El éxito llega para todos aquellos que están ocupados buscándolo. -Henry Thoreau"
        />
        <Card
          containerStyle="bg-gradient-to-r from-sky-400 to-cyan-300"
          title="Estadisticas"
          titleHref="/#"
          description="Estadisticas de cada jugador"
        />
      </div>
    </section>
  );
};

export default HomeComponent;
