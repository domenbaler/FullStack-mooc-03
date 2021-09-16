const mongoose = require('mongoose')

if(process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0.sd8pq.mongodb.net/phonebookDatabase?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    id: Number,
    name: String,
    number: String
})

const Person = mongoose.model('Person',personSchema)

if(process.argv.length === 3){
    console.log("Phonebook: ")
    Person.find({}).then(result => {
        result.forEach(note => {
            console.log(note.name, note.number)
        })  
        mongoose.connection.close()
    })
}else if(process.argv.length === 5){
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })

    person.save().then(result => {
        console.log(`Added ${person.name} number ${person.number} to phonebook`)
        mongoose.connection.close()
    })
}else {
    
    mongoose.connection.close()
}



/*const person = new Person({
    id: 3,
    name: "Pira Moka",
    number: "111 829 000"
})

person.save().then(result => {
    console.log('person saved!')
    mongoose.connection.close()
})
*/

/*
Person.find({}).then(result => {
    result.forEach(note => {
        console.log(note)
    })  
    mongoose.connection.close()
})
*/