const { getDB } = require('../config/db');

class UserModel {
  static getCollection() {
    return getDB().collection('users');
  }

  static async findByEmail(email) {
    return await this.getCollection().findOne({ email: email.toLowerCase() });
  }

  static async findByPhone(phone) {
    return await this.getCollection().findOne({ phone: phone.trim() });
  }

  static async findByCpf(cpf) {
    return await this.getCollection().findOne({ cpf: cpf.trim() });
  }

  static async create(userData) {
    const newUser = {
      name: userData.name,
      email: userData.email.toLowerCase(),
      phone: userData.phone.trim(),
      cpf: userData.cpf ? userData.cpf.trim() : null,
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