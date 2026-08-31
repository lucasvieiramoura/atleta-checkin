const { getDB } = require('../config/db');

class UserModel {
  static getCollection() {
    return getDB().collection('users');
  }

  static async findOne(query) {
    return await this.getCollection().findOne(query);
  }

  static async findByEmail(email) {
    if (!email || typeof email !== 'string') return null;
    return await this.getCollection().findOne({ email: email.toLowerCase() });
  }

  static async findByPhone(phone) {
    if (!phone || typeof phone !== 'string') return null;
    return await this.getCollection().findOne({ phone: phone.trim() });
  }

  static async findByCpf(cpf) {
    if (!cpf || typeof cpf !== 'string') return null;
    return await this.getCollection().findOne({ cpf: cpf.trim() });
  }

  static async create(userData) {
    const newUser = {
      name: userData.name,
      email: userData.email ? String(userData.email).toLowerCase() : '',
      phone: userData.phone ? String(userData.phone).trim() : '',
      cpf: userData.cpf ? String(userData.cpf).trim() : null,
      position: userData.position || null,
      password: userData.password,
      role: userData.role || 'ATHLETE',
      createdAt: new Date()
    };

    const result = await this.getCollection().insertOne(newUser);
    return { _id: result.insertedId, ...newUser };
  }
}

module.exports = UserModel;