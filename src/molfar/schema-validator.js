const ast = require("yaml-ast-parser")
const Ajv = require("ajv")

const ajv = new Ajv({ allErrors: true })

const addFormats = require("ajv-formats")
addFormats(ajv)

const ajvErrors = require("ajv-errors")
ajvErrors(ajv)


const YAML = require("js-yaml")
 

const findRange = (node, path) => {
	let p = path.map( d => d )
	let key = (node.key) ? p.splice(0,1)[0] : p[0]
	if(node.key && node.key.value == key && p.length == 0) return [ node.key.startPosition,node.key.endPosition ] 
	
	
	if(node.value && node.value.items ) {
		key = p.splice(0,1)[0]
		// console.log(JSON.stringify(key),node.value.items)
		if(p.length == 0) return [ node.value.items[key].startPosition, node.value.items[key].endPosition ]
		
		let res = findRange(node.value.items[key], p)
		if (res) return res
	}

	if(node.value && node.value.mappings) {
		for (let n in node.value.mappings){
			let res = findRange(node.value.mappings[n], p)
			if (res) return res
		}
	}

	if(node.mappings) {
		for (let n in node.mappings){
			let res = findRange(node.mappings[n], p)
			if (res) return res
		}
	}
		
}

const pos2line = (str, pos) => str.substr(0,pos[0]).split("\n").length -1


const findLine = (astDoc, path, doc) => {
	path = path.split("/").filter(d => d).map( d => {
		if(Number.isNaN(Number.parseInt(d))) return d
		return Number.parseInt(d)	
	})

	let range = ( path.length > 0 ) ? findRange(astDoc, path) : [0, 0]
	return pos2line(doc, range) 
}



const Validator = class {
	
	constructor (schemaYaml){
		let schema = YAML.load(schemaYaml)
		this.v = ajv.compile(schema)
	}

	validate(doc){
		doc = doc.replace(/\t/gm," ")
		let astDoc = ast.load(doc)

		let json
	
		this.errors = null


		try {
			json = YAML.load(doc)
		} catch (e) {
			this.errors = [{
				line: e.mark.line,
				snippet: e.mark.snippet,
				reason: e.reason
			}]
			return false
		}

		
		if( json ) {
			let result = this.v(json)
			if ( result == false) {
				this.errors = this.v.errors.map( e => ({
					line: findLine(astDoc,e.instancePath,doc),
					snippet: e.instancePath,
					reason: e.message
				}))
				return false
			} else {
				return true
			}
		}
		
		return false
	}
}

module.exports = Validator	
