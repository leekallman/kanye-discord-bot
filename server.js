const express = require("express")

//create server
const server = express()

// create route
server.all("/", (req, res) => {
    res.send("Bot is running!")
})

//start the server
function keepAlive() {
    server.listen(3000, () => {
        console.log("Server is ready.")
    })
}

module.exports = keepAlive