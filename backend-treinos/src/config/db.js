const {MongoClient, ServerApiVersion} = require('mongodb');

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db;

const connectDB = async () =>{
    try {
        await client.connect();
        db = client.db('atleta-checkin');
        console.log('MongoDB Atlas conectado com sucesso cia Driver Nativo!');      
    } catch (error) {
        console.error('Erro ao conectar no MonogDB: ', error.message);
        process.exit(1);
    }
};

const getDB = () =>{
    if(!db) {
        throw new Error('Banco de dados não inicializado, Chame o connectDB primeiro');
    }
    return db;
};

module.exports = {connectDB, getDB};