import { portfolioSchema } from "../../shared/src/schema.js";
function record(row) {
  return {
    ...row,
    data: portfolioSchema.parse(row.data),
    published_data: row.published_data
      ? portfolioSchema.parse(row.published_data)
      : null,
  };
}
const columns =
  "id, owner_id, title, slug, theme_id, data, is_published, is_indexable, published_at, updated_at, published_data, created_at";
export function createRepository(db) {
  return {
    async list(owner) {
      const result = await db.query(
        "SELECT id,title,slug,theme_id,is_published,is_indexable,published_at,updated_at,created_at FROM public.portfolios WHERE owner_id=$1 ORDER BY updated_at DESC LIMIT 50",
        [owner],
      );
      return result.rows;
    },
    async create(owner, data) {
      const result = await db.query(
        `INSERT INTO public.portfolios (owner_id,title,theme_id,data) SELECT $1,$2,$3,$4::jsonb WHERE (SELECT count(*) FROM public.portfolios WHERE owner_id=$1)<50 RETURNING ${columns}`,
        [
          owner,
          data.identity.name.trim() || "Untitled portfolio",
          data.theme,
          JSON.stringify(data),
        ],
      );
      return result.rows[0] ? record(result.rows[0]) : null;
    },
    async get(id, owner) {
      const result = await db.query(
        `SELECT ${columns} FROM public.portfolios WHERE id=$1 AND owner_id=$2`,
        [id, owner],
      );
      return result.rows[0] ? record(result.rows[0]) : null;
    },
    async save(id, owner, data) {
      const result = await db.query(
        `UPDATE public.portfolios SET title=$3,theme_id=$4,data=$5::jsonb,updated_at=now() WHERE id=$1 AND owner_id=$2 RETURNING ${columns}`,
        [
          id,
          owner,
          data.identity.name.trim() || "Untitled portfolio",
          data.theme,
          JSON.stringify(data),
        ],
      );
      return result.rows[0] ? record(result.rows[0]) : null;
    },
    async publish(id, owner, slug, indexable, expected) {
      const result = await db.query(
        `UPDATE public.portfolios SET slug=$3,is_published=true,is_indexable=$4,published_data=$5::jsonb,published_at=now(),updated_at=now() WHERE id=$1 AND owner_id=$2 AND data=$5::jsonb RETURNING ${columns}`,
        [id, owner, slug, indexable, JSON.stringify(expected)],
      );
      return result.rows[0] ? record(result.rows[0]) : null;
    },
    async unpublish(id, owner) {
      const result = await db.query(
        `UPDATE public.portfolios SET is_published=false,is_indexable=false,published_data=null,published_at=null,updated_at=now() WHERE id=$1 AND owner_id=$2 RETURNING ${columns}`,
        [id, owner],
      );
      return result.rows[0] ? record(result.rows[0]) : null;
    },
    async remove(id, owner) {
      return (
        (
          await db.query(
            "DELETE FROM public.portfolios WHERE id=$1 AND owner_id=$2 RETURNING id",
            [id, owner],
          )
        ).rows.length > 0
      );
    },
    async publicPortfolio(slug) {
      const result = await db.query(
        "SELECT slug,published_data,is_indexable,published_at FROM public.portfolios WHERE slug=$1 AND is_published=true AND published_data IS NOT NULL",
        [slug],
      );
      if (!result.rows[0]) return null;
      const row = result.rows[0];
      return {
        slug: String(row.slug),
        data: portfolioSchema.parse(row.published_data),
        indexable: Boolean(row.is_indexable),
        publishedAt: row.published_at,
      };
    },
    async sitemap() {
      const result = await db.query(
        "SELECT slug,published_at FROM public.portfolios WHERE is_published=true AND is_indexable=true AND published_data IS NOT NULL AND published_data->>'sample'='false' ORDER BY slug LIMIT 49998",
      );
      return result.rows;
    },
  };
}
