const Discord = require("discord.js")
const fetch = require("node-fetch")
const keepAlive = require("./server")
const Database = require("@replit/database")


const db = new Database()
const client = new Discord.Client()

//triggering variable words
const sadWords = ["sad", "depressed", "unhappy", "angry", "tired", "stressed", "frustrated"]
//list of encouraging phrases
const starterEncouragments = ["Keep it up, you're doing great!", "Hang in there!", "Your are an amazing person, you know!", "After rain comes sunshine"]

db.get("encouragments").then(encouragments => {
    if (!encouragments || encouragments.length < 1) {
        db.set("encouragments", starterEncouragments)
    }
})

db.get("responding").then(value => {
    //first time running
    if (value == null) {
        db.set("responding", true)
    }
})

//add encouragments the database
function updateEncouragements(encouragingMessage) {
    db.get("encouragments").then(encouragments => {
        encouragments.push([encouragingMessage])
        db.set("encouragments", encouragments)
    })
}

// remove encouragments from the database
function deleteEncouragements(index) {
    db.get("encouragments").then(encouragments => {
        if (encouragments.length > index) {
            encouragments.splice(index, 1)
            db.set("encouragments", encouragments)
        }
    })
}


function getQuote() {
    return fetch("https://zenquotes.io/api/random")
        .then(res => {
            return res.json()
        })
        .then(data => {
            return data[0]["q"] + " -" + data[0]["a"]
        })
}


function getKanyeQuote() {
    return fetch("https://api.kanye.rest/")
        .then(res => {
            return res.json()
        })
        .then(data => {
            return data.quote + " - " + "Kanye West"
        })
}

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
})

client.on("message", msg => {
    if (msg.author.bot) return

    //check if messages include the word $inspire, return an inspirational quote
    if (msg.content === "need inspiration" || "not inspiring") {
        getQuote().then(quote => msg.channel.send(quote))
    }

    //check if messages include Kanye West, return a KW quote
    if (msg.content.toLowerCase() === "Kanye") {
        getKanyeQuote().then(quote => msg.channel.send(quote))
    }

    db.get("responding").then(responding => {
        if (responding && sadWords.some(word => msg.content.includes(word))) {
            db.get("encouragments").then(encouragments => {
                const encouragment = encouragments[Math.floor(Math.random() * encouragments.length)]
                msg.reply(encouragment)
            })
        }
    })

    if (msg.content.startsWith("$new")) {
        encouragingMessage = msg.content.split("$new ")[1]
        updateEncouragements(encouragingMessage)
        msg.channel.send("New encouraging message added.")
    }
    if (msg.content.startsWith("$del")) {
        index = parseInt(msg.content.split("$del ")[1])
        deleteEncouragements(index)
        msg.channel.send("Encouraging message deleted.")
    }

    if (msg.content.startsWith("$list")) {
        db.get("encouragments").then(encouragments => {
            msg.channel.send(encouragments)
        })
    }
    if (msg.content.startsWith("$responding")) {
        value = msg.content.split("responding ")[1]
        if (value.toLowerCase() == "true") {
            db.set("responding", true)
            msg.channel.send("Responding is on.")
        } else {
            db.set("responding", false)
            msg.channel.send("Responding is off.")
        }
    }
})
keepAlive()
client.login(process.env.TOKEN)

