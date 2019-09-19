const express = require('express')
const app = express()
const QRCode = require('qrcode')
const port = 3000
const scriptsPath = __dirname + '/jsbox_scripts'
const fs = require('fs')

const ERROR_PACKAGE_NOT_FOUND = {
    message: "Script/Package not found",
    id: "script_not_found"
}

const ERROR_PACKAGE_METADATA_MISSING = {
    message: "Package metadata is incomplete",
    id: "package_metadata_missing"
}

// app.use(express.static('/static'))


app.get('/appstorebadge', (req, res) => {
    res.sendFile(`${__dirname}/static/app-store-badge.png`)
})


app.get('/:scriptName', (req, res) => {
    const requrl = req.protocol + '://' + req.get('Host') + req.url
    const script = req.params.scriptName


    const baseURL = `./jsbox_scripts/${script}`
    try {
        var info = JSON.parse(fs.readFileSync(`${baseURL}/info.json`, "utf8"))
    } catch(e) { res.status(404).send("Script not found") }

    if (info.name == undefined || info.version == undefined) {
        res.status(404).send("Script not found")
    }

    try {
        var templateString = fs.readFileSync(`./template_details.html`, "utf8")
    } catch(e) { res.status(404).send("Script not found") }

    // 
    console.log(`requrl: ${requrl}/data, name=${info.name}`)
    const uri = `jsbox://import?url=${requrl}/data&name=${info.name}`

    templateString = templateString
        .replace(/###scriptName###/g, info.name)
        .replace(/###downloadURL###/g, `${script}/data`)
        .replace(/###installURL###/g, encodeURI(uri))

    QRCode.toString(uri).then(console.log)


    // UNUSED COLORS STUFF //

    /* , {
        // color: {
        //   dark: '#FFF',  // White dots
        //   light: '#0000' // Transparent background
        // }
      } */

    QRCode.toDataURL(uri).then(base64 => {
        console.log(uri)
        templateString = templateString.replace(/###qrcode###/g, base64)

        if (templateString != undefined) res.status(200).send(templateString)
        else res.status(404).return("eh")
    }).catch(err => {
        res.status(404).return(err)
    })
})

app.get('/:scriptName/version', (req, res) => {
    fs.readFile(`./jsbox_scripts/${req.params.scriptName}/info.json`, "utf8", (err, data) => {
        if (err) res.status(404).send(ERROR_PACKAGE_NOT_FOUND)
        else {
            try { data = JSON.parse(data) } catch {}
            if (data.version != undefined) res.send(data.version)
            else res.status(404).send(ERROR_PACKAGE_METADATA_MISSING)
        }
    })
})

app.get('/:scriptName/data', (req, res) => {
    fs.readFile(`./jsbox_scripts/${req.params.scriptName}/info.json`, "utf8", (err, data) => {
        if (err) res.status(404).send(ERROR_PACKAGE_NOT_FOUND)
        else {
            try { data = JSON.parse(data) } catch {}
            if (['js', 'box'].includes(data.type)) {
                res.sendFile(`${scriptsPath}/${req.params.scriptName}/data.${data.type}`);
            }
            else res.status(404).send(ERROR_PACKAGE_METADATA_MISSING)
        }
    })
})

function buildTemplateForDetailView(script, requrl) {
    const baseURL = `./jsbox_scripts/${script}`
    try {
        var info = JSON.parse(fs.readFileSync(`${baseURL}/info.json`, "utf8"))
    } catch(e) { return null }

    if (info.name == undefined || info.version == undefined) {
        return null
    }

    try {
        var templateString = fs.readFileSync(`./template_details.html`, "utf8")
    } catch(e) { return null }

    

    templateString = templateString
        .replace(/###scriptName###/g, info.name)
        .replace(/###downloadURL###/g, `${script}/data`)
        .replace(/###installURL###/g, encodeURI(uri))


    QRCode.toDataURL(uri, function (err, url) {
        console.log(url)
    })

    let oof = QRCode.toDataURL('I am a pony!')
    console.log(oof)

    return templateString
}

app.listen(port, () => console.log(`JSBox Scripts server running on port ${port}!`))
