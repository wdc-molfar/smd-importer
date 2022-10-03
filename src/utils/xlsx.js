const xlsx = require("xlsx")
const path = require("path")
const { keys, uniq, isArray, set, get, isString } = require("lodash")
const { makeDir } = require("./file-system")

let newWb = () => xlsx.utils.book_new()

let loadXlsxWb = async (filename) => {
	let d = await xlsx.readFile(path.resolve(filename))
	return d
}

let wb2json = wb => {
	for(i in wb.Sheets){
		wb.Sheets[i] = xlsx.utils.sheet_to_json(wb.Sheets[i]);	
	}
	return wb.Sheets	
}

const loadXlsx = async filename => {
	let wb = await loadXlsxWb(path.resolve(filename))
	return wb2json(wb)
}

let aoa2ws = aoa => xlsx.utils.aoa_to_sheet(aoa)

let addWs = (wb, ws, ws_name) => {
	xlsx.utils.book_append_sheet(wb, ws, ws_name)
}

let writeXlsxWb = (wb, filename) => {
	xlsx.writeFile(wb, path.resolve(filename))
}	


const resolveFile = (filePath, defaultFilename) => {
	const d = path.parse(path.resolve(filePath))
	return (d.ext)
				?  filePath
				: `${filePath}/${defaultFilename}`
}

const prepareData = async filepath => {
	let wb = await loadXlsxWb(resolveFile(filepath))
	let imports = wb2json(wb)
	imports = imports[keys(imports)[0]]

	imports = imports.map( d => {
		res = {}
		keys(d).forEach( key => {
			set(res, key, d[key])
		})
		res.info.labels = res.info.labels.split(",").map( d => d.trim())
		return res
	})

	return imports
}



const saveData = async (outputFile, sheet, fields, data) => {

	let savedData = ([
		fields.map( f => (isString(f)) ? f : f.field )
	]).concat( data.map( d => 
				fields.map( f => {
					let field = (isString(f)) ? f : f.field
					let transform = f.transform || (d => d)
					return transform( get(d, field) )
				})	
	))

	
	let resWb = newWb()
	addWs(resWb, aoa2ws(savedData), sheet)	
	await makeDir(path.dirname(outputFile))
	writeXlsxWb(resWb, path.resolve(outputFile))
}





module.exports = {
	loadXlsx,
	loadXlsxWb,
	wb2json,
	aoa2ws,
	writeXlsxWb,
	addWs,
	newWb,
	resolveFile,
	prepareData,
	saveData
}