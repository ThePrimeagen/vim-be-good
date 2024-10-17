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
    "Test your ability by hopping to the paragraph and then add or remove indents to the paragraph inbetween the stars (asterisks)",
    "To win the game, add or remove indents depending on if the paragraph has too little or too many.",
    "Use motions like   V<  or  V> for a default vim keymap",
    "MORE DETAILS:",
    "you can use Visual Line mode (Shift-v) to select the first or last line of the paragraph, then move up or down with your vertical motions. j or k",
    "SUGGESTION: i recommend learning how to hop using relative line numbers first",
    "once you have the full paragraph selected. press < to delete indents or > to add indents",
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
        local winString
        if numOfIndents == 0 then
            winString = "\tlocal paragraphText = 'please help me! I don't have any indents!'"
        else
            winString = "\tlocal paragraphText = 'please help me! I have too many indents!'"
        end
        found = true
        for i = 0, #lines, 1 do
            if winString == lines[i] then
                found = false
            end
        end
        idx = idx + 1
    end
    log.info("Indent:checkForWin(", idx, "): ", found)

    return not found
end

function Indent:render()
    numOfIndents = math.random(2) - 1

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
    if numOfIndents == 0 then
        indentString = "local paragraphText = 'please help me! I don't have any indents!'"
    else
        indentString = "\t\tlocal paragraphText = 'please help me! I have too many indents!'"
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
