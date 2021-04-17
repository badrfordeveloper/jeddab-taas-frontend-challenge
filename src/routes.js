
import Login from './components/Login';





export default {
	mode:'history',
	routes:
	[
		{
			path:'/' , 
			component:Login,
			name:'Login'
		},{
			path:'/authrozition' , 
			component:Login,
			name:'Login'
		},
		
	]
};