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

local LetsMoveIt = {}
function LetsMoveIt:new(difficulty, window)
    log.info("New", difficulty, window)
    local round = {
        window = window,
        difficulty = difficulty,
        fixedOffset = vim.g["vim_be_good_delete_me_fixed_offset"],
        randomOffset = vim.g["vim_be_good_delete_me_random_offset"] or randomOffset[difficulty],
    }

    self.__index = self
    self.winIdx = 0
    self.switchCheck = 0

    return setmetatable(round, self)
end

function LetsMoveIt:getInstructions()
    return instructions
end

function LetsMoveIt:getConfig()
    log.info("getConfig", self.difficulty, GameUtils.difficultyToTime[self.difficulty])
    return {
        roundTime = GameUtils.difficultyToTime[self.difficulty],
    }
end

function LetsMoveIt:checkForWin()
    local lines = self.window.buffer:getGameLines()
    local found = false
    local idx = 1
    while idx <= #lines and not found do
        found = true
        if lines[self.winIdx] ~= lines[self.winIdx + 1] then
            found = false
            break
        end
    end
    log.info("InsidePDelete:checkForWin(", idx, "): ", found)

    return not found
end

function LetsMoveIt:render()
    local numOfLines = 20
    self.winIdx = math.random(#instructions + 1, #instructions + numOfLines)

    local paragraphLength = math.random(1, 3)
    local paragraphIdxMin
    local paragraphIdxMax
    if self.winIdx > #instructions + numOfLines / 2 then
        paragraphIdxMin = self.winIdx - 8 + #instructions
        paragraphIdxMax = self.winIdx - 1 - paragraphLength
    else
        paragraphIdxMin = self.winIdx + 4
        paragraphIdxMax = #instructions + numOfLines - 8 - paragraphLength
    end
    local lines = GameUtils.createEmpty(numOfLines + #instructions)
    local paragraphIdx = math.random(paragraphIdxMin, paragraphIdxMax)
    local goHigh = paragraphIdx < numOfLines - 3 + #instructions and math.random() > 0.5

    local cursorIdx
    if goHigh then
        cursorIdx = math.random(paragraphIdx + 1, numOfLines + #instructions)
    else
        cursorIdx = math.random(1, paragraphIdx - 1)
    end

    lines[self.winIdx] = "***************************************"
    lines[self.winIdx + 1] = "***************************************"

    for i = 0, paragraphLength, 1 do
        lines[paragraphIdx + i] = "Please move me inbetween the stars or asterisks to win!"
    end

    return lines, cursorIdx
end

function LetsMoveIt:name()
    return "letsmoveit"
end

return LetsMoveIt
