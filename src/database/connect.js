const mongoose = require('mongoose');
const chalk = require('chalk');

async function connect() {
    mongoose.set('strictQuery', false);
    try {
        console.log(chalk.blue(chalk.bold(`Database`)), (chalk.white(`>>`)), chalk.red(`MongoDB`), chalk.green(`conectando...`))
        await mongoose.connect(process.env.MONGO_TOKEN, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (err) {
        console.log(chalk.red(`[ERROR]`), chalk.white(`>>`), chalk.red(`MongoDB`), chalk.white(`>>`), chalk.red(`Falha ao conectar a database!`), chalk.white(`>>`), chalk.red(`Error: ${err}`))
        console.log(chalk.red("Desligando..."))
        process.exit(1)
    }


    mongoose.connection.once("open", () => {
        console.log(chalk.blue(chalk.bold(`Database`)), (chalk.white(`>>`)), chalk.red(`MongoDB`), chalk.green(`is ready!`))
    });

    mongoose.connection.on("error", (err) => {
        console.log(chalk.red(`[ERROR]`), chalk.white(`>>`), chalk.red(`Database`), chalk.white(`>>`), chalk.red(`Falha ao conectar a database!`), chalk.white(`>>`), chalk.red(`Error: ${err}`))
        console.log(chalk.red("Desligando..."))
        process.exit(1)
    });
    return;
}

module.exports = connect