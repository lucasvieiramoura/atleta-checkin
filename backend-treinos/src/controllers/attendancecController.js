const { ObjectId } = require('mongodb');
const { getDB } = require('../config/db');

// Atleta realizar o Check-in no treino
const checkIn = async (req, res) => {
    try {
        const { workoutId, formAnswers } = req.body;
        const athleteId = req.user.id;

        if (!workoutId || !ObjectId.isValid(workoutId)) {
            return res.status(400).json({ message: 'ID do treino é obrigatório e deve ser válido '});
        } 

        const db = getDB(); 
        const workoutsCollection = db.collection('workouts');
        const attendanceCollection = db.collection('attendances');
        const formResponseCollection = db.collection('form_responses');

        // 1. Verificar se o treino existe
        const workout = await workoutsCollection.findOne({ _id: new ObjectId(workoutId) });
        if (!workout) {
            return res.status(404).json({ message: 'Treino não econtrado. '});
        }

        // 2. Verificar se o atleta já confirmou presença neste treino
        const existingAttendance = await attendanceCollection.findOne({
            workoutId: new ObjectId(workoutId),
            athleteId: new ObjectId(athleteId)
        });

        if (existingAttendance) {
            return res.status(400).json({ message: 'Presença já registrada para este treino. '});
        }

        // 3. Validação do Formulário Obrigatório
        if (workout.formId) {
            if (!formAnswers || !Array.isArray(formAnswers) || formAnswers.length === 0 ) {
                return res.status(400).json({
                    message: 'Este treino exige o preenchimento obrigatório do formulário.'
                });
            }

            // Salva as resposta do formulário
            await formResponseCollection.insertOne({
                formId: workout.formId,
                workoutId: new ObjectId(workoutId),
                athleteId: new ObjectId(athleteId),
                answers: formAnswers, // Ex: [{ questionLabel: "Nivel de Fadiga", value: 8 }]
                createdAt: new Date()
            });
        }

        // 4. Registrar a Presença (Check-in)
        const newAttendance = {
            workoutId: new ObjectId(workoutId),
            athleteId: new ObjectId(athleteId),
            status: 'CONFIRMED',
            createdAt: new Date()
        };

        const result = await attendanceCollection.insertOne(newAttendance);

        return res.status(201).json({
            message: 'Presença confirmada com sucesso!',
            attendanceId: result.insertedId
        });

    } catch (error) {
        console.error('Erro ao realizar check-in: ', error);
        return res.status(500).json({ message: 'Erro interno ao registrar presença. '});
    }
};

// Obter presença e respostas de um treino ( Para o Coach visualizar )
const getWorkoutAttendance = async (req, res) => {
    try {
        const { workoutId } = req.params;

        if (!ObjectId.isValid(workoutId)) {
            return res.status(400).json({ message: 'ID do treino inválido. '});
        }

        const db = getDB();

        // Busca presença com dados dos atletas (Lookup)
        const attendances = await db.collection('attendances').aggregate([
            { $match: { workoutId: new ObjectId(workoutId)}},
            {
                $lookup: {
                    form: 'users',
                    localField: 'athleteId',
                    foreignField: '_id',
                    as: 'athlete'
                }
            },
            { $unwind: '$athlete'},
            {
                $project: {
                    _id: 1,
                    status: 1,
                    createdAt: 1,
                    'athlete._id': 1,
                    'athlete.name': 1,
                    'ahtlete.email': 1
                }
            }
        ]).toArray();

        return res.status(200).json(attendances)
    } catch (error) {
        console.error('Erro ao buscar lista de presenças: ', error);
        return res.status(500).json({ message: 'Erro interno ao buscar presenças. '});
    }
};

const getDashboardMetrics = async (req, res) => {
  try {
    const db = getDB();

    const totalAthletes = await db.collection('users').countDocuments({ role: 'ATHLETE', active: { $ne: false } });
    const totalWorkouts = await db.collection('workouts').countDocuments();
    const totalPresences = await db.collection('attendances').countDocuments({ status: 'CONFIRMED' });

    // Cálculo da taxa limite em 100%
    const maxPossible = totalWorkouts * totalAthletes;
    const presenceRate = maxPossible > 0 ? Math.min(100, Math.round((totalPresences / maxPossible) * 100)) : 0;

    // Busca o histórico de presenças populando os dados de atleta e treino
    const rawAttendances = await db.collection('attendances').aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'athlete'
        }
      },
      { $unwind: { path: '$athlete', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'workouts',
          localField: 'workoutId',
          foreignField: '_id',
          as: 'workout'
        }
      },
      { $unwind: { path: '$workout', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    // Mapeia para a estrutura limpa que o front-end consome
    const records = rawAttendances.map(item => ({
      _id: item._id,
      athleteName: item.athlete?.name || 'Atleta não encontrado',
      cpf: item.athlete?.cpf || '-',
      position: item.athlete?.position || 'N/I',
      workoutTitle: item.workout?.title || item.workout?.name || 'Treino Geral',
      date: item.createdAt || item.date || new Date(),
      isPresent: item.status === 'CONFIRMED' || item.isPresent === true
    }));

    return res.status(200).json({
      totalWorkouts,
      totalPresences,
      presenceRate,
      records
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return res.status(500).json({ message: 'Erro ao carregar dados do dashboard.' });
  }
};
module.exports = { checkIn, getWorkoutAttendance, getDashboardMetrics};