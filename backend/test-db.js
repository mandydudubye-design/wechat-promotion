const mysql = require('mysql2/promise');

async function testConnection() {
  const configs = [
    { host: '127.0.0.1', port: 3306, user: 'root', password: 'root123', database: 'wechat_promotion' },
    { host: 'localhost', port: 3306, user: 'root', password: 'root123', database: 'wechat_promotion' },
  ];
  
  for (const config of configs) {
    console.log(`\nTesting connection to ${config.host}:${config.port}...`);
    try {
      const connection = await mysql.createConnection(config);
      const [rows] = await connection.execute('SELECT 1 as test');
      console.log(`✅ SUCCESS connecting to ${config.host}:`, rows);
      await connection.end();
    } catch (error) {
      console.log(`❌ FAILED connecting to ${config.host}:`, error.message);
    }
  }
}

testConnection();