local WindowHandler = require("vim-be-good.window");
local Menu = require("vim-be-good.menu");

local function menu()
    local windowHandler = WindowHandler:new(6)
    windowHandler:show()

    local menu = Menu:new(windowHandler)
    menu:render()
end

return {
    menu = menu
}


