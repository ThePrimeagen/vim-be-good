local WindowHandler = require("vim-be-good.window");
local Menu = require("vim-be-good.menu");
local GameRunner = require("vim-be-good.game-runner");

local function menu()
    local windowHandler = WindowHandler:new(6)
    windowHandler:show()

    local menu
    local gameRunner

    menu = Menu:new(windowHandler, function(game, difficulty)
        menu:close()

        local gameRunner = GameRunner:new({game}, difficulty, windowHandler)
        ok, msg = pcall(function() gameRunner:init() end, debug.traceback)
        if not ok then
            print("Error: Menu:new callback", msg)
        end
    end)

    menu:render()
end

return {
    menu = menu
}


