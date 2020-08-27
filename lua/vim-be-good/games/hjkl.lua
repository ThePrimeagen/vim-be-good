local GameUtils = require("vim-be-good.game-utils")
local log = require("vim-be-good.log")

local boardSizeOptions = {
    noob = 3,
    easy = 4,
    medium = 5,
    hard = 6,
    nightmare = 8,
    tpope = 10
}

local instructions = {
    "Remove the x with using only h,j,k,l, and x. Remember, this is for you to be bettter.",
    "Using the arrow keys only makes you dumber. Trust me, I am a scientist",
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
    local lines = GameUtils.createEmpty(boardSize)

    local cursorIdx = 0

    local xX = 0
    local xY = 0
    local cX = 0
    local cY = 0

    while (xX == cX or xY == cY ) do
        xX = self:getRandomNumber(boardSize)
        xY = self:getRandomNumber(boardSize)
        cX = self:getRandomNumber(boardSize)
        cY = self:getRandomNumber(boardSize-1)
    end

    local idx = 1
    while idx <= #lines do
        lines[idx] = "    "
        idx = idx + 1
    end
    lines[xY] = lines[xY].sub(1,xX)..'x'..lines[xY].sub(xX,4)

    return lines, cursorIdx
end

function HjklRound:name()
    return "hjkl"
end

return HjklRound


