import React from "react";

const Card = () => {
  return (
    <>
      <section className="pt-20 lg:pt-[120px] pb-10 lg:pb-20 h-full bg-[#F3F4F6]">
        <div className="container grid sm:grid-cols-2 lg:grid-cols-3 gap-12 mt-12">
          <SingleCard
            image="https://i.ibb.co/0nbbWM9/image-02-1.jpg"
            CardTitle=" Torneos"
            titleHref="/tournaments"
            btnHref="/tournaments"
            CardDescription=" Historial de torneos jugados"
            Button="Ver Mas"
          />
          <SingleCard
            image="https://i.ibb.co/dL9fH7N/image-03-1.jpg"
            CardTitle=" Jugadores"
            titleHref="/players"
            btnHref="/players"
            CardDescription=" El éxito llega para todos aquellos que están ocupados buscándolo. -Henry Thoreau"
            Button="Ver Mas"
          />
          <SingleCard
            image="https://i.ibb.co/r2zns1m/image-01.jpg"
            CardTitle=" Estadisticas"
            titleHref="/#"
            btnHref="/#"
            CardDescription=" Estadisticas de cada jugador"
            Button="Ver Mas"
          />
        </div>
      </section>
    </>
  );
};

export default Card;

const SingleCard = ({
  image,
  Button,
  CardDescription,
  CardTitle,
  titleHref,
  btnHref,
}) => {
  return (
    <>
      {/*  */}
      <div className="overflow-hidden bg-white rounded-lg ">
        <img src={image} alt="" className="w-full" />
        <div className="p-8 text-center sm:p-9 md:p-7 xl:p-9">
          <h3>
            <a
              href={titleHref ? titleHref : "/#"}
              className="mb-4 block text-xl font-semibold text-dark hover:text-primary sm:text-[22px] md:text-xl lg:text-[22px] xl:text-xl 2xl:text-[22px]"
            >
              {CardTitle}
            </a>
          </h3>
          <p className="text-base leading-relaxed mb-7 text-body-color">
            {CardDescription}
          </p>

          {Button && (
            <a
              href={btnHref ? btnHref : "#"}
              className="inline-block rounded-full border border-[#E5E7EB] py-2 px-7 text-base font-medium text-body-color transition hover:border-primary hover:bg-primary hover:text-white"
            >
              {Button}
            </a>
          )}
        </div>
      </div>
      {/*  */}
    </>
  );
};
