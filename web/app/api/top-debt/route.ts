import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const { rows } = await pool.query(
    `SELECT country_name, region_name, year, external_debt_usd_millions
     FROM vw_country_external_debt
     WHERE year = (SELECT MAX(year) FROM vw_country_external_debt)
     ORDER BY external_debt_usd_millions DESC`
  );
  return NextResponse.json(rows);
}