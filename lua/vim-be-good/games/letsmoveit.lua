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
    "Test your ability by selecting the paragraph text and then move the paragraph inbetween the stars (asterisks)",
    "This game will require that you set the remaps below. These work in visual (v), visual line (shift-V), and visual block (ctrl-v) modes.",
    "vim.keymap.set('v', 'J', \":m '>+1<CR>gv=gv\")",
    "vim.keymap.set('v', 'K', \":m '<-2<CR>gv=gv\")",
    "add these to your keymaps.lua file or however you have your config setup.",
    "Instructions: Highlight the paragraph using one of the visual modes, then press Shift K or J to move up or down respectively",
    "You will win the round as soon as the game detects that the paragraph is inbetween the stars (asterisks)",
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
    log.info("LetsMoveIt:checkForWin(", idx, "): ", found)

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
