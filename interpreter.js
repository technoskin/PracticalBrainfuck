const fs = require("fs")

const MEMORY_SIZE = 30000;
const memory = new Array(MEMORY_SIZE).fill(0);
let ipointer = 0;
let mpointer = 0;
let astack = [];
let input = "";
let output = "";

let variables = []

let myArgs = process.argv.slice(2);
let fileToRead = "./" + myArgs[0];

fs.readFile(fileToRead, 'utf8' , (err, data) => {


    if (err) throw err;

    // read #definitions

    let definitions = data.split("#defines")[1].split("#main")[0];

    variables += definitions.split("\n")[0].split(" ")

    definitions = definitions.split("\n")
    definitions.shift()
    definitions = definitions.join("\n")

    eval(definitions)

    // run #main

    let code = data.split("#main")[1];

    brainfuck(code);
})

function brainfuck(program) {
    let end = false;

    let letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

    while (!end) {
        switch (program[ipointer]) {
            case '>':
                if (mpointer == memory.length - 1)
                /* If we try to access memory beyond what is currently available, expand array */
                    memory.push(0, 0, 0, 0, 0);
                mpointer++;
                break;
            case '<':
                if (mpointer > 0)
                    mpointer--;
                break;
            case '+':
                memory[mpointer]++;
                break;
            case '-':
                memory[mpointer]--;
                break;
            case '.':
                output += memory[mpointer];
                break;
            case '!':
                output += String.fromCharCode(memory[mpointer]);
                break;
            case ',':
                memory[mpointer] = getInput();
                break;
            case '[':
                if (memory[mpointer]) { // If non-zero
                    astack.push(ipointer);
                } else { // Skip to matching right bracket
                    let count = 0;
                    while (true) {
                        ipointer++;
                        if (!program[ipointer]) break;
                        if (program[ipointer] === "[") count++;
                        else if (program[ipointer] === "]") {
                            if (count) count--;
                            else break;
                        }
                    }
                }
                break;
            case ']':
                //Pointer is automatically incremented every iteration, therefore we must decrement to get the correct value
                ipointer = astack.pop() - 1;
                break;
            case undefined: // We have reached the end of the program
                end = true;
                break;
            default: // We ignore any character that are not part of regular Brainfuck syntax
                break;
        }
        ipointer++;

        // INTERJECT VARIABLES

        if (letters.split("").includes(program[ipointer])) {
            let c1 = program.slice(ipointer)
            let c2 = c1.split("=")[0]
    
            if (variables.includes(c2)) {
                let jump = c2.length;
                c2.trim()
                eval(c2 += "(mpointer)")
                ipointer += jump;
            }
        }
        


    }
    console.log(output + "\n\n");

    return output;
}

function sendOutput(value) {
    output += String.fromCharCode(value);
    if (value == 32) {
        value = " "
    }
    output += value;
    
}

function getInput() {
    // Set a default value to return in case there is no input to consume
    let val = 0;

    // If input isn't empty
    if (input) {
        // Get the character code of the first character of the string
        val = input.charCodeAt(0);
        // Remove the first character from the string as it is "consumed" by the program
        input = input.substring(1);
    }

    return val;
}