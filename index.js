const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

require('dotenv').config()

const Person = require('./models/person')
const { Collection } = require('mongoose')



const app = express()

app.use(express.static('build'))

app.use(cors())

app.use(express.json())



morgan.token('body', (req, res) => { return JSON.stringify(req.body)})
app.use(morgan( (tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      tokens.body(req,res)
    ].join(' ')
  }))

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/info',(request,response, next) => {
    Person.find({}).then(persons => {
        response.send(`
            <p>Phonebook has info for ${persons.length} people</p>
            <p>${new Date()}</p>
            `)
    })
})

app.get('/api/persons',(request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id',(request, response, next) => {
    Person.findById(request.params.id)
    .then(person => {
        if(person){
            response.json(person)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
    
})

app.post('/api/persons/',(request, response) => {
    const body = request.body

    if(!body.name) {
        return response.status(400).json({
            error: 'Name missing'
        })
    }

    if(!body.number) {
        return response.status(400).json({
            error: 'Number missing'
        })
    }

    if(persons.some(person => person.name === body.name)){
        return response.status(400).json({
            error: 'Name must be unique'
        })
    }

    const newId = Math.floor(Math.random()*9999999999)

    const person = new Person( {
        id: newId,
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

app.put('/api/persons/:id',(request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id,person, {new: true})
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id',(request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})


const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if(error.name === 'CastError'){
        return response.status(400).send({error: 'malformated id'})
    }

    next(error)
}

app.use(errorHandler)



const PORT =  process.env.PORT 
app.listen(PORT,() => {
    console.log(`Server running on port ${PORT}`)
})