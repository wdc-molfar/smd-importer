const { find, uniq, flatten, findIndex } = require("lodash")
const uuid = require("uuid").v4

let data

const resolveSource = source => {

    let labels = data.labels
    let scripts = data.scripts
    let ids = labels.map(d => d.id)

    let s = source
    
    let old = find(data.sources, d => d.info.name == source.info.name)

    s.id = (old) ? s.id : uuid()
    
    s.info.labels = {
        ids: s.info.labels.map( l => find(labels, ll => l == ll.label).id),
        pathes: s.info.labels
    }

    s.info.labels.ids = s.info.labels.ids.filter(d => ids.includes(d))
    s.info.labels.pathes = s.info.labels.ids.map( d => find(labels, l => l.id == d).label)
    let p = uniq(
        flatten( 
            s.info.labels.pathes.map( d => {
                let a = d.split("/"). filter(d=>d)
                let res = []
                let current = ""
                for( let i=0; i<a.length; i++){
                    current += "/"+a[i]
                    res.push(current)
                }
                return res
            })
        )    
    )

    s.info.tags = p
    s.info.tagids = p.map(d => find(labels, l => l.label == d).id)
    
    let ff = find(scripts, d => d.name == s.scanany.script)
    s.scanany.id = (ff) ? ff.id : undefined
    
    // if(s.schedule) s.schedule.cron = s.schedule.cronParts.join(" ")
    delete s.merge
    delete s.index 
    delete s.status
    delete s.validation
    
    return s
    
}    


const resolveSources = sources => sources.map( s => resolveSource(s))


module.exports = collections => {
	data = collections
	return resolveSources
}    