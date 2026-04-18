import express, { Router } from 'express'
import isHr from '../Middleware/isHr.js'
import { createTask, DeleteTaskLibary, getAllTask, taskGetById, updateTask, getTaskCategories } from '../Controller/TaskLibaryController.js'
import Validate from '../Middleware/Validate.js';
import { taskLibraryValidate } from '../Validator/tasklibaryvalidate.js';

const route : Router =  express.Router()

route.get("/alltask",isHr,getAllTask);
route.get("/categories", isHr, getTaskCategories);
route.get('/specifictask/:id',isHr,taskGetById);
route.post('/create',isHr,Validate(taskLibraryValidate),createTask)
route.patch('/update/:id',isHr,Validate(taskLibraryValidate),updateTask)
route.delete('/delete/:id',isHr,DeleteTaskLibary)


export default route