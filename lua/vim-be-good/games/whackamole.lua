local GameUtils = require("vim-be-good.game-utils")
local log = require("vim-be-good.log")

local instructions = {
    "Use vim movements to locate the character with the arrow under it as ",
    "quickly as possible. Then invert the character's case to win.",
    "",
}

local WhackAMoleRound = {}
function WhackAMoleRound:new(difficulty, window)
    log.info("New", difficulty, window)
    local round = {
        window = window,
        difficulty = difficulty,
    }

    self.__index = self
    self.__winLine = ""
    return setmetatable(round, self)
end

function WhackAMoleRound:getInstructions()
    return instructions
end

function WhackAMoleRound:getConfig()
    log.info("getConfig", self.difficulty, GameUtils.difficultyToTime[self.difficulty])
    return {
        roundTime = GameUtils.difficultyToTime[self.difficulty]
    }
end

function WhackAMoleRound:checkForWin()
    local lines = self.window.buffer:getGameLines()
    local found = false
    found = lines[1] == self.__winLine
    return found
end

function WhackAMoleRound:render()
    local sentence = GameUtils:getRandomSentence()
    local lines = GameUtils.createEmpty(2)

    lines[1] = sentence

    local foundLocation = false
    local chosenLocation = 0
    while not foundLocation do
        local location = math.random(1, string.len(sentence))
        if sentence:sub(location,location) ~= " " then
            chosenLocation = location
            foundLocation = true
        end
    end

    local pointerLine = ""
    local winSentence = ""
    for idx=1, #sentence do
        local c = sentence:sub(idx,idx)
        if idx == chosenLocation then
            pointerLine = pointerLine .. "^"
            if c == string.lower(c) then
                winSentence = winSentence .. string.upper(c)
            else
                winSentence = winSentence .. string.lower(c)
            end
        else
            pointerLine = pointerLine .. " "
            winSentence = winSentence  .. c
        end
    end
    lines[2] = pointerLine

    self.__winLine = winSentence

    local cursorIdx =  1

    return lines, cursorIdx
end

function WhackAMoleRound:name()
    return "whackamole"
end

return WhackAMoleRound


