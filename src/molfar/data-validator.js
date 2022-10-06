const { uniqBy, extend, find } = require("lodash")
const SchemaValidator = require("./schema-validator")
const cron = require('node-cron')

let data

const shouldBeUniqueName = sources => {

	let uniqueSourceNames = uniqBy( sources.map(d => d.info.name), d => d )
								.map( d => ({
									name: d,
									items: sources.filter( s => s.info.name == d )
								}))

	sources = sources.map( d => {
		let f = find(uniqueSourceNames, n => n.name == d.info.name)
		if( f.items.length > 1){
			d.merge = "ignore"
			d.status = "ERROR"
			d.validation = d.validation || ""
			d.validation += `Doublicate name '${d.info.name}' in ${f.items.map( i => i.index + 2).join(", ")} rows.\r\n`
		} else {
			let s = find(data.sources, n => n.info.name == d.info.name)
			d.merge = (!s) ? "insert" : "update"
		}
		return d
	})								

	return sources

}

const shouldBeLabelsResolved = sources => {

	sources = sources.map( d => {
		let noResolvedLabels = []
		d.info.labels.forEach( l => {
			let f = find(data.labels, cl => cl.label == l)
			if(!f) noResolvedLabels.push(l)
		})
		if(noResolvedLabels.length > 0){
			d.merge = "ignore"
			d.status = "ERROR"
			d.validation = d.validation || ""
			d.validation += `Labels: ${noResolvedLabels.map( l => "'"+l+"'").join(", ")} not resolved.\r\n`
		}
		return d
	})
	
	return sources

}

const shouldBeScananyResolved = sources => {

	sources = sources.map( d => {
		let f = find(data.scripts, sl => sl.name == d.scanany.script)
		
		if(!f){
			d.merge = "ignore"
			d.status = "ERROR"
			d.validation = d.validation || ""
			d.validation += `Scanany script: '${d.scanany.script}' not resolved.\r\n`
		}
		return d
	})
	
	return sources
}

const shouldBeCorrectScananyParams = sources => {

	sources = sources.map( d => {
		
		let message = ""
	
		let f = find(data.scripts, sl => sl.name == d.scanany.script)
		
		if(f){
			if ( f.schema && f.schema.trim()){
				if(d.scanany.params && d.scanany.params.trim()){
					let validator = new SchemaValidator(f.schema)
					let res = validator.validate(d.scanany.params)
					if(!res) {
						message = "Task validation:\r\n"+validator.errors.map( e => `Line ${e.line}: ${e.reason}`).join("\r\n")
					}

				} else {
					message = "no source task"
				}
			}
			d.status = (message) ? "WARNING" : ""
			d.validation = d.validation || ""
			d.validation += `${message}\r\n`
		}
		
		return d
	})
	
	return sources
}

const shouldBeCorrectCron = sources => {

	sources = sources.map( d => {
			let message = ""
			if(d.schedule && !cron.validate(d.schedule.cron)){
				d.status = "WARNING"
				d.validation = d.validation || ""
				d.validation += `Invalid cron value\r\n`
			}
			
		return d
	})
	
	return sources
}



const validateSources = sources => {

	sources = sources.map( (d, index) => extend(d, {index}))
	sources = 	shouldBeScananyResolved ( 
				shouldBeLabelsResolved ( 
				shouldBeUniqueName(
				shouldBeCorrectScananyParams(
				// shouldBeCorrectCron(
					sources
					// ) 
				))))
	return sources
}


module.exports = collections => {
	data = collections
	return validateSources
}    