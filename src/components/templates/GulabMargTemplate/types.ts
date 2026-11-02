import type { ShukranaData, ShukranaWish } from '../ShukranaDarshanTemplate/types'

/**
 * GulabMargTemplate — public type contract. GulabMargAdapter.jsx maps the
 * site's shared Satsang template shape onto `GulabMargData`, which is the same
 * content Shukrana Darshan takes with its own sample data.
 */
export interface GulabMargData extends Omit<ShukranaData, 'demo'> {
  /** Sample content for the catalog page and builder preview. */
  demo?: { roseCount: number; wishes: ShukranaWish[] }
}
