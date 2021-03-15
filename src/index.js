const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find(user => user.username === username);

  if(!user){    
    return response.status(404).json({error: "User not found!"});
  }

  request.user = user;

  return next();
}

// criei essa middleware para checar por id um todo
function checksExistsTodosByID(request,response,next){
  const {user} = request;
  const {id} = request.params;
  const todos = user.todos.find((todos) => todos.id === id);

  if(!todos){
    return response.status(404).json({error: "Todos not exists!"});
  }

  request.todos = todos;

  return next();
}

app.post('/users', (request, response) => {
  const {name , username} = request.body;

  const userAlreadyExists = users.some(user => user.username === username);

  if(userAlreadyExists){    
    return response.status(400).json({error: "User already exists!"})
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });

  const user = users.find(user => user.username === username);
  //console.log("User created");

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {user} = request;

  const todosOperation = {
    id: uuidv4(), // precisa ser um uuid
	  title: title,
	  done: false, 
	  deadline: new Date(deadline), 
	  created_at: new Date()
  };

  user.todos.push(todosOperation);

  return response.status(201).json(todosOperation);
});

app.put('/todos/:id', checksExistsUserAccount,checksExistsTodosByID, (request, response) => {
  const {title,deadline} = request.body;
  const {todos} = request;

  todos.title = title;
  todos.deadline = deadline;

  return response.status(201).json(todos);

});

app.patch('/todos/:id/done', checksExistsUserAccount,checksExistsTodosByID, (request, response) => {
  const {todos} = request;

  todos.done = true;

  return response.status(201).json(todos);

});

app.delete('/todos/:id', checksExistsUserAccount,checksExistsTodosByID, (request, response) => {
  const {todos,user}= request;

  const todosIndex = user.todos.indexOf(todos);

  user.todos.splice(todosIndex,1);

  return response.status(204).send();

});

module.exports = app;