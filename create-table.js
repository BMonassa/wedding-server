import { sql } from './db.js'

// sql`DROP TABLE IF EXISTS videos;
// `.then(() => {
//   console.log('Tabela apagada!')
// })

// COMANDO - node create-table.js

sql`
  CREATE TABLE videos (
    id          TEXT PRIMARY KEY,
    title       TEXT,
    name        TEXT,
    description TEXT,
    price       FLOAT
  );
`.then(() => {
  console.log('Tabela criada!')
})

// sql`
//   CREATE TABLE videos (
//     id          TEXT PRIMARY KEY,
//     title       TEXT,
//     description TEXT,
//     duration    INTEGER
//   );
// `.then(() => {
//   console.log('Tabela criada!')
// })

// node create-table.js
