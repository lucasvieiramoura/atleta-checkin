const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

// Criar um novo treino (Apenas COACH)
const createWorkout = async (req, res) =>{
    try {
        const { title, description, date, formId } = req.body;

        if(!title || !date){
            return res.status(400).json({ message: 'Título e Data/Horário são obrigatórios. '});
        }

        const db = getDB();
        const workoutsCollection = db.collection('workouts');

        const newWorkout =  {
            title,
            description: description || '',
            date: new Date(date), // Salva em formato Date ISO UTC
            coachId: new ObjectId(req.user.id),
            formId: formId ? new ObjectId(formId) : null, // ID do formulário atrelado se houver
            createAt: new Date()
        };

        const result = await workoutsCollection.insertOne(newWorkout);

        return res.status(201).json({
            message: 'Treino cadastro com sucesso',
            workout: {id: result.insertedId, ...newWorkout}
        });

    } catch (error) {
        console.error('Erro ao criar treino: ', error);
        return res.status(500).json({ message: 'Erro interno ao cadastrar treino.'});
    }
}

    
//Lista toods os treinos (Atleta e Coaches)
const getWorkouts = async (req, res) =>{
    try {
        const db = getDB();
        const workoutsCollection = db.collection('workouts');

        //Suporta filtro por data inicial e final ( útil para o calendário no React / Flutter)
        const { startDate, endDate } = req.query;
        let query = {};

        if(startDate && endDate){
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const workouts = await workoutsCollection
            .find(query)
            .sort({ date: 1}) // Ordem do mais recente para o mais futuro
            .toArray();

        return res.status(200).json(workouts);
    } catch (error) {
        console.error('Erro ao buscar treinos: ', error);
        return res.status(500).json({ message: 'Erro interno ao listar treinos'});
    }
};

// Obter detalhes de um treino específico por ID
const getWorkoutById = async (req, res) => {
    try {
        const { id } = req.params;

        if(!ObjectId.isValid(id)){
            return res.status(400).json({ message: 'ID de treino inválido'});
        }

        const db = getDB();
        const workout = await db.collection('workouts').findOne({ _id: new ObjectId(id) });

        if (!workout) {
            return res.status(404).json({ message: 'Treino não encontrado. '});
        }

        return res.status(200).json(workout);
    } catch (error) {
        console.error('Erro ao buscar treino por ID: ', error);
        return res.status(500).json({ message: 'Erro interno ao buscar treino. '});
    }
};

const getTodayWorkout = async (req, res) => {
  try {
    const db = getDB();
    
    // Define início e fim do dia atual
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const workout = await db.collection('workouts').findOne({
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (!workout) {
      return res.status(200).json({ workout: null });
    }

    // Verificar se o atleta logado já fez check-in
    const attendance = await db.collection('attendances').findOne({
      workoutId: workout._id,
      athleteId: new ObjectId(req.user.id)
    });

    return res.status(200).json({
      workout,
      hasCheckedIn: !!attendance
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const doCheckin = async (req, res) => {
  try {
    const db = getDB();
    const { workoutId } = req.body;
    const athleteId = req.user.id;

    const newAttendance = {
      workoutId: new ObjectId(workoutId),
      athleteId: new ObjectId(athleteId),
      status: 'CONFIRMED',
      createdAt: new Date()
    };

    await db.collection('attendances').updateOne(
      { workoutId: newAttendance.workoutId, athleteId: newAttendance.athleteId },
      { $set: newAttendance },
      { upsert: true }
    );

    return res.status(200).json({ message: 'Check-in realizado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Deletar um treino ( Apenas COACH)
const deleteWorkout = async (req, res) => {
    try {
        const  { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID de treino inválido'});
        }

        const db = getDB();
        const result = await db.collection('workouts').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0){
            return res.status(404).json({ message: 'Treino não encontrado.'});
        }

        return res.status(200).json({ message: 'Treino removido com sucesso. '});
    } catch (error) {
        console.error('Erro ao deletar treino: ', error);
        return res.status(500).json({ message: 'Erro interno ao deletar treino'});
    }
};

module.exports =  {
    createWorkout,
    getWorkouts,
    getWorkoutById,
    getTodayWorkout,
    doCheckin,
    deleteWorkout
};
