const mongoose = require('mongoose')

mongoose.set('strictQuery',false)

const url = process.env.MONGODB_URI

console.log('connectiong to Database')
mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB: ',error.message)
  })

const personsSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    required: true },
  number:{
    type: String,
    validate:{
      validator: function(v){
        return /^(\d{2}-\d{6,}|\d{3}-\d{5,})$/.test(v)
      },
      message: props => `${props.value} puhelinnumeron muoto väärin!`
    },
    required:[true, 'Phone number required']
  }
})

personsSchema.set('toJSON',{
  transform: (document, returnedObject) => {
    returnedObject.id=returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personsSchema)