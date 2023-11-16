import { randomUUID } from "node:crypto"
import { sql } from './db.js'

export class DatabasePostgres {
  async list() {
    const videos = await sql`select * from videos`

    return videos
  }
  // ###

  async create(video) {
    const videoId = randomUUID()
    const {title, name, price} = video

    await sql`insert into videos (id, title, name, price) VALUES (${videoId}, ${title}, ${name}, ${price})`
  }
    // ###

  async update(id, video) {
    const { title, name, price } = video

    await sql`update videos set title = ${title}, name = ${name}, price = ${price} WHERE id = ${id}`
  }

  async delete(id) {
    await sql`delete from videos where id = ${id}`
  }
}
