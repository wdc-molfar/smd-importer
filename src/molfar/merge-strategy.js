
const { intersectionWith, differenceWith, find } = require("lodash")
const deepExtend = require("deep-extend")

let merge = {
   
    identity: d => d.id,
    
    comparator: (a,b) => merge.identity(a) == merge.identity(b),
   
    strategies:{

    	ignore: (source, target) => ({
                deletes: 0,
                inserts: 0,
                updates: 0,
                target: target
        }),
    	
        overwrite: (source, target) => ({
                deletes: target.length,
                inserts: source.length,
                updates: 0,
                target: source
        }),

    	extend: (source, target) => {
            let updated = intersectionWith(source, target, merge.comparator )
    		let inserted = differenceWith(source, target, merge.comparator )
            let res = target.map(d => d).concat(inserted.map(d => d))

            updated.forEach( u => {
                let f = find(res, d => merge.comparator(d,u))
                if(f) f = deepExtend(f,u)
            })

            return {
                deletes: 0,
                inserts: inserted.length,
                updates: updated.length,
                target: res
            }    
    	},

        merge: (source, target) => {
            let updated = intersectionWith(source, target, merge.comparator )
            let inserted = differenceWith(source, target, merge.comparator )
            let removed = differenceWith(target, source, merge.comparator )
            let res = differenceWith(target, removed, merge.comparator).map(d => d).concat(inserted.map(d => d))

            updated.forEach( u => {
                let f = find(res, d => merge.comparator(d,u))
                if(f) f = deepExtend(f,u)
            })

            return {
                deletes: removed.length,
                inserts: inserted.length,
                updates: updated.length,
                target: res
            }
        }
    }    
}



module.exports = merge