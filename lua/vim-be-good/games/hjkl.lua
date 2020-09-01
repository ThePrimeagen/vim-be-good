local GameUtils = require("vim-be-good.game-utils")
local log = require("vim-be-good.log")

local boardSizeOptions = {
    noob = 3,
    easy = 5,
    medium = 7,
    hard = 8,
    nightmare = 9,
    tpope = 10
}

local instructions = {
    "Remove the x with using only h,j,k,l, and x. Remember, this is for you to be bettter.",
    "Using the arrow keys only makes you dumber. Trust me, I am a scientist",
    "",
}

local HjklRound = {}
function HjklRound:new(difficulty, window)
    log.info("New", difficulty, window)
    local round = {
        window = window,
        difficulty = difficulty,
    }

    self.__index = self
    return setmetatable(round, self)
end

function HjklRound:getInstructions()
    return instructions
end

function HjklRound:getConfig()
    log.info("getConfig", self.difficulty, GameUtils.difficultyToTime[self.difficulty])
    return {
        roundTime = GameUtils.difficultyToTime[self.difficulty]
    }
end

function HjklRound:getRandomNumber(count)
    return math.random(1, count)
end

function HjklRound:checkForWin()
    local lines = self.window.buffer:getGameLines()
    local found = false
    local idx = 1

    while idx <= #lines and not found do
        local line = lines[idx]
        found = string.match(line, "x")

        idx = idx + 1
    end
    log.info("HjklRound:checkForWin(", idx, "): ", found)

    return not found
end

function HjklRound:render()
    local boardSize = boardSizeOptions[self.difficulty]
    log.info("HjklRound:render: " .. boardSize)
    local lines = GameUtils.createEmpty(boardSize)

    local xCol = 1
    local xLine = 1
    local cursorCol = 1
    local cursorLine = 1

    while (xLine == cursorLine or xCol == cursorCol ) do
        xCol = self:getRandomNumber(boardSize)
        xLine = self:getRandomNumber(boardSize)
        cursorCol = self:getRandomNumber(boardSize)
        cursorLine = self:getRandomNumber(boardSize)
    end
    log.info("HjklRound:render      xLine: ", xLine,      "      xCol: ", xCol)
    log.info("HjklRound:render cursorLine: ", cursorLine, " cursorCol: ", cursorCol)

    local idx = 1
    while idx <= #lines do
        local line = lines[idx]
        for i = 1, boardSize,1
        do
            if xLine == idx and xCol == i then
                line = line .. "x"
            else
                line = line .. " "
            end
        end
        lines[idx] = line
        idx = idx + 1
    end

    return lines, cursorLine, cursorCol
end

function HjklRound:name()
    return "hjkl"
end

return HjklRound


