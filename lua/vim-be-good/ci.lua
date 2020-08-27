local GameUtils = require("vim-be-good.game-utils")
local log = require("vim-be-good.log")
local gameLineCount = 20

local instructions = {
    "Replace the outer container (if (...) { ... } or [ ... ]) with \"bar\"",
    "",
    "e.g.:",
    "[                    [",
    "   item1,            bar",
    "   item1,       ->   ]",
    "   item1,",
    "   item1,",
    "]",
}

local CiRound = {}
function CiRound:new(difficulty, window)
    log.info("New", difficulty, window)
    local round = {
        window = window,
        difficulty = difficulty,
        randomWord = "",
        ifStatement = false
    }

    self.__index = self
    return setmetatable(round, self)
end

function CiRound:getInstructions()
    return instructions
end

function CiRound:getConfig()
    log.info("getConfig", self.difficulty, GameUtils.difficultyToTime[self.difficulty])
    return {
        roundTime = GameUtils.difficultyToTime[self.difficulty]
    }
end

function CiRound:checkForWin()
    local lines = self.window.buffer:getGameLines()
    local trimmed = GameUtils.trimLines(lines)
    local concatenated = table.concat(trimmed)
    local lowercased = concatenated:lower()

    if self.ifStatement then
        return lowercased == "if (" .. self.randomWord .. ") {bar}"
    end

    return lowercased == "[bar]"
end

function CiRound:render()
    local lines = GameUtils.createEmpty(gameLineCount)
    local insertionIndex = GameUtils.getRandomInsertionLocation(gameLineCount, 6, #instructions)
    local goHigh = insertionIndex < gameLineCount / 2 and math.random() > 0.5
    self.ifStatement = math.random() > 0.5
    self.randomWord = GameUtils.getRandomWord()

    local cursorIdx
    if goHigh then
        cursorIdx = math.random(insertionIndex + 1, gameLineCount)
    else
        cursorIdx = math.random(1, insertionIndex - 1)
    end

    if self.ifStatement then
        lines[insertionIndex] = "if (" .. self.randomWord .. ") {"
        lines[insertionIndex + 2] = "    if (" .. GameUtils.getRandomWord() .. ") { "
        lines[insertionIndex + 3] = "        " .. GameUtils.getRandomWord()
        lines[insertionIndex + 4] = "    }";
        lines[insertionIndex + 5] = "}";
    else
        lines[insertionIndex] = "[";
        lines[insertionIndex + 1] = "    " .. GameUtils.getRandomWord() .. ","
        lines[insertionIndex + 2] = "    " .. GameUtils.getRandomWord() .. ","
        lines[insertionIndex + 3] = "    " .. GameUtils.getRandomWord() .. ","
        lines[insertionIndex + 4] = "    " .. GameUtils.getRandomWord() .. ","
        lines[insertionIndex + 5] = "]";
    end

    return lines, cursorIdx
end

function CiRound:name()
    return "ci{"
end

return CiRound
