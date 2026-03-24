import  express, { Router } from  'express'
import { isDeveloper } from '../MIddleware/isDeveloper.js'
import { getDashboard } from '../Controller/DevDashBoard.js'


const route : Router = express.Router()

route.get('/dashboard',isDeveloper,getDashboard)


export default route