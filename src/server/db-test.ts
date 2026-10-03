import pg from 'pg';

async function runDiagnostic() {
  console.log('--- NEON POSTGRESQL DATABASE DIAGNOSTIC TEST ---');
  const databaseUrl = process.env.DATABASE_URL;

  console.log('DATABASE_URL Present:', !!databaseUrl);

  if (!databaseUrl || databaseUrl === 'null' || databaseUrl === 'undefined' || databaseUrl.includes('username:password')) {
    console.warn('⚠️  DATABASE_URL environment variable is NOT configured or holds a placeholder.');
    console.log('The application currently uses the high-performance persistent storage engine (data/yoe_store.json).');
    console.log('--- DIAGNOSTIC COMPLETED ---');
    return;
  }

  // Redact credentials for safe output logging
  const redactedUrl = databaseUrl.replace(/:([^:@]+)@/, ':****@');
  console.log('Connecting to Neon URL:', redactedUrl);

  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    console.log('\nExecuting test SQL query on Neon database...');
    const client = await pool.connect();

    const res = await client.query('SELECT 1 as connected, NOW() as server_time, current_database() as db_name, version();');
    console.log('✅ NEON POSTGRESQL CONNECTION SUCCESSFUL!');
    console.log('Server Time:', res.rows[0].server_time);
    console.log('Connected Database:', res.rows[0].db_name);
    console.log('PostgreSQL Version:', res.rows[0].version);

    // Check users table if present
    const tableCheck = await client.query(`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
    `);
    console.log('Public Tables found in Neon DB:', tableCheck.rows.map(r => r.table_name));

    client.release();
  } catch (error: any) {
    console.error('❌ NEON DATABASE CONNECTION ERROR:');
    console.error('Error Code:', error?.code || 'N/A');
    console.error('Error Message:', error?.message || error);
  } finally {
    await pool.end();
    console.log('\n--- DIAGNOSTIC COMPLETED ---');
  }
}

runDiagnostic();
