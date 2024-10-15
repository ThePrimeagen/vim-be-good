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
    "Test your ability to hop by relative line numbers to the paragraph and then delete it inbetween the stars (asterisks)",
    "To win the game, delete the whole paragraph in one go inbetween the stars (asterisks). Use motions like (Vkd, Vjd)",
}

local Indent = {}
local numOfIndents = math.random(2) - 1
function Indent:new(difficulty, window)
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

function Indent:getInstructions()
    return instructions
end

function Indent:getConfig()
    log.info("getConfig", self.difficulty, GameUtils.difficultyToTime[self.difficulty])
    return {
        roundTime = GameUtils.difficultyToTime[self.difficulty],
    }
end

function Indent:checkForWin()
    local lines = self.window.buffer:getGameLines()
    local found = false
    local idx = 1

    while idx <= #lines and not found do
        local line = lines[idx]
        found = string.match(line, "        local paragraphText = 'please help me! I have too many indents!'")

        idx = idx + 1
    end
    log.info("Indent:checkForWin(", idx, "): ", found)

    return not found
end

function Indent:render()
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

    local indentString

    lines[deleteMeIdx - 1] = "*************"
    if false then
        indentString = "local paragraphText = 'please help me! I don't have any indents!'"
    else
        indentString = "        local paragraphText = 'please help me! I have too many indents!'"
    end

    for i = 0, paragraphLength - 1 do
        lines[deleteMeIdx + i] = indentString
    end
    lines[deleteMeIdx + paragraphLength] = "*************"
    return lines, cursorIdx
end

function Indent:name()
    return "indent"
end

return Indent
