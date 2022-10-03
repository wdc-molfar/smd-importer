
const loadDb = require("./utils/mongodb")
const { prepareData, saveData } = require("./utils/xlsx")
const merge = require("./molfar/merge-strategy")
const validate = require("./molfar/data-validator")
const path = require("path")

const run = async () => {
	let db = await loadDb()
	let imports = await prepareData(process.argv[2])
	imports = validate(db)(imports)
	console.log(JSON.stringify(imports, null," "))
	let exportFilePath = path.resolve(`${path.dirname(process.argv[2])}/${path.basename(process.argv[2],".xlsx")}.validation.xlsx`)
	
	await saveData(exportFilePath, "validation", [
		"info.name",
		"info.description",
		{ field:"info.labels", transform: value => value.join(", ") },
		"scanany.script",
		"scanany.params",
		"merge",
		"status",
		"validation"
	], imports)



	console.log("Save validation result into", exportFilePath)
}

run()