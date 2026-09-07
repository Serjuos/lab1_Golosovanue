// service.js
const db = require('./database');

const PollService = {
  listFrameworks() {
    return db.getAllFrameworks();
  },

  vote(frameworkId, userName) {
    const id = Number(frameworkId);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Некорректный id фреймворка');
    }
    if (!userName || typeof userName !== 'string' || userName.trim().length === 0) {
      throw new Error('Введите ваше имя');
    }
    
    const framework = db.getFrameworkById(id);
    if (!framework) {
      throw new Error('Фреймворк не найден');
    }
    
    db.addVote(id, userName.trim());
    return { ok: true, message: `Голос от "${userName.trim()}" за "${framework.name}" принят` };
  },

  getResults() {
    const rows = db.getResults();
    const total = db.getTotalVotes();
    const items = rows.map(r => ({
      id: r.id,
      name: r.name,
      votes: r.votes,
      percent: total > 0 ? Math.round((r.votes / total) * 100) : 0,
    }));
    return { total, items };
  },
  
  // История всех голосов
  getVoteHistory() {
    return db.getAllVotes();
  },
};

module.exports = PollService;