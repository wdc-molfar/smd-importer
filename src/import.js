const loadConfig = require("./utils/yaml-config")
const { prepareData, saveData } = require("./utils/xlsx")
const loadDb = require("./utils/mongodb")
const merge = require("./molfar/merge-strategy")
const validate = require("./molfar/data-validator")
const resolve = require("./molfar/data-resolver")
const upload = require("./molfar/service-bridge")
const path = require("path")

const run = async () => {
	const config = loadConfig("./import.config.yml")
    
	let db = await loadDb()
	let imports = await prepareData(process.argv[2])
	imports = validate(db)(imports)

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


	let availableToImport = imports.map(d => d).filter(d => d.merge != "ignore")

	let sourceBranch = resolve(db)(availableToImport) 
	let uploadedData = merge.strategies.extend(sourceBranch, db.sources)


	let result = await upload({
			sources: uploadedData.target,
			labels: db.labels,
			scripts: db.scripts
		})
	
	console.log("@molfar import utility")
	console.log(`Remote branch from '${config.branch}'`)
	console.log(`Local branch from '${process.argv[2]}'`)

	console.log(`Remote target '${result.branch}', commit: ${result.commit.id}`)

	
}

run()