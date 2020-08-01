local GameUtils = require("vim-be-good.game-utils")

local randomOffset = {
    noob = 10,
    easy = 12,
    medium = 14,
    hard = 16,
    nightmare = 18,
    tpope = 20,
}

local instructions = {
    "Test your ability to hop by relative line numbers",
    "To win the game, delete the line that says \"DELETE_ME\"",
}

local RelativeRound = {}
function RelativeRound:new(diffculty, buffer)
    local round = {
        buffer = buffer,
        difficulty = diffculty,
        fixedOffset = vim.g["vim_be_good_delete_me_fixed_offset"],
        randomOffset = vim.g["vim_be_good_delete_me_random_offset"] or randomOffset[diffculty],
    }

    self.__index = self
    return setmetatable(round, self)
end

function RelativeRound:getInstructions()
    return instructions
end

function RelativeRound:getConfig()
    return {
        timing = GameUtils.difficultyToTime[self.diffculty]
    }
end

function RelativeRound:render()
    local lines = GameUtils.createEmpty(20)

    local deleteMeIdx = math.random(1, 20)
    local goHigh = deleteMeIdx < 17 and math.random() > 0.5

    local cursorIdx
    if goHigh then
        cursorIdx = math.random(deleteMeIdx + 1, 20)
    else
        cursorIdx = math.random(1, deleteMeIdx - 1)
    end

    lines[deleteMeIdx] = " DELETE ME"

    return lines
end

return RelativeRound


