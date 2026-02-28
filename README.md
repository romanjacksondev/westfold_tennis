TODO

como hacer backup db
pg_dump --host ep-square-violet-03228723-pooler.us-east-1.postgres.vercel-storage.com --port 5432 --user default verceldb > backup.sql

xOtlz6rZR7Tm

const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync('password1234', salt);

console.log(hashedPassword);

prisma
generate client
npx prisma generate
create schema
npx prisma migrate dev --name XXXXXXX
load seed
px prisma db seed
reset db
npx prisma migrate reset
