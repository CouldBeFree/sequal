const express = require('express');
const Sequelize = require('sequelize');
const _USERS = require('./users');
const Op = Sequelize.Op;

const app = express();
const port = 8001;

const connection = new Sequelize('test', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql',
  operatorsAliases: false
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

const Post = connection.define('Post', {
  title: Sequelize.STRING,
  content: Sequelize.TEXT
});

const Comment = connection.define('Comment', {
  them_comment: Sequelize.STRING
});

app.get('/allposts', (req, res) => {
  Post.findAll({
    include: [{
      model: User, as: 'UserRef'
    }]
  })
    .then(posts => {
      res.json(posts)
    })
    .catch(({ message }) => {
      console.error(message);
      res.status(404).send(message);
    });
});

app.get('/single-post', (req, res) => {
  Post.findByPk('1', {
    include: [{
      model: Comment, as: 'All_Comments',
      attributes: ['the_comment']
    }]
  })
    .then(posts => {
      res.json(posts)
    })
    .catch(({ message }) => {
      console.error(message);
      res.status(404).send(message);
    });
});

Post.belongsTo(User, {as: 'UserRef', foreignKey: 'userId'}); // puts foreignKey UserId in Post table
Post.hasMany(Comment, { as: 'All_Comments' }); // foreignKey = PostId in Comment table

connection
  .sync({
    force: true,
    logging: console.log
  })
  .then(() => {
    User.bulkCreate(_USERS)
      .then(users => {
        console.log('Users added')
      })
      .catch(err => {
        console.log(err);
      })
  })
  .then(() => {
    Post.create({
      userId: 1,
      title: 'Third post',
      content: 'post content 2'
    })
  })
  .then(() => {
    Post.create({
      userId: 1,
      title: 'First post',
      content: 'post content 3'
    })
  })
  .then(() => {
    Post.create({
      userId: 2,
      title: 'Second post',
      content: 'first content 2'
    })
  })
  .then(() => {
    Comment.create({
      PostId: 1,
      the_comment: 'second comment'
    })
  })
  .then(() => {
    Comment.create({
      PostId: 2,
      the_comment: 'First comment'
    })
  })
  .then(err => {
    console.log(err);
  })
  .then(() => {
    console.log('DB connected')
  })
  .catch(e => console.log(e));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
});
