// In-memory database for deployment
const db = {
  users: [],
  apps: [],
  records: []
};

db.prepare = (query) => ({
  get: (...params) => {
    if (query.includes('users WHERE email')) return db.users.find(u => u.email === params[0]);
    if (query.includes('users WHERE id')) return db.users.find(u => u.id === params[0]);
    if (query.includes('apps WHERE id') && query.includes('user_id')) return db.apps.find(a => a.id === params[0] && a.user_id === params[1]);
  },
  all: (...params) => {
    if (query.includes('apps WHERE user_id')) return db.apps.filter(a => a.user_id === params[0]);
    if (query.includes('records WHERE table_name')) return db.records.filter(r => r.table_name === params[0]);
    return [];
  },
  run: (...params) => {
    if (query.includes('INSERT INTO users')) db.users.push({ id: params[0], email: params[1], password: params[2] });
    if (query.includes('INSERT INTO apps')) db.apps.push({ id: params[0], user_id: params[1], name: params[2], config: params[3] });
    if (query.includes('INSERT INTO records')) db.records.push({ id: params[0], table_name: params[1], data: params[2], created_at: new Date().toISOString() });
    if (query.includes('DELETE FROM records')) { const i = db.records.findIndex(r => r.id === params[0]); if (i > -1) db.records.splice(i, 1); }
  }
});

db.exec = () => {};
module.exports = db;