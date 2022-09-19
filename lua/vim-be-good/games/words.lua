local GameUtils = require("vim-be-good.game-utils")
local log = require("vim-be-good.log")
local gameLineCount = 5

local instructions = {
    "use w and dw to delete the different word in the line",
}

local Words = {}
function Words:new(difficulty, window)
    log.info("NewWords", difficulty, window)
    local round = {
        window = window,
        difficulty = difficulty,
    }

    self.__index = self
    return setmetatable(round, self)
end

function Words:getInstructions()
    return instructions
end

function Words:getConfig()
    log.info("getConfig", self.difficulty, GameUtils.difficultyToTime[self.difficulty])

    local one = GameUtils.getRandomWord()
    local two = GameUtils.getRandomWord()
    while(two == one)
	do
		two = GameUtils.getRandomWord()
	end 
    local round = { }
    local expected = { }
    local idx = math.ceil(math.random() * 6);
    for i = 1, 6 do
        if i == idx then
            table.insert(round, two);
        else
            table.insert(round, one);
            table.insert(expected, one);
        end
    end

    self.config = {
        roundTime = GameUtils.difficultyToTime[self.difficulty],
        words = round,
        expected = table.concat(expected, " ")
    }

    return self.config
end

function Words:checkForWin()
    local lines = self.window.buffer:getGameLines()
    local trimmed = GameUtils.trimLines(lines)
    local concatenated = table.concat(GameUtils.filterEmptyLines(trimmed), "")
    local lowercased = concatenated:lower()

    local winner = lowercased == self.config.expected

    if winner then
        vim.cmd("stopinsert")
    end

    return winner
end

function Words:render()
    local lines = GameUtils.createEmpty(gameLineCount)
    local cursorIdx = 5

    lines[5] = table.concat(self.config.words, " ")

    return lines, cursorIdx
end

function Words:name()
    return "words"
end

return Words

