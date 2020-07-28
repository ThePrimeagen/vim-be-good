-- I DON"T KNOW
local types = require("vim-be-good.types")
local bind = require("vim-be-good.bind")

local Menu = {}

local instructions = {
    "VimBeGood is a collection of small games for neovim which are",
    "intended to help you improve your vim proficiency.",
    "delete a line to select the line.  If you delete a difficulty,",
    "it will select that difficulty, but if you delete a game it ",
    "will start the game."
}

local credits = {
    "",
    "",
    "Created by ThePrimeagen",
    "Brandoncc",
    "polarmutex",
    "",
    "https://github.com/ThePrimeagen/vim-be-good",
    "https://twitch.tv/ThePrimeagen",
}

function Menu:new(window, onResults)
    local menuObj = {
        window = window,
        buffer = window.buffer,
        onResults = onResults,

        -- easy
        difficulty = types.difficulty[2],

        -- relative
        game = types.games[1],
    }

    window.buffer:clear()
    window.buffer:setInstructions(instructions)

    self.__index = self
    local createdMenu = setmetatable(menuObj, self)
    window.buffer:onChange(bind(createdMenu, "onChange"))

    return createdMenu
end

function Menu:onChange()
    local lines = self.window.buffer:getGameLines()
    print(lines)
end

local function createMenuItem(str, currentValue)
    if currentValue == str then
        return "[x] " .. str
    end
    return "[ ] " .. str
end

function Menu:render()
    local lines = {
        "",
        "Select a Game (delete from the list to select)",
        "----------------------------------------------",
    }

    for idx = 1, table.getn(types.games), 1 do
        table.insert(lines, createMenuItem(types.games[idx], self.game))
    end

    table.insert(lines, "")
    table.insert(lines, "Select a Difficulty (delete from the list to select)")
    table.insert(lines, "Noob diffculty is endless so it must be quit with :q")
    table.insert(lines, "----------------------------------------------------")

    for idx = 1, table.getn(types.difficulty), 1 do
        table.insert(lines, createMenuItem(types.difficulty[idx], self.difficulty))
    end

    for idx = 1, table.getn(credits), 1 do
        table.insert(lines, credits[idx])
    end

    self.window.buffer:render(lines)
end

return Menu

