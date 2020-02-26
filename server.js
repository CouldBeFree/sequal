const express = require('express');
const Sequelize = require('sequelize');
const _USERS = require('./users');
const Op = Sequelize.Op;

const app = express();
const port = 8001;

const connection = new Sequelize('test', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql',
  operatorsAliases: false,
  define: {
    freezeTableName: true
  }
});

const User = connection.define('User', {
  name: Sequelize.STRING,
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: Sequelize.STRING,
    validate: {
      isAlphanumeric: true
    }
  }
});

app.post('/post', (req, res) => {
  const newUser = req.body.user;
  User.create({
    name: newUser.name,
    email: newUser.email
  })
    .then(user => {
      res.json(user)
    })
    .catch(({ message }) => {
      console.error(message);
      res.status(404).send(message);
    });
});

app.get('/findOne', (req, res) => {
  User.findByPk('55')
    .then(user => {
      res.json(user)
    })
    .catch(({ message }) => {
      console.error(message);
      res.status(404).send(message);
    });
});

app.delete('/remove', (req, res) => {
  User.destroy({
    where: { id: 50 }
  })
    .then(() => {
      res.json({
        status: 'success',
        data: []
      })
    })
    .catch(({ message }) => {
      console.error(message);
      res.status(404).send(message);
    });
});

app.put('/update', (req, res) => {
  User.update({
    name: 'Michael Keaton',
    password: 'password'
  }, {
    where: {
      id: 55
    }
  })
    .then(rows => {
      res.json(rows)
    })
    .catch(({ message }) => {
      console.error(message);
      res.status(404).send(message);
    });
});

app.get('/findall', (req, res) => {
  User.findAll({
    where: {
      name: {
        [Op.like]: 'Sy%'
      }
    }
  })
    .then(user => {
      res.json(user)
    })
    .catch(({ message }) => {
      console.error(message);
      res.status(404).send(message);
    });
});

connection
  .sync({
    logging: console.log
  })
  .then(() => {
    /*User.bulkCreate(_USERS)
      .then(users => {
        console.log('Users added')
      })
      .then(err => {
        console.log(err);
      })*/
  })
  .then(() => {
    console.log('DB connected')
  })
  .catch(e => console.log(e));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
});
