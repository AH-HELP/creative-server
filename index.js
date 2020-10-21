const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
// const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uj2jz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
app.use(bodyParser.json());
app.use(cors());
const serviceAccount = require("./Configs/creative-agency-5dbc5-firebase-adminsdk-v496i-e5f82635c6.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRE_DB
});


const port = 5000;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
  res.send("have a nice day")
});


client.connect(err => {
  const creativeAgencyInfoCollection = client.db("creativeAgency").collection("creativeAgencyInfo");
  const customerFeedbackCollection = client.db("creativeAgency").collection("customersFeedback");
  const addServiceCollection = client.db("creativeAgency").collection("addService");
  const makeAdminCollection = client.db("creativeAgency").collection("makeAdmin");


  // add Customer order data database---------------------------/
  app.post('/customerOrder', (req, res) => {
    const customerOrder = req.body;
    creativeAgencyInfoCollection.insertOne(customerOrder)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  });

  //all Customer Data-----/
  app.get('/allCustomerData', (req, res) => {
    creativeAgencyInfoCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })

  })



  app.get('/CustomersByData', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      admin.auth().verifyIdToken(idToken)

        .then(function (decodedToken) {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          if (tokenEmail == queryEmail) {
            creativeAgencyInfoCollection.find({
              email: queryEmail
            })
              .toArray((err, documents) => {
                console.log(documents, 'userData')
                res.status(200).send(documents);
              })
          } else {
            res.status(401).send('un-authorized access')
          }
        }).catch(function (error) {
          res.status(401).send('un-authorized access')
        });

    } else {
      res.status(401).send('un-authorized access')
    }

  });




  // Customer Feedback add to database ------/
  app.post('/addFeedback', (req, res) => {
    const feedback = req.body;
    console.log(feedback, 'feedback')
    customerFeedbackCollection.insertOne(feedback)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  });

  // get Customer Feedback ---/
  app.get('/feedbacksByData', (req, res) => {
    customerFeedbackCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })

  });


  // admin email add database-----/
  app.post('/makeAdmin', (req, res) => {
    console.log(req, 'make admin');
    const admin = req.body;
    console.log(admin, 'adminEmail')
    makeAdminCollection.insertOne(admin)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  });



  // check admin email or not----/
  app.get('/checkAdminEmailOrNot', (req, res) => {
    console.log(req, 'user email')
    const adminEmailOrNot = req.query.email;
    console.log(adminEmailOrNot, "check Admin Email Or Not");
    makeAdminCollection.find({
      email: adminEmailOrNot
    })
      .toArray((err, documents) => {
        if (documents.length === 0) {
          res.send({
            admin: false
          })
        } else {
          res.send({
            admin: true
          })
        }
      });

  });

  // heroku new account password=> hdjsksjk12*&..<</kdjk
  // admin data here------------------------------------
  app.post('/addServices', (req, res) => {
    const service = req.body;
    console.log(service, 'addServices')
    addServiceCollection.insertOne(service)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  });


  // get all Services data ........./
  app.get('/ServicesByData', (req, res) => {
    addServiceCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })

  });


});

app.listen(process.env.PORT || port);