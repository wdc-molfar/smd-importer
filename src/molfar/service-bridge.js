const uuid = require("uuid").v4
const moment = require("moment")
const { last } = require("lodash")

const loadConfig = require("../utils/yaml-config")
const mongo = require("mongodb").MongoClient







const createCommit = branch => {
    
    return {
    
        id: uuid(),
        createdAt: new Date(),
        message:"import data",
        author: "@molfar source importer",
        branch: branch
    
    }

}    


const createBranch = branch => {
    let id = uuid()
    return `IMPORT-${last(id.split("-"))}`    
}


const prepare = data => {
    
    data.branch = createBranch()
    
    data.commit = createCommit(data.branch)
    
    data.sources = data.sources.map( d => {
        d.commit = data.commit.id
        delete d._id
        return d
    })

    data.labels = data.labels.map( d => {
        d.commit = data.commit.id
        delete d._id
        return d
    })

    data.scripts = data.scripts.map( d => {
        d.commit = data.commit.id
        delete d._id
        return d
    })

    return data

}


const upload = async data => {

    data = prepare(data)
    
    const config = loadConfig("./import.config.yml")
    // console.log("config", config)
        
    let client = await mongo.connect(config.mongo.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    
    let db = client.db(config.mongo.database)

    let sources = db.collection("sources")
    let labels = db.collection("tags")
    let scripts = db.collection("scanany")
    let commits = db.collection("commits")

    await sources.insertMany(data.sources)
    await labels.insertMany(data.labels)
    await scripts.insertMany(data.scripts)
    await commits.insertOne(data.commit)

    client.close()

    return data

} 


module.exports = upload