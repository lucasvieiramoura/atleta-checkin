const { ObjectId } = require('mongodb');
const User = require('../models/User');

// Buscar apenas os usários que são atletas
const getAthletes = async (req, res) => {
    try {
        const athletes = await User.getCollection()
            .find({ role: 'ATHLETE'}, { projection: { password: 0 }})
            .toArray();

        return res.status(200).json(athletes);
    } catch (error) {
        console.error('Erro ao buscar atletas: ', error);
        return res.status(500).json({ message: 'Erro ao buscar lista de atletas. '});
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID do atleta inválido.'});
        }

        const { name, email, phone, cpf, position, status } = req.body;

        // Monta o objeto dinamicamente com os campos enviados
        const updateData =  {};if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (cpf !== undefined) updateData.cpf = cpf;
    if (position !== undefined) updateData.position = position;
    if (status !== undefined) updateData.status = status;

    const result = await User.getCollection().updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Atleta não encontrado.' });
    }

    return res.status(200).json({ message: 'Atleta atualizado com sucesso!' });

    } catch (error) {
        console.error('Erro ao atualizar atleta:', error);
        return res.status(500).json({ message: 'Erro ao atualizar atleta no servidor.' })        
    }
}
module.exports = {getAthletes,updateUser};
