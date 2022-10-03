const glob = require("fast-glob")
const fs = require("fs")
const fse = require("fs-extra")
const path = require("path")
const YAML = require("js-yaml")
const { extend } = require("lodash")

const writeFile = fs.writeFileSync

const getFileList = async ( pattern, options ) => {
    let res = await glob(pattern, options)
    return res.map( d => path.resolve(d))
}     

const getDirList = async (pattern, options) => {
    
	options = extend(
		{},
		{
			includeParentPath: false,
			absolitePath: false
		},

		options
	)

	pattern = ( /\/$/.test(pattern)) ? pattern : `${pattern}/`

    let filesAndDirectories = await fse.readdir(pattern);

    let directories = [];
    await Promise.all(
        filesAndDirectories.map(name =>{
            return fse.stat(pattern + name)
            .then(stat =>{
                if(stat.isDirectory()) directories.push(name)
            })
        })
    );

    if(options.includeParentPath){
    	directories = directories.map( d => pattern+d)
    	if(options.absolutePath){
    		directories = directories.map( d => path.resolve(d))
    	}
    }
    return directories;
}

const makeDir = async dir => await fse.mkdirs(path.resolve(dir))

const loadConfig = filename => YAML.load(fs.readFileSync(path.resolve(process.argv[2])).toString().replace(/\t/gm, " "))

const loadJSON = filename => JSON.parse(fs.readFileSync(path.resolve(filename)).toString())



module.exports = {
	getFileList,
	getDirList,
	makeDir,
	loadConfig,
    writeFile,
    loadJSON	
}

