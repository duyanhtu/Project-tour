const mongoose = require('mongoose');
const dotenv = require('dotenv');
// process.on("uncaughtException", () =>{
//     console.log('UNHANDLEDREJECTION! SHUT DOWN!');
//     console.log(err.name, err.message);
//     process.exit(1);
// }); 
dotenv.config({ path: './config.env' });
const app = require('./app');
// console.log(process.env);
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, { 
    useNewUrlParser:  true, 
    useCreateIndex: true,
    useUnifiedTopology: true, 
    useFindAndModify: false
})
.then(con =>console.log('DB connection established'))

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>{
    console.log(`listening on port ${port}`);
});
// Bắt lỗi khi một trong các điều kiện ở conjig.env lỗi
process.on("unhandledRejection", err =>{
    console.log('UNHANDLEDREJECTION! SHUT DOWN!');
    console.log(err.name, err.message);
    server.close(()=>{
        process.exit(1);
    });
}); 

