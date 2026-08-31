const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

// Criar um novo formulário dinânimo (Apenas COACH)
const createForm = async (req, res) => {
    try {
        const { title, questions } = req.body;

        if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                message: 'Titulo e um array de perguntas (questions) são obrigatórios. '
            });
        }

        const db = getDB();
        const formsCollection = db.collection('forms');

        const newForm = {
            title,
            questions, // Ex: [{ label: "Nível de cansaço", type: "scale_1_10", required: true }]
            coachId: new ObjectId(req.user.id),
            createdAt: new Date()
        };

        const result = await formsCollection.insertOne(newForm);

        return res.status(201).json({
            message: 'Formulário criado com sucesso! ',
            form: { id: result.insertedId, ...newForm }
        });

    } catch (error) {
        console.error('Erro ao criar formulário: ', error);
        return res.status(500).json({ message: 'Erro interno ao criar formulário. '});
    }
};

// Listar todos os formulários (Para o Coach ver no painel Web e Atrelar a treinos)
const getForms = async (req, res) => {
    try {
        const db = getDB();
        const formsCollection = db.collection('forms');

        // Retorna todos os formulários. Se quiser, pode filtrar por req.user.id (CoachId)
        const forms = await formsCollection.find({}).sort({ createdAt: -1}).toArray();

        return res.status(200).json(forms);
    } catch (error) {
        console.error('Erro ao listar formulários: ', error);
        return res.status(500).json({ message: 'Erro interno ao listar formulários. '});
    }
};

// Buscar um formulário específico por ID ( Usado pelo Flutter para renderizar na tela )
const getFormById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.stats(400).json({ message: 'ID de formulário inválido. '});
        }

        const db = getDB();
        const form = await db.collection('forms').findOne({ _id: new ObjectId(id) });

        if (!form) {
            return res.status(404).json({ message: 'Formulário não encontrado. '});
        }

        return res.status(200).json(form);

    } catch (error) {
        console.error('Erro ao buscar formulário: ', error);
        return res.status(500).json({ message: 'Erro interno ao buscar formulário. '});
    }
};

// Excluir formulário (Apenas COACH)
const deleteForm = async (req, res ) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID inválido. '});
        }

        const db = getDB();
        const result = await db.collection('forms').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Formulário não encontrado. '});
        }

        return res.status(200).json({ message: 'Formulário removido com sucesso. '});
    } catch (error) {
        console.error('Erro ao deletar formulário: ', error);
        return res.status(500).json({ message: 'Erro interno ao deletar formulário. '});
    }
};

const updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, questions } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de formulário inválido.' });
    }

    const db = getDB();
    const result = await db.collection('forms').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          title, 
          questions, 
          updatedAt: new Date() 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Formulário não encontrado.' });
    }

    return res.status(200).json({ message: 'Formulário atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar formulário:', error);
    return res.status(500).json({ message: 'Erro interno ao atualizar formulário.' });
  }
};

module.exports = {
    createForm,
    getForms,
    getFormById,
    updateForm,
    deleteForm
};