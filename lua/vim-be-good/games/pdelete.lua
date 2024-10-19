local GameUtils = require("vim-be-good.game-utils")
local log = require("vim-be-good.log")

local randomOffset = {
    noob = 10,
    easy = 12,
    medium = 14,
    hard = 16,
    nightmare = 18,
    tpope = 20,
}

local instructions = {
    "Test your ability by deleting the paragraph inbetween the stars (asterisks) or delete the whole paragraph all together, up to you.",
    "Use motions like (  Vkd or Vjd  ) example, V5kd uses relative line numbers. or use (  dip or dap  ) to delete the whole thing",
    "Note: Capital V or Shift-V is just for Visual line mode. This allows you to highlight the whole line compared to lowercase v. you must be in normal mode to use this. press ESC for normal mode",
    "Use any motions you like if you have any better ones. This is a playground for your own benefit.",
}

local PDelete = {}
function PDelete:new(difficulty, window)
    log.info("New", difficulty, window)
    local round = {
        window = window,
        difficulty = difficulty,
        fixedOffset = vim.g["vim_be_good_delete_me_fixed_offset"],
        randomOffset = vim.g["vim_be_good_delete_me_random_offset"] or randomOffset[difficulty],
    }

    self.__index = self
    return setmetatable(round, self)
end

function PDelete:getInstructions()
    return instructions
end

function PDelete:getConfig()
    log.info("getConfig", self.difficulty, GameUtils.difficultyToTime[self.difficulty])
    return {
        roundTime = GameUtils.difficultyToTime[self.difficulty],
    }
end

function PDelete:checkForWin()
    local lines = self.window.buffer:getGameLines()
    local found = false
    local idx = 1

    while idx <= #lines and not found do
        local line = lines[idx]
        found = string.match(
            line,
            "local paragraphText = 'delete this whole paragraph inside of the ********** or the whole paragraph!'"
        )

        idx = idx + 1
    end
    log.info("InsidePDelete:checkForWin(", idx, "): ", found)

    return not found
end

function PDelete:render()
    local paragraphLength = math.random(2, 5)
    local lines = GameUtils.createEmpty(20 + #instructions)
    local deleteMeIdx = math.random(2, 20 + #instructions - paragraphLength)
    local goHigh = deleteMeIdx < 17 + #instructions and math.random() > 0.5

    local cursorIdx
    if goHigh then
        cursorIdx = math.random(deleteMeIdx + 1, 20 + #instructions)
    else
        cursorIdx = math.random(1, deleteMeIdx - 1)
    end

    lines[deleteMeIdx - 1] =
        "****************************************************************************************************"
    for i = 0, paragraphLength - 1 do
        lines[deleteMeIdx + i] =
            "local paragraphText = 'delete this whole paragraph inside of the ********** or the whole paragraph!'"
    end

    lines[deleteMeIdx + paragraphLength] =
        "****************************************************************************************************"
    return lines, cursorIdx
end

function PDelete:name()
    return "pdelete"
end

return PDelete
