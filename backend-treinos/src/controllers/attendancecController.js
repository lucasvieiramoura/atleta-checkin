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

module.exports = { checkIn, getWorkoutAttendance };