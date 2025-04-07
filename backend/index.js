require('dotenv').config();
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')
const app = express()


app.use(express.json())
app.use(express.static('dist'))

morgan.token('post-body',(req) =>{
    return req.method === 'POST' ? JSON.stringify(req.body) : '';
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-body'))

/*
let persons = [
    { 
        "name": "Arto Hellas", 
        "number": "040-123456",
        "id": "1"
    },
    { 
        "name": "Ada Lovelace", 
        "number": "39-44-5323523",
        "id": "2"
    },
    { 
        "name": "Dan Abramov", 
        "number": "12-43-234345",
        "id": "3"
    },
    { 
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122",
        "id": "4"
    }
    ]
*/
app.get('/', (request, response) =>{
    response.send('<h1>Hello World!</h1>')
})
app.get('/api/persons',(request, response) => {
    Person.find({})
        .then(persons =>{
            response.json(persons)
        })
        .catch(error =>{
            console.error(error)
            response.status(500).end()
        })
})

app.get('/info', (request, response) => {
    Person.countDocuments({})
      .then(count => {
        response.send(
          `Phonebook has info for ${count} people <br><br> ${new Date()}`
        )
      })
      .catch(error => {
        console.error(error)
        response.status(500).end()
      })
  })

app.get('/api/persons/:id', (request, response, next) => {
Person.findById(request.params.id)
    .then(person => {
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) =>{
    Person.findByIdAndDelete(request.params.id)
        .then(result =>{
            response.status(204).end()
        })
        .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
    const body = request.body
  
    if (!body.name || !body.number) {
      return response.status(400).json({ error: 'Name or number missing' })
    }
  
    const person = new Person({
      name: body.name,
      number: body.number,
    })
  
    person.save()
      .then(savedPerson => {
        response.json(savedPerson)
      })
      .catch(error => next(error))
  })

app.put('/api/persons/:id',(request, response, next)=>{
    const {name, number} =request.body

    Person.findByIdAndUpdate(request.params.id)
        .then(person =>{
            if (!person){
                return response.status(404).end()
            }
            person.name = name
            person.number = number

            return person.save().then((updatedPerson)=>{
                response.json(updatedPerson)
            })
        })
        .catch(error => next(error))
    })


const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }
    response.status(500).send({ error: 'server error' })
  }
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`)
})
