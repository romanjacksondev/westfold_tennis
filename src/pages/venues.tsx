import { GetStaticProps } from "next";
import prisma from "../../lib/prisma";
import Venue from "../../components/venue/Venue";

export default function Venues({ venuesList }) {
  return <Venue venuesList={venuesList} />;
}

export const getStaticProps: GetStaticProps = async () => {
  const res = await prisma.venue.findMany();
  const venuesList = JSON.parse(JSON.stringify(res));
  return {
    props: { venuesList },
    revalidate: 1,
  };
};