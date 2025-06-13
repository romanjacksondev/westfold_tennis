

como hacer backup db
pg_dump --host ep-square-violet-03228723-pooler.us-east-1.postgres.vercel-storage.com --port 5432 --user default verceldb > backup.sql

xOtlz6rZR7Tm

como recuperarlo
psql -h ep-square-violet-03228723-pooler.us-east-1.postgres.vercel-storage.com -U default -d verceldb -f insert.sql


const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync('password1234', salt);

console.log(hashedPassword);