const express = require('express');

const desafio = express();

desafio.use(express.json());

const projects = [];

var requestCount = 0;

//Middlewares
//Globais
//Contador de requests da aplicação
function requestCounting (req, res, next){
  requestCount++

  console.log(`Número total de requisições: ${requestCount}`);

  return next();
};

//Locais
//Verifica se o Projeto existe, caso sim, da andamento com a requisição
function checkProjectExists (req, res, next) {
  const { id } = req.params;

  const project = projects.find(p => p.id == id);

  if (!project){
    return res.status(400).json({ error: 'Project does not exists!'});
  }

  req.project = project;

  return next();
};

//Verifica se o Projeto existe, caso sim, bloqueia a duplicidade de ID
function checkProjectAlreadyExists (req, res, next) {
  const { id } = req.body;

  const project = projects.find(p => p.id == id);

  if (project){
    return res.status(400).json({ error: 'Project already exists!'});
  }

  req.project = project;

  return next();
};

//Verifica se a Tarefa (indice) existe, caso sim, da andamento com a requisição
function checkTaskExists (req, res, next) {
  const { id } = req.params;  

  const project = projects.find(p => p.id == id);

  const task = project.tasks[req.params.index];

  if (!task){
    return res.status(400).json({ error: 'Task does not exists!'});
  }

  req.task = task;

  return next();
};

//Rotas
//Chamada de uso para o Middleware global, utilizado na contagem de requisições
desafio.use(requestCounting);

//Create
//Inserir Projetos
//Insere projetos caso o ID ainda náo esteja sendo utilizado
desafio.post('/projects', checkProjectAlreadyExists, (req, res) => {
  const { id } = req.body;
  const { title } = req.body;

  const project = {
    id,
    title,
    tasks: []
  };

  projects.push(project);

  return res.json(projects);
});

//Listar todos os Projetos
desafio.get('/projects', (req, res) => {
  return res.json(projects);
});

//Lista Projeto específico, verificando se o mesmo existe, baseado em consulta pelo ID
desafio.get('/projects/:id', checkProjectExists, (req, res) => {
  return res.json(req.project);
});

//Atualiza Projetos específico, veriicando se o mesmo existe, baseado em consulta pelo ID
desafio.put('/projects/:id', checkProjectExists, (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  const project = projects.find(p => p.id == id);

  project.title = title;

  return res.json(projects);

});

//Deleta Projeto específico, verificando se o mesmo existe, baseado em consulta pelo ID
desafio.delete('/projects/:id', checkProjectExists, (req, res) => {
  const { id } = req.params;

  const index = projects.findIndex(p => p.id == id);
  
  projects.splice(index, 1);

  return res.json(projects);
});

//Insere Tarefa (Task), em um Projeto específico
desafio.post('/projects/:id/tasks', checkProjectExists, (req, res) => {
  const { id } = req.params;
  const { task } = req.body;

  const project = projects.find(p => p.id == id);

  project.tasks.push(task);

  return res.json(projects);
});

//Listar todas as Tarefas (Tasks) de um Projeto específico
desafio.get('/projects/:id/tasks', checkProjectExists, (req, res) => {
  return res.json(req.project.tasks);
});

//Lista uma Tarefa (Task) de um Projeto específico, consultando o índice
desafio.get('/projects/:id/tasks/:index', checkProjectExists, checkTaskExists, (req, res) => {
  return res.json(req.task);
});

//Atualiza Tarefa(Task) de Projetos específico, consultando o índice
desafio.put('/projects/:id/tasks/:index', checkProjectExists, checkTaskExists, (req, res) => {
  const { id } = req.params;
  const { index } = req.params;
  const { task } = req.body;

  const project = projects.find(p => p.id == id);

  project.tasks[index] = task;

  return res.json(projects);

})

//Deleta uma Tarefa (Task) de um Projeto específico, consultando o índice
desafio.delete('/projects/:id/tasks/:index', checkProjectExists, checkTaskExists, (req, res) => {
  const { id } = req.params;
  const { index } = req.params;

  const project = projects.find(p => p.id == id);

  project.tasks.splice(index, 1);

  return res.json(projects);
});



//Start Server
desafio.listen(3000);