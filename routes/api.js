var express = require('express');
var request = require('request');
var MultiKeyCache = require('multi-key-cache')

var multiKeyCache = new MultiKeyCache()
var router = express.Router()



router.get('/token', function(req, res, next) {

    (async (res) => {
        res.send(await getNewToken())
    })(res)
        
    
});

router.get('/getschedule', function(req, res, next) {
 
  (async (res) => {
    let response = []
      let token = await getNewToken()
      let groups = await getGroups(token)
      /*
      for(group in  groups){
        console.log(" Group " + group+" of "+ groups.length)
        groupId = groups[group].id
        groupName = groups[group].name
      */
        groupId='05b6b46b-379d-4c29-8c3e-18fde0ef2abe'
        groupName ="FDC Prod"
        let datasets = await getDatasets(token,groupId)
        for(dataset in datasets){
          console.log(" Dataset  " +dataset+" of "+ datasets.length)
          datasetId = datasets[dataset].id
          datasetName = datasets[dataset].name
          let refreshes = await getDataSetRefreshes(token,groupId, datasetId)
          for(refresh in refreshes){
            console.log(refresh+" of "+ refreshes.length)
            refreshId=refreshes[refresh].id
            refreshType=refreshes[refresh].refreshType
            refreshStartTime=refreshes[refresh].startTime
            refreshEndTime=refreshes[refresh].endTime
            refreshStatus = refreshes[refresh].status
            
            response.push({
              "groupId":groupId,
              "groupName":groupName,
              "datasetName":datasetName,
              "datasetId":datasetId,
              "refreshId":refreshId,
              "refreshType":refreshType,
              "refreshStartTime":refreshStartTime,
              "refreshEndTime":refreshEndTime,
              "refreshStatus":refreshStatus
            })
            
            //console.log(refreshId)
          }
        }

      //}
      //console.log(response)
      res.send(response)
  })(res)
      
  
});

const getNewToken = async() => {
  var requestBody = 'grant_type=password&client_id='+process.env.CLIENTID+'&username='+process.env.PBIUSERNAME+'&password='+process.env.PBIPASSWORD+'&resource=https://analysis.windows.net/powerbi/api'
  //console.log(requestBody)
	//res.send(requestBody)
	return new Promise(function(resolve,reject) {
      request({
        url: "https://login.microsoftonline.com/freshdirect.onmicrosoft.com/oauth2/token",
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded",  // 
        },
        body: requestBody
    }, function (error, response, body){

    if(!error) {
      resolve(JSON.parse(response.body).access_token);
    }
      
    })
  }
  )
}


const getGroups = async(token) => {
		
		return new Promise(function(resolve,reject) {
      request({
		    url: "https://api.powerbi.com/v1.0/myorg/groups?$filter=isOnDedicatedCapacity%20eq%20true",
		    method: "GET",
		    headers: {
		        "content-type": "application/json",
		        "Authorization": "Bearer "+token
		    }
		}, function (error, response, body){
				if(!error) {
          if(response.body)
						resolve(JSON.parse(response.body).value);
          }
          
	      });
		});
}


const getDatasets= async(token,groupId) => {
		
  return new Promise(function(resolve,reject) {
    request({
      url: "https://api.powerbi.com/v1.0/myorg/groups/"+groupId+"/datasets?$filter=isRefreshable%20eq%20true",
      method: "GET",
      headers: {
          "content-type": "application/json",
          "Authorization": "Bearer "+token
      }
  }, function (error, response, body){
      if(!error) {
        if(response.body)
        
          resolve(JSON.parse(response.body).value);
        }
        
      });
  });
}

const getDataSetRefreshes= async(token,groupId, datasetId) => {
    //console.log(token)
    //console.log(datasetId)
  return new Promise(function(resolve,reject) {
    request({
      url: "https://api.powerbi.com/v1.0/myorg/groups/"+groupId+"/datasets/"+datasetId+"/refreshes?$top=1000",
      method: "GET",
      headers: {
          "content-type": "application/json",
          "Authorization": "Bearer "+token
      }
  }, function (error, response, body){
      if(!error) {
        if(response.body)
    //    console.log(JSON.parse(response.body).value)
          resolve(JSON.parse(response.body).value);
        }
        
      });
  });
}


module.exports = router;