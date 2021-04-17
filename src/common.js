export default{

	methods:{
		async callApi(method,url,dataObj){
			try
			{
				return await this.$axios({
					method:method,
					url:url,
					data:dataObj
				});
				
			}
			catch(e){
				return e.response
			}
			
		},
		//variant : default, primary, secondary,danger,warning,success,info .
	/* 	 makeAlert(variant = null ,content) {
	        this.$bvToast.toast(content, {
	          title: `${variant || 'default'}`,
	          variant: variant,
	          solid: true,
	          autoHideDelay:5000
	        })
	      } */
	},
}