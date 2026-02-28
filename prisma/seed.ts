import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { env } from 'prisma/config';
import { PrismaClient } from './generated/client';

console.log(env('DATABASE_URL'));
const adapter = new PrismaPg({ connectionString: env('DATABASE_URL') });
const prisma = new PrismaClient({ adapter });
async function main() {
  // Surface
  await prisma.surface.createMany({
    data: [
      { id: 'cm0qwm6ms000hvrlwthck3qnl', name: 'Cemento' },
      { id: 'cm0qwm6ms000ivrlw8agewmcl', name: 'Polvo de Ladrillo' },
      { id: 'cm0qwm6ms000jvrlwljnii7jt', name: 'Cesped' },
      { id: 'cm0qwm6ms000kvrlwxp2uikq1', name: 'Hielo' },
    ],
    skipDuplicates: true,
  });

  // TournamentCategory
  await prisma.tournamentCategory.createMany({
    data: [
      { id: 'cm0qw9bgc0000vrlwjpboyw9y', name: 'Master 1000' },
      { id: 'cm0qwclkq0005vrlwh9f41qqp', name: 'Humolabs Grand Prix' },
      { id: 'cm0qwclkr0006vrlwrlwb9olj', name: 'Grand Slam' },
      { id: 'cm0qwclkr0007vrlwur23q9zi', name: 'ATP 250' },
      { id: 'cm0qwclkr0008vrlwu3y61kg2', name: 'ATP 500' },
    ],
    skipDuplicates: true,
  });

  // TournamentCategoryPoints
  await prisma.tournamentCategoryPoints.createMany({
    data: [
      {
        id: 'cm0qwf63b0009vrlwszm1ip9n',
        initial_position: 1,
        final_position: 1,
        points: 2000,
        tournamentCategoryId: 'cm0qwclkr0006vrlwrlwb9olj',
      },
      {
        id: 'cm0qwf63b000avrlwmmx2j1ty',
        initial_position: 2,
        final_position: 2,
        points: 1300,
        tournamentCategoryId: 'cm0qwclkr0006vrlwrlwb9olj',
      },
      {
        id: 'cm0qwf63b000bvrlwxbx2ldlr',
        initial_position: 3,
        final_position: 4,
        points: 800,
        tournamentCategoryId: 'cm0qwclkr0006vrlwrlwb9olj',
      },
      {
        id: 'cm0qwf63b000cvrlwbizf3mgz',
        initial_position: 5,
        final_position: 8,
        points: 400,
        tournamentCategoryId: 'cm0qwclkr0006vrlwrlwb9olj',
      },
      {
        id: 'cm0qwihmn000dvrlw6vlp473n',
        initial_position: 3,
        final_position: 4,
        points: 400,
        tournamentCategoryId: 'cm0qw9bgc0000vrlwjpboyw9y',
      },
      {
        id: 'cm0qwihmn000evrlwdougzz83',
        initial_position: 5,
        final_position: 8,
        points: 200,
        tournamentCategoryId: 'cm0qw9bgc0000vrlwjpboyw9y',
      },
      {
        id: 'cm0qwihmn000fvrlw8s79ss7f',
        initial_position: 2,
        final_position: 2,
        points: 650,
        tournamentCategoryId: 'cm0qw9bgc0000vrlwjpboyw9y',
      },
      {
        id: 'cm0qwihmn000gvrlwr9f4qc2q',
        initial_position: 1,
        final_position: 1,
        points: 1000,
        tournamentCategoryId: 'cm0qw9bgc0000vrlwjpboyw9y',
      },
      {
        id: 'cm0sgmadh0000vo1jr9ks6ho9',
        initial_position: 1,
        final_position: 1,
        points: 500,
        tournamentCategoryId: 'cm0qwclkr0008vrlwu3y61kg2',
      },
      {
        id: 'cm0sgmadh0001vo1jnl77gi2s',
        initial_position: 2,
        final_position: 2,
        points: 330,
        tournamentCategoryId: 'cm0qwclkr0008vrlwu3y61kg2',
      },
      {
        id: 'cm0sgmadh0002vo1j1rcabl2y',
        initial_position: 3,
        final_position: 4,
        points: 200,
        tournamentCategoryId: 'cm0qwclkr0008vrlwu3y61kg2',
      },
      {
        id: 'cm0sgmadi0003vo1jdm0hb3w2',
        initial_position: 5,
        final_position: 8,
        points: 100,
        tournamentCategoryId: 'cm0qwclkr0008vrlwu3y61kg2',
      },
      {
        id: 'cm0sgnp1c0004vo1jqeuh7h8l',
        initial_position: 1,
        final_position: 1,
        points: 250,
        tournamentCategoryId: 'cm0qwclkr0007vrlwur23q9zi',
      },
      {
        id: 'cm0sgnp1c0005vo1j6i8iyb86',
        initial_position: 2,
        final_position: 2,
        points: 165,
        tournamentCategoryId: 'cm0qwclkr0007vrlwur23q9zi',
      },
      {
        id: 'cm0sgnp1c0006vo1j9slqwyiw',
        initial_position: 3,
        final_position: 4,
        points: 100,
        tournamentCategoryId: 'cm0qwclkr0007vrlwur23q9zi',
      },
      {
        id: 'cm0sgnp1c0007vo1jm6o6hz64',
        initial_position: 5,
        final_position: 8,
        points: 50,
        tournamentCategoryId: 'cm0qwclkr0007vrlwur23q9zi',
      },
      {
        id: 'cm0sgobu00008vo1j9sdrzc9h',
        initial_position: 1,
        final_position: 1,
        points: 5000,
        tournamentCategoryId: 'cm0qwclkq0005vrlwh9f41qqp',
      },
    ],
    skipDuplicates: true,
  });

  // Venue
  await prisma.venue.createMany({
    data: [
      {
        id: 'cm0qv1a620000j11d9xy8jkhu',
        name: 'Solanas',
        phone: '011 4621-9955',
        address: 'Las Tacuaras 2975',
      },
      {
        id: 'cm0qzh9iv0000wrtosnz9ofhj',
        name: 'Kauri Club',
        phone: '011 4659-1734',
        address: 'Triunvirato 1572',
      },
      {
        id: 'cm0sddj4y0020wrto9dgmmpl0',
        name: 'La Rotonda',
        phone: '011 4842-0318',
        address: '25 de Mayo 4090',
      },
      {
        id: 'cm0sddvl80021wrto1u2jw0o9',
        name: 'Club Bomberitos',
        phone: '011 4658-2266',
        address: 'Gral. Acha 131',
      },
      {
        id: 'cm0sdebki0022wrto3jl4g3eu',
        name: 'Sport Tenis Curuchet',
        phone: '011 3519-3730',
        address: 'Curuchet 3000',
      },
      {
        id: 'cm0sdeo900023wrtojvlzbp4s',
        name: 'Hidden Court',
        phone: '011 7075-1616',
        address: 'Melián 7760',
      },
      {
        id: 'cm0sdfm1o0024wrtobz633mem',
        name: 'Hindu Club',
        phone: '011 4741-6150',
        address: 'Av. del Golf',
      },
      {
        id: 'cm1p6cjcq0000nhludzjgbcg4',
        name: 'Club Ganaderos',
        phone: '4623 1160',
        address: 'Costa Rica 286',
      },
      {
        id: 'cm2js0kxd0000nmme3q9gsej4',
        name: 'La Cautiva',
        phone: '011 2396 5949',
        address: 'La Cautiva 7651',
      },
      {
        id: 'cm30p9ave0000gkchxvikobsu',
        name: 'Lawn Tenis Ramos',
        phone: '11111111',
        address: 'Echeverria 361',
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
