const loadConfig = require("./yaml-config")
const mongo = require("mongodb").MongoClient
const { keys } = require("lodash")

const load = async () => {
    const config = loadConfig("./import.config.yml")
    // console.log("config", config)
        
    let client = await mongo.connect(config.mongo.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    let db = client.db(config.mongo.database)

    let commitCollection = db.collection(config.mongo.commits)
    // console.log("branch", config.branch)
    let lastCommit = await commitCollection.aggregate(
        [   {
                $match: { branch: config.branch || "master"}
            },    
            {
                '$sort': {
                  'createdAt': -1
                }
            }, 
            {
                '$limit': 1
            }, 
            {
                '$project': {
                  '_id': 0
                }
            }   ] 
        ).toArray()

    lastCommit = (lastCommit[0]) ? lastCommit[0].id : undefined
    let result = {}
    // console.log("commit", lastCommit)    

    if(lastCommit){
        let collections = keys(config.mongo.data)

        
        for( let i=0; i < collections.length; i++){
            // console.log(config.mongo.data[collections[i]], " > ", collections[i])
            let collection = db.collection(config.mongo.data[collections[i]])
            result[collections[i]] = await collection.find({commit: lastCommit}).toArray()
        }    
    }

    client.close()

    return result

}


module.exports = load